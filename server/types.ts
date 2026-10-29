export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string; // matches User id
  userId: string;
  rollNumber: string;
  course: string; // e.g., 'BCA', 'B.Tech CSE', 'BBA', 'MCA'
  academicYear: string; // e.g., '1st Year', '2nd Year', '3rd Year'
  semester: number;
  gender: 'male' | 'female' | 'other';
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  permanentAddress: string;
  bloodGroup: string;
  medicalConditions?: string;
  allottedRoomId?: string | null;
  allottedBedNumber?: number | null;
  allottedBlock?: string | null;
  allotmentStatus: 'not_applied' | 'applied' | 'allotted' | 'vacated';
  createdAt: string;
  updatedAt: string;
}

export type RoomType = 'single' | 'double' | 'triple';
export type RoomGender = 'male' | 'female' | 'any';

export interface RoomBed {
  bedNumber: number;
  isOccupied: boolean;
  studentId?: string | null;
  studentName?: string | null;
  studentRollNo?: string | null;
  allottedAt?: string | null;
}

export interface HostelRoom {
  id: string;
  roomNumber: string; // e.g. "A-101"
  blockId: string; // e.g. "block-a"
  blockName: string; // e.g. "Block A (Aryabhatta Boys Wing)"
  floor: number; // 0 for Ground, 1, 2, 3
  roomType: RoomType;
  gender: RoomGender;
  capacity: number;
  occupiedBeds: number;
  beds: RoomBed[];
  isAC: boolean;
  hasAttachedWashroom: boolean;
  monthlyFee: number;
  status: 'active' | 'maintenance' | 'closed';
  amenities: string[];
}

export interface HostelBlock {
  id: string;
  name: string;
  code: string;
  gender: RoomGender;
  totalFloors: number;
  description: string;
  wardenName: string;
  wardenContact: string;
  rulesOverview: string;
}

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';

export interface HostelApplication {
  id: string;
  referenceNumber: string; // e.g. "PCTE-2026-APP-1021"
  studentId: string;
  studentName: string;
  studentRollNo: string;
  course: string;
  academicYear: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  preferredBlockId: string;
  preferredRoomType: RoomType;
  preferredFloor?: number | null;
  isACPreferred: boolean;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  permanentAddress: string;
  bloodGroup: string;
  medicalConditions?: string;
  declaredAntiRagging: boolean;
  acceptedHostelRules: boolean;
  status: ApplicationStatus;
  adminRemarks?: string;
  allottedRoomId?: string;
  allottedBedNumber?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  updatedAt: string;
}

export type RoomChangeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface RoomChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  currentRoomId: string;
  currentRoomNumber: string;
  currentBedNumber: number;
  currentBlockName: string;
  requestedBlockId?: string;
  requestedRoomType?: RoomType;
  targetRoomId?: string; // Optional specific room requested
  targetRoomNumber?: string;
  reasonCategory: 'academic' | 'medical' | 'compatibility' | 'financial' | 'other';
  reasonDetails: string;
  status: RoomChangeStatus;
  adminRemarks?: string;
  allottedNewRoomId?: string;
  allottedNewBedNumber?: number;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface RoomAllotment {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  roomId: string;
  roomNumber: string;
  bedNumber: number;
  blockName: string;
  allottedBy: string; // Admin Name/ID
  allottedAt: string;
  academicYear: string;
  status: 'active' | 'transferred' | 'vacated';
  vacatedAt?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // studentId or 'broadcast' or 'admins'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  category: 'allotment' | 'de-allotment' | 'application' | 'room-change' | 'room-management' | 'auth';
  details: string;
  targetEntityId?: string;
}
