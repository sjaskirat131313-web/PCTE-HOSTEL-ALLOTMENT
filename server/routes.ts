import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { dbInstance, hashPassword, verifyPassword } from './db';
import { User, StudentProfile, RoomType, HostelRoom } from './types';

export const apiRouter = Router();

// In-memory token store for session verification
const tokenStore = new Map<string, { userId: string; role: string; expiresAt: number }>();

function createToken(userId: string, role: string): string {
  const token = `token_${crypto.randomUUID()}`;
  tokenStore.set(token, {
    userId,
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
}

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: User;
  profile?: StudentProfile;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.replace(/^Bearer\s+/, '');
  const session = tokenStore.get(token);
  if (!session || session.expiresAt < Date.now()) {
    // Also support fallback for development demo users if matching userId is sent
    const fallbackUser = dbInstance.getUserById(token);
    if (fallbackUser) {
      req.user = fallbackUser;
      if (fallbackUser.role === 'student') {
        req.profile = dbInstance.getProfileByUserId(fallbackUser.id);
      }
      return next();
    }
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  const user = dbInstance.getUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists.' });
  }

  req.user = user;
  if (user.role === 'student') {
    req.profile = dbInstance.getProfileByUserId(user.id);
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden: Administrative privileges required.' });
  }
  next();
}

// --- AUTH ROUTES ---

// 1. Login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = dbInstance.getUserByEmail(email.trim());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid college email or password.' });
  }

  const token = createToken(user.id, user.role);
  const profile = user.role === 'student' ? dbInstance.getProfileByUserId(user.id) : null;

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
    },
    profile,
  });
});

// 2. Register
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      role = 'student',
      rollNumber,
      course,
      academicYear,
      semester,
      gender,
      guardianName,
      guardianPhone,
      guardianRelation,
      permanentAddress,
      bloodGroup,
      adminSecretKey,
    } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ error: 'Please provide all required basic user fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = dbInstance.getUserByEmail(email.trim());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Role check: If registering as Admin, verify security key
    if (role === 'admin') {
      const validSecretKey = process.env.ADMIN_REGISTRATION_KEY || 'PCTE@ADMIN2026';
      if (!adminSecretKey || adminSecretKey !== validSecretKey) {
        return res.status(403).json({ error: 'Invalid Administrative Authorization Key.' });
      }
    } else {
      // Student validations
      if (!rollNumber || !course || !gender) {
        return res.status(400).json({ error: 'Student roll number, course, and gender are required.' });
      }
      const existingProfile = dbInstance.getData().studentProfiles.find(
        (p) => p.rollNumber.trim().toLowerCase() === rollNumber.trim().toLowerCase()
      );
      if (existingProfile) {
        return res.status(409).json({ error: `Roll number ${rollNumber} is already registered.` });
      }
    }

    const userId = `${role}-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const newUser: User = {
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: role as 'student' | 'admin',
      fullName: fullName.trim(),
      phone: phone.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await dbInstance.createUser(newUser);

    let studentProfile: StudentProfile | null = null;
    if (role === 'student') {
      studentProfile = {
        id: userId,
        userId: userId,
        rollNumber: rollNumber.trim(),
        course: course.trim(),
        academicYear: academicYear || '1st Year',
        semester: Number(semester) || 1,
        gender: gender || 'male',
        guardianName: guardianName?.trim() || 'Parent/Guardian',
        guardianPhone: guardianPhone?.trim() || phone,
        guardianRelation: guardianRelation || 'Father',
        permanentAddress: permanentAddress?.trim() || 'Ludhiana, Punjab',
        bloodGroup: bloodGroup || 'B+',
        allotmentStatus: 'not_applied',
        createdAt: now,
        updatedAt: now,
      };
      await dbInstance.upsertProfile(studentProfile);
    }

    const token = createToken(newUser.id, newUser.role);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        phone: newUser.phone,
      },
      profile: studentProfile,
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Registration failed.' });
  }
});

// 3. Current User Info
apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const profile = user.role === 'student' ? dbInstance.getProfileByUserId(user.id) : null;
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
    },
    profile,
  });
});

// 4. Reset Password
apiRouter.post('/auth/reset-password', async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  const user = dbInstance.getUserByEmail(email.trim());
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email address.' });
  }

  await dbInstance.updateUser(user.id, { passwordHash: hashPassword(newPassword) });
  return res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
});

// --- STUDENTS ---

// Get current student profile
apiRouter.get('/students/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'student') {
    return res.status(400).json({ error: 'User is not a student.' });
  }
  const profile = dbInstance.getProfileByUserId(req.user!.id);
  return res.json({ profile });
});

// Update student profile
apiRouter.put('/students/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'student') {
    return res.status(400).json({ error: 'User is not a student.' });
  }
  const { guardianName, guardianPhone, guardianRelation, permanentAddress, bloodGroup, medicalConditions, phone } = req.body;

  if (phone) {
    await dbInstance.updateUser(req.user!.id, { phone });
  }

  const existing = dbInstance.getProfileByUserId(req.user!.id);
  if (!existing) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const updated: StudentProfile = {
    ...existing,
    guardianName: guardianName ?? existing.guardianName,
    guardianPhone: guardianPhone ?? existing.guardianPhone,
    guardianRelation: guardianRelation ?? existing.guardianRelation,
    permanentAddress: permanentAddress ?? existing.permanentAddress,
    bloodGroup: bloodGroup ?? existing.bloodGroup,
    medicalConditions: medicalConditions ?? existing.medicalConditions,
    updatedAt: new Date().toISOString(),
  };

  await dbInstance.upsertProfile(updated);
  return res.json({ profile: updated });
});

// List all students (Admin only)
apiRouter.get('/students', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = dbInstance.getData().users.filter((u) => u.role === 'student');
  const profiles = dbInstance.getData().studentProfiles;

  const combined = users.map((u) => {
    const prof = profiles.find((p) => p.userId === u.id);
    return {
      userId: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      rollNumber: prof?.rollNumber || 'N/A',
      course: prof?.course || 'N/A',
      academicYear: prof?.academicYear || 'N/A',
      semester: prof?.semester || 1,
      gender: prof?.gender || 'N/A',
      allottedRoomId: prof?.allottedRoomId || null,
      allottedBedNumber: prof?.allottedBedNumber || null,
      allottedBlock: prof?.allottedBlock || null,
      allotmentStatus: prof?.allotmentStatus || 'not_applied',
      guardianName: prof?.guardianName,
      guardianPhone: prof?.guardianPhone,
    };
  });

  return res.json({ students: combined });
});

// --- BLOCKS & ROOMS ---

// Get all blocks
apiRouter.get('/blocks', (_req: Request, res: Response) => {
  return res.json({ blocks: dbInstance.getBlocks() });
});

// Get rooms with filters
apiRouter.get('/rooms', (req: Request, res: Response) => {
  const { blockId, roomType, floor, isAC, gender, availableOnly, search } = req.query;

  let rooms = dbInstance.getRooms();

  if (blockId) {
    rooms = rooms.filter((r) => r.blockId === String(blockId));
  }
  if (roomType) {
    rooms = rooms.filter((r) => r.roomType === String(roomType));
  }
  if (floor !== undefined && floor !== '') {
    rooms = rooms.filter((r) => r.floor === Number(floor));
  }
  if (isAC !== undefined && isAC !== '') {
    rooms = rooms.filter((r) => String(r.isAC) === String(isAC));
  }
  if (gender) {
    rooms = rooms.filter((r) => r.gender === String(gender) || r.gender === 'any');
  }
  if (availableOnly === 'true') {
    rooms = rooms.filter((r) => r.occupiedBeds < r.capacity && r.status === 'active');
  }
  if (search) {
    const term = String(search).toLowerCase();
    rooms = rooms.filter((r) => r.roomNumber.toLowerCase().includes(term) || r.blockName.toLowerCase().includes(term));
  }

  return res.json({ rooms });
});

// Get room details
apiRouter.get('/rooms/:id', (req: Request, res: Response) => {
  const room = dbInstance.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }
  return res.json({ room });
});

// Add new room (Admin only)
apiRouter.post('/rooms', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomNumber, blockId, floor, roomType, gender, isAC, hasAttachedWashroom, monthlyFee, amenities } = req.body;

    if (!roomNumber || !blockId || !roomType) {
      return res.status(400).json({ error: 'Room number, block, and room type are required.' });
    }

    const block = dbInstance.getBlockById(blockId);
    if (!block) {
      return res.status(404).json({ error: 'Hostel block not found.' });
    }

    const capacityMap: Record<RoomType, number> = { single: 1, double: 2, triple: 3 };
    const capacity = capacityMap[roomType as RoomType] || 2;

    const beds = Array.from({ length: capacity }, (_, i) => ({
      bedNumber: i + 1,
      isOccupied: false,
    }));

    const newRoom: HostelRoom = {
      id: `room-${crypto.randomUUID()}`,
      roomNumber: roomNumber.trim().toUpperCase(),
      blockId,
      blockName: block.name,
      floor: Number(floor) || 1,
      roomType: roomType as RoomType,
      gender: (gender as any) || block.gender,
      capacity,
      occupiedBeds: 0,
      beds,
      isAC: Boolean(isAC),
      hasAttachedWashroom: Boolean(hasAttachedWashroom),
      monthlyFee: Number(monthlyFee) || 5000,
      status: 'active',
      amenities: Array.isArray(amenities) ? amenities : ['Ceiling Fan', 'Study Table', 'Wardrobe'],
    };

    await dbInstance.addRoom(newRoom);
    return res.status(201).json({ room: newRoom });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create room.' });
  }
});

// Update room / toggle status (Admin only)
apiRouter.put('/rooms/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { status, monthlyFee, isAC, hasAttachedWashroom, amenities } = req.body;
  const room = await dbInstance.updateRoom(req.params.id, {
    ...(status ? { status } : {}),
    ...(monthlyFee !== undefined ? { monthlyFee: Number(monthlyFee) } : {}),
    ...(isAC !== undefined ? { isAC: Boolean(isAC) } : {}),
    ...(hasAttachedWashroom !== undefined ? { hasAttachedWashroom: Boolean(hasAttachedWashroom) } : {}),
    ...(amenities ? { amenities } : {}),
  });

  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }
  return res.json({ room });
});

// --- APPLICATIONS ---

// Get applications
apiRouter.get('/applications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === 'admin') {
    return res.json({ applications: dbInstance.getApplications() });
  } else {
    const studentApps = dbInstance.getData().applications.filter((a) => a.studentId === req.user!.id);
    return res.json({ applications: studentApps });
  }
});

// Submit application
apiRouter.post('/applications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only student accounts can submit hostel applications.' });
    }

    const {
      preferredBlockId,
      preferredRoomType,
      preferredFloor,
      isACPreferred,
      guardianName,
      guardianPhone,
      guardianRelation,
      permanentAddress,
      bloodGroup,
      medicalConditions,
      declaredAntiRagging,
      acceptedHostelRules,
    } = req.body;

    if (!preferredBlockId || !preferredRoomType) {
      return res.status(400).json({ error: 'Hostel block and room type preference are required.' });
    }

    if (!declaredAntiRagging || !acceptedHostelRules) {
      return res.status(400).json({ error: 'You must accept the hostel code of conduct and anti-ragging declaration.' });
    }

    const profile = dbInstance.getProfileByUserId(req.user!.id);
    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const application = await dbInstance.submitApplication({
      studentId: req.user!.id,
      studentName: req.user!.fullName,
      studentRollNo: profile.rollNumber,
      course: profile.course,
      academicYear: profile.academicYear,
      gender: profile.gender,
      phone: req.user!.phone,
      email: req.user!.email,
      preferredBlockId,
      preferredRoomType,
      preferredFloor: preferredFloor !== undefined ? Number(preferredFloor) : null,
      isACPreferred: Boolean(isACPreferred),
      guardianName: guardianName || profile.guardianName,
      guardianPhone: guardianPhone || profile.guardianPhone,
      guardianRelation: guardianRelation || profile.guardianRelation,
      permanentAddress: permanentAddress || profile.permanentAddress,
      bloodGroup: bloodGroup || profile.bloodGroup,
      medicalConditions,
      declaredAntiRagging: Boolean(declaredAntiRagging),
      acceptedHostelRules: Boolean(acceptedHostelRules),
    });

    return res.status(201).json({ application });
  } catch (err: unknown) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Application submission failed.' });
  }
});

// Update application status / Review (Admin only)
apiRouter.patch('/applications/:id/status', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, adminRemarks } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const app = await dbInstance.updateApplicationStatus(
      req.params.id,
      status,
      adminRemarks,
      req.user!.id,
      req.user!.fullName
    );
    return res.json({ application: app });
  } catch (err: unknown) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update application.' });
  }
});

// --- ALLOTMENTS (CONCURRENCY-SAFE TRANSACTIONAL) ---

// Get allotments
apiRouter.get('/allotments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === 'admin') {
    return res.json({ allotments: dbInstance.getData().allotments });
  } else {
    const studentAlt = dbInstance.getData().allotments.filter((a) => a.studentId === req.user!.id);
    return res.json({ allotments: studentAlt });
  }
});

// Manual Room Allotment (Admin only)
apiRouter.post('/allotments', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId, roomId, bedNumber, applicationId } = req.body;
    if (!studentId || !roomId) {
      return res.status(400).json({ error: 'Student ID and Room ID are required.' });
    }

    const result = await dbInstance.atomicAllotRoom(
      studentId,
      roomId,
      bedNumber ? Number(bedNumber) : undefined,
      req.user!.id,
      req.user!.fullName,
      applicationId
    );

    return res.status(201).json(result);
  } catch (err: unknown) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Allotment failed.' });
  }
});

// Vacate Room (Admin only)
apiRouter.post('/allotments/vacate', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId, notes } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required.' });
    }

    await dbInstance.atomicVacateRoom(studentId, req.user!.id, req.user!.fullName, notes);
    return res.json({ message: 'Room has been successfully vacated.' });
  } catch (err: unknown) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Vacate operation failed.' });
  }
});

// Smart Batch Auto-Allotment (Admin only)
apiRouter.post('/allotments/auto', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await dbInstance.autoAllotPendingApplications(req.user!.id, req.user!.fullName);
    return res.json(result);
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Auto-allotment failed.' });
  }
});

// --- ROOM CHANGE REQUESTS ---

// Get requests
apiRouter.get('/room-change-requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === 'admin') {
    return res.json({ requests: dbInstance.getChangeRequests() });
  } else {
    const studentRequests = dbInstance.getChangeRequests().filter((r) => r.studentId === req.user!.id);
    return res.json({ requests: studentRequests });
  }
});

// Submit request (Student only)
apiRouter.post('/room-change-requests', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can request room change.' });
    }

    const { requestedBlockId, requestedRoomType, targetRoomId, reasonCategory, reasonDetails } = req.body;
    if (!reasonCategory || !reasonDetails) {
      return res.status(400).json({ error: 'Reason category and justification details are required.' });
    }

    const newReq = await dbInstance.submitRoomChangeRequest({
      studentId: req.user!.id,
      requestedBlockId,
      requestedRoomType,
      targetRoomId,
      reasonCategory,
      reasonDetails: reasonDetails.trim(),
    });

    return res.status(201).json({ request: newReq });
  } catch (err: unknown) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to submit room change request.' });
  }
});

// Cancel request (Student only)
apiRouter.delete('/room-change-requests/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dbInstance.cancelRoomChangeRequest(req.params.id, req.user!.id);
    return res.json({ message: 'Room change request cancelled.' });
  } catch (err: unknown) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Cancellation failed.' });
  }
});

// Approve/Reject room change (Admin only, Concurrency-Safe Transaction)
apiRouter.patch('/room-change-requests/:id/process', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, targetRoomId, targetBedNumber, adminRemarks } = req.body;
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject".' });
    }

    const updated = await dbInstance.atomicProcessRoomChange(
      req.params.id,
      action,
      targetRoomId,
      targetBedNumber ? Number(targetBedNumber) : undefined,
      adminRemarks,
      req.user!.id,
      req.user!.fullName
    );

    return res.json({ request: updated });
  } catch (err: unknown) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Processing failed.' });
  }
});

// --- NOTIFICATIONS ---
apiRouter.get('/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const notifs = dbInstance.getNotifications(req.user!.id, req.user!.role);
  return res.json({ notifications: notifs });
});

apiRouter.patch('/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await dbInstance.markNotificationRead(req.params.id);
  return res.json({ success: true });
});

apiRouter.post('/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await dbInstance.markAllNotificationsRead(req.user!.id);
  return res.json({ success: true });
});

// --- AUDIT LOGS (Admin only) ---
apiRouter.get('/audit-logs', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ auditLogs: dbInstance.getAuditLogs() });
});

// --- REPORTS & STATS ---
apiRouter.get('/reports/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const data = dbInstance.getData();
  const totalStudents = data.users.filter((u) => u.role === 'student').length;
  const totalRooms = data.rooms.length;
  const totalBeds = data.rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = data.rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const pendingApplications = data.applications.filter((a) => a.status === 'pending').length;
  const approvedApplications = data.applications.filter((a) => a.status === 'approved').length;
  const pendingChangeRequests = data.changeRequests.filter((r) => r.status === 'pending').length;

  // Block-wise breakdown
  const blockStats = data.blocks.map((block) => {
    const blockRooms = data.rooms.filter((r) => r.blockId === block.id);
    const capacity = blockRooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupied = blockRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
    return {
      blockId: block.id,
      blockName: block.name,
      code: block.code,
      gender: block.gender,
      roomsCount: blockRooms.length,
      totalBeds: capacity,
      occupiedBeds: occupied,
      availableBeds: capacity - occupied,
      occupancyPercentage: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
    };
  });

  return res.json({
    totalStudents,
    totalRooms,
    totalBeds,
    occupiedBeds,
    availableBeds,
    occupancyPercentage,
    pendingApplications,
    approvedApplications,
    pendingChangeRequests,
    blockStats,
  });
});

// CSV Export (Admin only)
apiRouter.get('/reports/export-csv', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { type = 'allotments' } = req.query;
  const data = dbInstance.getData();

  let csvContent = '';
  let filename = 'export.csv';

  if (type === 'allotments') {
    filename = `pcte_hostel_allotments_${new Date().toISOString().slice(0, 10)}.csv`;
    csvContent = 'Allotment ID,Student Name,Roll Number,Room Number,Bed Number,Hostel Block,Allotted By,Date,Status,Notes\n';
    data.allotments.forEach((alt) => {
      csvContent += `"${alt.id}","${alt.studentName}","${alt.studentRollNo}","${alt.roomNumber}","${alt.bedNumber}","${alt.blockName}","${alt.allottedBy}","${alt.allottedAt}","${alt.status}","${alt.notes || ''}"\n`;
    });
  } else if (type === 'rooms') {
    filename = `pcte_hostel_rooms_${new Date().toISOString().slice(0, 10)}.csv`;
    csvContent = 'Room ID,Room Number,Block,Floor,Type,Gender,Capacity,Occupied,Available,Is AC,Washroom,Fee,Status\n';
    data.rooms.forEach((r) => {
      csvContent += `"${r.id}","${r.roomNumber}","${r.blockName}","Floor ${r.floor}","${r.roomType}","${r.gender}","${r.capacity}","${r.occupiedBeds}","${r.capacity - r.occupiedBeds}","${r.isAC ? 'Yes' : 'No'}","${r.hasAttachedWashroom ? 'Yes' : 'No'}","${r.monthlyFee}","${r.status}"\n`;
    });
  } else if (type === 'applications') {
    filename = `pcte_hostel_applications_${new Date().toISOString().slice(0, 10)}.csv`;
    csvContent = 'Reference Number,Student Name,Roll No,Course,Year,Gender,Phone,Preferred Block,Preferred Room Type,Status,Allotted Room,Remarks,Submitted At\n';
    data.applications.forEach((app) => {
      csvContent += `"${app.referenceNumber}","${app.studentName}","${app.studentRollNo}","${app.course}","${app.academicYear}","${app.gender}","${app.phone}","${app.preferredBlockId}","${app.preferredRoomType}","${app.status}","${app.allottedRoomId || 'None'}","${app.adminRemarks || ''}","${app.submittedAt}"\n`;
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvContent);
});

// Reset Demo Data (Admin only)
apiRouter.post('/system/reset-demo', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  dbInstance.resetToDefault();
  return res.json({ message: 'Database reset to initial demo state successfully.' });
});
