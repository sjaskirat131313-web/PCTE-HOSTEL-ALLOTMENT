import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  StudentProfile,
  HostelBlock,
  HostelRoom,
  HostelApplication,
  RoomChangeRequest,
  RoomAllotment,
  NotificationItem,
  AuditLogItem,
  RoomType,
  RoomGender,
} from './types';

// Simple concurrency mutex for critical transactional operations
class Mutex {
  private queue: Promise<void> = Promise.resolve();

  async runExclusive<T>(callback: () => Promise<T> | T): Promise<T> {
    let release: () => void = () => {};
    const lock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.queue;
    this.queue = this.queue.then(() => lock);
    await previous;
    try {
      return await callback();
    } finally {
      release();
    }
  }
}

export interface DatabaseSchema {
  users: User[];
  studentProfiles: StudentProfile[];
  blocks: HostelBlock[];
  rooms: HostelRoom[];
  applications: HostelApplication[];
  changeRequests: RoomChangeRequest[];
  allotments: RoomAllotment[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  systemSettings: {
    academicYear: string;
    admissionOpen: boolean;
    autoAllotmentEnabled: boolean;
    lastUpdated: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hostel_db.json');
const dbMutex = new Mutex();

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`pcte_salt_2026_${password}`).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate realistic initial database
function createInitialDatabase(): DatabaseSchema {
  const adminId = 'admin-01';
  const arjunId = 'student-arjun-01';
  const priyaId = 'student-priya-02';
  const rohanId = 'student-rohan-03';
  const simranId = 'student-simran-04';
  const gurpreetId = 'student-gurpreet-05';

  const defaultPasswordHash = hashPassword('Student@12345');
  const adminPasswordHash = hashPassword('Admin@12345');

  const users: User[] = [
    {
      id: adminId,
      email: 'admin@pcte.edu.in',
      passwordHash: adminPasswordHash,
      role: 'admin',
      fullName: 'Dr. R. K. Sharma (Chief Warden)',
      phone: '+91 98765 43210',
      createdAt: '2026-01-10T09:00:00.000Z',
      updatedAt: '2026-01-10T09:00:00.000Z',
    },
    {
      id: arjunId,
      email: 'arjun.sharma@pcte.edu.in',
      passwordHash: defaultPasswordHash,
      role: 'student',
      fullName: 'Arjun Sharma',
      phone: '+91 98140 11223',
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T10:00:00.000Z',
    },
    {
      id: priyaId,
      email: 'priya.verma@pcte.edu.in',
      passwordHash: defaultPasswordHash,
      role: 'student',
      fullName: 'Priya Verma',
      phone: '+91 98720 33445',
      createdAt: '2026-02-05T11:30:00.000Z',
      updatedAt: '2026-02-05T11:30:00.000Z',
    },
    {
      id: rohanId,
      email: 'rohan.mehta@pcte.edu.in',
      passwordHash: defaultPasswordHash,
      role: 'student',
      fullName: 'Rohan Mehta',
      phone: '+91 99150 55667',
      createdAt: '2026-02-10T14:15:00.000Z',
      updatedAt: '2026-02-10T14:15:00.000Z',
    },
    {
      id: simranId,
      email: 'simran.kaur@pcte.edu.in',
      passwordHash: defaultPasswordHash,
      role: 'student',
      fullName: 'Simran Kaur',
      phone: '+91 98880 77889',
      createdAt: '2026-02-02T16:00:00.000Z',
      updatedAt: '2026-02-02T16:00:00.000Z',
    },
    {
      id: gurpreetId,
      email: 'gurpreet.singh@pcte.edu.in',
      passwordHash: defaultPasswordHash,
      role: 'student',
      fullName: 'Gurpreet Singh',
      phone: '+91 98761 99001',
      createdAt: '2026-02-01T10:30:00.000Z',
      updatedAt: '2026-02-01T10:30:00.000Z',
    },
  ];

  const blocks: HostelBlock[] = [
    {
      id: 'block-a',
      name: 'Block A - Aryabhatta Boys Wing',
      code: 'A',
      gender: 'male',
      totalFloors: 4,
      description: 'Senior and junior boys academic residential block with high-speed fiber internet and attached recreation room.',
      wardenName: 'Prof. Harpreet Singh (Hostel Superintendent)',
      wardenContact: '+91 98141 12345',
      rulesOverview: 'Curfew: 9:30 PM. Silence hours: 10:30 PM - 6:00 AM. Biometric sign-in compulsory.',
    },
    {
      id: 'block-b',
      name: 'Block B - Bhabha Boys Senior Wing',
      code: 'B',
      gender: 'male',
      totalFloors: 3,
      description: 'Air-conditioned premium block for 2nd and 3rd year students with reading lounge and gymnasium access.',
      wardenName: 'Er. Rajesh Kumar',
      wardenContact: '+91 98142 54321',
      rulesOverview: 'Curfew: 10:00 PM. Electrical appliances like induction/heaters strictly prohibited.',
    },
    {
      id: 'block-c',
      name: 'Block C - Kalpana Chawla Girls Wing',
      code: 'C',
      gender: 'female',
      totalFloors: 4,
      description: 'Dedicated women hostel block with 24/7 security, full CCTV surveillance, indoor badminton, and pantry.',
      wardenName: 'Dr. Manjit Kaur (Chief Matron)',
      wardenContact: '+91 98762 98765',
      rulesOverview: 'Curfew: 8:00 PM. Visitor timings: 4:30 PM - 6:30 PM in visitor lounge only.',
    },
    {
      id: 'block-d',
      name: 'Block D - Sarojini Naidu Girls Wing',
      code: 'D',
      gender: 'female',
      totalFloors: 3,
      description: 'Executive girls block featuring single and double air-conditioned study suites.',
      wardenName: 'Mrs. Neha Oberoi',
      wardenContact: '+91 98881 23456',
      rulesOverview: 'Curfew: 8:30 PM. Out-pass required for weekend home visits.',
    },
  ];

  // Helper to generate rooms
  const rooms: HostelRoom[] = [
    // Block A (Boys)
    {
      id: 'room-a-101',
      roomNumber: 'A-101',
      blockId: 'block-a',
      blockName: 'Block A - Aryabhatta Boys Wing',
      floor: 1,
      roomType: 'double',
      gender: 'male',
      capacity: 2,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 1, isOccupied: false },
        { bedNumber: 2, isOccupied: false },
      ],
      isAC: false,
      hasAttachedWashroom: true,
      monthlyFee: 5500,
      status: 'active',
      amenities: ['Attached Washroom', 'Ceiling Fan', 'Study Desk', 'Wardrobe', 'LAN Port'],
    },
    {
      id: 'room-a-102',
      roomNumber: 'A-102',
      blockId: 'block-a',
      blockName: 'Block A - Aryabhatta Boys Wing',
      floor: 1,
      roomType: 'triple',
      gender: 'male',
      capacity: 3,
      occupiedBeds: 1,
      beds: [
        { bedNumber: 1, isOccupied: true, studentId: 'student-demo-99', studentName: 'Vikas Sharma', studentRollNo: '2301011', allottedAt: '2026-01-15T00:00:00.000Z' },
        { bedNumber: 2, isOccupied: false },
        { bedNumber: 3, isOccupied: false },
      ],
      isAC: false,
      hasAttachedWashroom: false,
      monthlyFee: 4200,
      status: 'active',
      amenities: ['Common Washroom', 'Study Desk', 'Individual Cupboard', 'Balcony'],
    },
    {
      id: 'room-a-204',
      roomNumber: 'A-204',
      blockId: 'block-a',
      blockName: 'Block A - Aryabhatta Boys Wing',
      floor: 2,
      roomType: 'double',
      gender: 'male',
      capacity: 2,
      occupiedBeds: 2,
      beds: [
        { bedNumber: 1, isOccupied: true, studentId: arjunId, studentName: 'Arjun Sharma', studentRollNo: '2301041', allottedAt: '2026-02-01T11:00:00.000Z' },
        { bedNumber: 2, isOccupied: true, studentId: gurpreetId, studentName: 'Gurpreet Singh', studentRollNo: '2301056', allottedAt: '2026-02-01T11:30:00.000Z' },
      ],
      isAC: true,
      hasAttachedWashroom: true,
      monthlyFee: 6500,
      status: 'active',
      amenities: ['Split AC', 'Attached Washroom', 'Study Chairs', 'Wooden Wardrobe', 'Balcony Garden View'],
    },
    {
      id: 'room-a-205',
      roomNumber: 'A-205',
      blockId: 'block-a',
      blockName: 'Block A - Aryabhatta Boys Wing',
      floor: 2,
      roomType: 'single',
      gender: 'male',
      capacity: 1,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 1, isOccupied: false },
      ],
      isAC: true,
      hasAttachedWashroom: true,
      monthlyFee: 8500,
      status: 'active',
      amenities: ['Premium Single Suite', 'Split AC', 'Ensuite Bath', 'Executive Desk', 'High-Speed Wi-Fi'],
    },
    {
      id: 'room-a-301',
      roomNumber: 'A-301',
      blockId: 'block-a',
      blockName: 'Block A - Aryabhatta Boys Wing',
      floor: 3,
      roomType: 'double',
      gender: 'male',
      capacity: 2,
      occupiedBeds: 1,
      beds: [
        { bedNumber: 1, isOccupied: true, studentId: 'student-demo-98', studentName: 'Kunal Verma', studentRollNo: '2401089', allottedAt: '2026-01-20T00:00:00.000Z' },
        { bedNumber: 2, isOccupied: false },
      ],
      isAC: false,
      hasAttachedWashroom: true,
      monthlyFee: 5500,
      status: 'active',
      amenities: ['Attached Washroom', 'Terrace View', 'Ceiling Fan', 'Study Table'],
    },
    // Block B (Boys Senior)
    {
      id: 'room-b-101',
      roomNumber: 'B-101',
      blockId: 'block-b',
      blockName: 'Block B - Bhabha Boys Senior Wing',
      floor: 1,
      roomType: 'single',
      gender: 'male',
      capacity: 1,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 1, isOccupied: false },
      ],
      isAC: true,
      hasAttachedWashroom: true,
      monthlyFee: 8800,
      status: 'active',
      amenities: ['Single AC Suite', 'Study Bookshelf', 'Ergonomic Chair', 'Attached Geyser Bath'],
    },
    {
      id: 'room-b-201',
      roomNumber: 'B-201',
      blockId: 'block-b',
      blockName: 'Block B - Bhabha Boys Senior Wing',
      floor: 2,
      roomType: 'double',
      gender: 'male',
      capacity: 2,
      occupiedBeds: 1,
      beds: [
        { bedNumber: 1, isOccupied: true, studentId: 'student-demo-97', studentName: 'Navdeep Gill', studentRollNo: '2201019', allottedAt: '2026-01-18T00:00:00.000Z' },
        { bedNumber: 2, isOccupied: false },
      ],
      isAC: true,
      hasAttachedWashroom: true,
      monthlyFee: 6800,
      status: 'active',
      amenities: ['Split AC', 'Attached Washroom', 'Balcony', 'Power Backup'],
    },
    // Block C (Girls)
    {
      id: 'room-c-101',
      roomNumber: 'C-101',
      blockId: 'block-c',
      blockName: 'Block C - Kalpana Chawla Girls Wing',
      floor: 1,
      roomType: 'double',
      gender: 'female',
      capacity: 2,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 1, isOccupied: false },
        { bedNumber: 2, isOccupied: false },
      ],
      isAC: false,
      hasAttachedWashroom: true,
      monthlyFee: 5500,
      status: 'active',
      amenities: ['Attached Washroom', 'Full Mirror Wardrobe', 'Balcony', 'Safe Locker'],
    },
    {
      id: 'room-c-102',
      roomNumber: 'C-102',
      blockId: 'block-c',
      blockName: 'Block C - Kalpana Chawla Girls Wing',
      floor: 1,
      roomType: 'double',
      gender: 'female',
      capacity: 2,
      occupiedBeds: 2,
      beds: [
        { bedNumber: 1, isOccupied: true, studentId: 'student-demo-96', studentName: 'Jasleen Kaur', studentRollNo: '2301077', allottedAt: '2026-01-22T00:00:00.000Z' },
        { bedNumber: 2, isOccupied: true, studentId: simranId, studentName: 'Simran Kaur', studentRollNo: '2301092', allottedAt: '2026-02-02T16:30:00.000Z' },
      ],
      isAC: false,
      hasAttachedWashroom: true,
      monthlyFee: 5500,
      status: 'active',
      amenities: ['Attached Washroom', 'Study Desks', 'Spacious Cupboards', 'Sunlit Balcony'],
    },
    {
      id: 'room-c-202',
      roomNumber: 'C-202',
      blockId: 'block-c',
      blockName: 'Block C - Kalpana Chawla Girls Wing',
      floor: 2,
      roomType: 'triple',
      gender: 'female',
      capacity: 3,
      occupiedBeds: 1,
      beds: [
        { bedNumber: 1, isOccupied: true, studentId: 'student-demo-95', studentName: 'Aanchal Mittal', studentRollNo: '2401034', allottedAt: '2026-01-25T00:00:00.000Z' },
        { bedNumber: 2, isOccupied: false },
        { bedNumber: 3, isOccupied: false },
      ],
      isAC: false,
      hasAttachedWashroom: false,
      monthlyFee: 4200,
      status: 'active',
      amenities: ['Common Clean Washrooms', 'Bedside Reading Lamp', 'Large Window'],
    },
    // Block D (Girls Executive)
    {
      id: 'room-d-101',
      roomNumber: 'D-101',
      blockId: 'block-d',
      blockName: 'Block D - Sarojini Naidu Girls Wing',
      floor: 1,
      roomType: 'single',
      gender: 'female',
      capacity: 1,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 1, isOccupied: false },
      ],
      isAC: true,
      hasAttachedWashroom: true,
      monthlyFee: 8800,
      status: 'active',
      amenities: ['Executive Single Suite', 'AC', 'Attached Washroom with Geyser', 'Study Pod', 'Refrigerator'],
    },
    {
      id: 'room-d-102',
      roomNumber: 'D-102',
      blockId: 'block-d',
      blockName: 'Block D - Sarojini Naidu Girls Wing',
      floor: 1,
      roomType: 'double',
      gender: 'female',
      capacity: 2,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 1, isOccupied: false },
        { bedNumber: 2, isOccupied: false },
      ],
      isAC: true,
      hasAttachedWashroom: true,
      monthlyFee: 6800,
      status: 'active',
      amenities: ['Air Conditioned', 'Ensuite Washroom', 'Balcony', 'Elevator Access'],
    },
  ];

  const studentProfiles: StudentProfile[] = [
    {
      id: arjunId,
      userId: arjunId,
      rollNumber: '2301041',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '3rd Year',
      semester: 5,
      gender: 'male',
      guardianName: 'Sh. Rajesh Sharma',
      guardianPhone: '+91 94170 12345',
      guardianRelation: 'Father',
      permanentAddress: 'House 42, Civil Lines, Jalandhar, Punjab',
      bloodGroup: 'B+',
      medicalConditions: 'None',
      allottedRoomId: 'room-a-204',
      allottedBedNumber: 1,
      allottedBlock: 'Block A - Aryabhatta Boys Wing',
      allotmentStatus: 'allotted',
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T11:00:00.000Z',
    },
    {
      id: gurpreetId,
      userId: gurpreetId,
      rollNumber: '2301056',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '2nd Year',
      semester: 4,
      gender: 'male',
      guardianName: 'S. Balwinder Singh',
      guardianPhone: '+91 98150 99887',
      guardianRelation: 'Father',
      permanentAddress: 'VPO Gill, Ludhiana, Punjab',
      bloodGroup: 'O+',
      allottedRoomId: 'room-a-204',
      allottedBedNumber: 2,
      allottedBlock: 'Block A - Aryabhatta Boys Wing',
      allotmentStatus: 'allotted',
      createdAt: '2026-02-01T10:30:00.000Z',
      updatedAt: '2026-02-01T11:30:00.000Z',
    },
    {
      id: priyaId,
      userId: priyaId,
      rollNumber: '2301088',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '2nd Year',
      semester: 3,
      gender: 'female',
      guardianName: 'Sh. Sunil Verma',
      guardianPhone: '+91 98780 44556',
      guardianRelation: 'Father',
      permanentAddress: 'Flat 302, Urban Estate, Phagwara, Punjab',
      bloodGroup: 'A+',
      medicalConditions: 'Mild dust allergy',
      allottedRoomId: null,
      allottedBedNumber: null,
      allottedBlock: null,
      allotmentStatus: 'applied',
      createdAt: '2026-02-05T11:30:00.000Z',
      updatedAt: '2026-02-05T11:45:00.000Z',
    },
    {
      id: rohanId,
      userId: rohanId,
      rollNumber: '2401015',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '1st Year',
      semester: 1,
      gender: 'male',
      guardianName: 'Mrs. Sunita Mehta',
      guardianPhone: '+91 99140 33221',
      guardianRelation: 'Mother',
      permanentAddress: 'Model Town, Khanna, Punjab',
      bloodGroup: 'AB+',
      allottedRoomId: null,
      allottedBedNumber: null,
      allottedBlock: null,
      allotmentStatus: 'not_applied',
      createdAt: '2026-02-10T14:15:00.000Z',
      updatedAt: '2026-02-10T14:15:00.000Z',
    },
    {
      id: simranId,
      userId: simranId,
      rollNumber: '2301092',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '3rd Year',
      semester: 5,
      gender: 'female',
      guardianName: 'S. Gurmukh Kaur',
      guardianPhone: '+91 98144 88776',
      guardianRelation: 'Mother',
      permanentAddress: 'Dashmesh Nagar, Moga, Punjab',
      bloodGroup: 'O+',
      allottedRoomId: 'room-c-102',
      allottedBedNumber: 2,
      allottedBlock: 'Block C - Kalpana Chawla Girls Wing',
      allotmentStatus: 'allotted',
      createdAt: '2026-02-02T16:00:00.000Z',
      updatedAt: '2026-02-02T16:30:00.000Z',
    },
  ];

  const applications: HostelApplication[] = [
    {
      id: 'app-arjun-01',
      referenceNumber: 'PCTE-2026-APP-1002',
      studentId: arjunId,
      studentName: 'Arjun Sharma',
      studentRollNo: '2301041',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '3rd Year',
      gender: 'male',
      phone: '+91 98140 11223',
      email: 'arjun.sharma@pcte.edu.in',
      preferredBlockId: 'block-a',
      preferredRoomType: 'double',
      preferredFloor: 2,
      isACPreferred: true,
      guardianName: 'Sh. Rajesh Sharma',
      guardianPhone: '+91 94170 12345',
      guardianRelation: 'Father',
      permanentAddress: 'House 42, Civil Lines, Jalandhar, Punjab',
      bloodGroup: 'B+',
      declaredAntiRagging: true,
      acceptedHostelRules: true,
      status: 'approved',
      adminRemarks: 'Application approved. Allotted Room A-204 Bed 1 (AC Double Sharing) per merit and preference.',
      allottedRoomId: 'room-a-204',
      allottedBedNumber: 1,
      reviewedBy: 'Dr. R. K. Sharma (Chief Warden)',
      reviewedAt: '2026-02-01T11:00:00.000Z',
      submittedAt: '2026-02-01T10:15:00.000Z',
      updatedAt: '2026-02-01T11:00:00.000Z',
    },
    {
      id: 'app-priya-02',
      referenceNumber: 'PCTE-2026-APP-1021',
      studentId: priyaId,
      studentName: 'Priya Verma',
      studentRollNo: '2301088',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '2nd Year',
      gender: 'female',
      phone: '+91 98720 33445',
      email: 'priya.verma@pcte.edu.in',
      preferredBlockId: 'block-c',
      preferredRoomType: 'double',
      preferredFloor: 1,
      isACPreferred: false,
      guardianName: 'Sh. Sunil Verma',
      guardianPhone: '+91 98780 44556',
      guardianRelation: 'Father',
      permanentAddress: 'Flat 302, Urban Estate, Phagwara, Punjab',
      bloodGroup: 'A+',
      medicalConditions: 'Mild dust allergy',
      declaredAntiRagging: true,
      acceptedHostelRules: true,
      status: 'pending',
      submittedAt: '2026-02-05T11:45:00.000Z',
      updatedAt: '2026-02-05T11:45:00.000Z',
    },
    {
      id: 'app-simran-04',
      referenceNumber: 'PCTE-2026-APP-0994',
      studentId: simranId,
      studentName: 'Simran Kaur',
      studentRollNo: '2301092',
      course: 'BCA (Bachelor of Computer Applications)',
      academicYear: '3rd Year',
      gender: 'female',
      phone: '+91 98880 77889',
      email: 'simran.kaur@pcte.edu.in',
      preferredBlockId: 'block-c',
      preferredRoomType: 'double',
      preferredFloor: 1,
      isACPreferred: false,
      guardianName: 'S. Gurmukh Kaur',
      guardianPhone: '+91 98144 88776',
      guardianRelation: 'Mother',
      permanentAddress: 'Dashmesh Nagar, Moga, Punjab',
      bloodGroup: 'O+',
      declaredAntiRagging: true,
      acceptedHostelRules: true,
      status: 'approved',
      adminRemarks: 'Application approved and room C-102 allotted.',
      allottedRoomId: 'room-c-102',
      allottedBedNumber: 2,
      reviewedBy: 'Dr. R. K. Sharma (Chief Warden)',
      reviewedAt: '2026-02-02T16:30:00.000Z',
      submittedAt: '2026-02-02T16:10:00.000Z',
      updatedAt: '2026-02-02T16:30:00.000Z',
    },
  ];

  const allotments: RoomAllotment[] = [
    {
      id: 'alt-arjun-01',
      studentId: arjunId,
      studentName: 'Arjun Sharma',
      studentRollNo: '2301041',
      roomId: 'room-a-204',
      roomNumber: 'A-204',
      bedNumber: 1,
      blockName: 'Block A - Aryabhatta Boys Wing',
      allottedBy: 'Dr. R. K. Sharma (Chief Warden)',
      allottedAt: '2026-02-01T11:00:00.000Z',
      academicYear: '2025-2026',
      status: 'active',
      notes: 'Initial room allotment based on academic merit.',
    },
    {
      id: 'alt-gurpreet-01',
      studentId: gurpreetId,
      studentName: 'Gurpreet Singh',
      studentRollNo: '2301056',
      roomId: 'room-a-204',
      roomNumber: 'A-204',
      bedNumber: 2,
      blockName: 'Block A - Aryabhatta Boys Wing',
      allottedBy: 'Dr. R. K. Sharma (Chief Warden)',
      allottedAt: '2026-02-01T11:30:00.000Z',
      academicYear: '2025-2026',
      status: 'active',
      notes: 'Allotted Bed 2 in Room A-204.',
    },
    {
      id: 'alt-simran-01',
      studentId: simranId,
      studentName: 'Simran Kaur',
      studentRollNo: '2301092',
      roomId: 'room-c-102',
      roomNumber: 'C-102',
      bedNumber: 2,
      blockName: 'Block C - Kalpana Chawla Girls Wing',
      allottedBy: 'Dr. R. K. Sharma (Chief Warden)',
      allottedAt: '2026-02-02T16:30:00.000Z',
      academicYear: '2025-2026',
      status: 'active',
      notes: 'Allotted Bed 2 in Room C-102.',
    },
  ];

  const changeRequests: RoomChangeRequest[] = [
    {
      id: 'cr-simran-01',
      studentId: simranId,
      studentName: 'Simran Kaur',
      studentRollNo: '2301092',
      currentRoomId: 'room-c-102',
      currentRoomNumber: 'C-102',
      currentBedNumber: 2,
      currentBlockName: 'Block C - Kalpana Chawla Girls Wing',
      requestedBlockId: 'block-d',
      requestedRoomType: 'single',
      targetRoomId: 'room-d-101',
      targetRoomNumber: 'D-101',
      reasonCategory: 'academic',
      reasonDetails: 'Final year project preparation and competitive exam study hours require a quieter single study suite.',
      status: 'pending',
      submittedAt: '2026-02-06T10:20:00.000Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-01',
      userId: arjunId,
      title: 'Hostel Room Allotted Successfully',
      message: 'Congratulations! Room A-204, Bed 1 in Block A has been officially allotted to you. Please collect your room keys from the warden office.',
      type: 'success',
      isRead: false,
      createdAt: '2026-02-01T11:00:00.000Z',
      link: '/dashboard',
    },
    {
      id: 'notif-02',
      userId: priyaId,
      title: 'Hostel Application Received',
      message: 'Your hostel accommodation application (Ref: PCTE-2026-APP-1021) has been received and is queued for verification.',
      type: 'info',
      isRead: true,
      createdAt: '2026-02-05T11:45:00.000Z',
      link: '/applications',
    },
    {
      id: 'notif-03',
      userId: simranId,
      title: 'Room Change Request Submitted',
      message: 'Your request to switch from Room C-102 to Single Room in Block D is under administrative review.',
      type: 'info',
      isRead: false,
      createdAt: '2026-02-06T10:20:00.000Z',
      link: '/room-switch',
    },
    {
      id: 'notif-admin-01',
      userId: 'admins',
      title: 'New Room Change Request',
      message: 'Simran Kaur (Roll No: 2301092) submitted a room-change request for Single Room D-101.',
      type: 'warning',
      isRead: false,
      createdAt: '2026-02-06T10:20:00.000Z',
      link: '/admin/room-changes',
    },
    {
      id: 'notif-admin-02',
      userId: 'admins',
      title: 'Pending Application Awaiting Review',
      message: 'Priya Verma (BCA 2nd Year) submitted a hostel application awaiting room allotment.',
      type: 'info',
      isRead: false,
      createdAt: '2026-02-05T11:45:00.000Z',
      link: '/admin/applications',
    },
  ];

  const auditLogs: AuditLogItem[] = [
    {
      id: 'audit-01',
      timestamp: '2026-02-01T11:00:00.000Z',
      adminId,
      adminName: 'Dr. R. K. Sharma (Chief Warden)',
      action: 'Room Allotted',
      category: 'allotment',
      details: 'Allotted Room A-204 Bed 1 to Arjun Sharma (2301041).',
      targetEntityId: 'alt-arjun-01',
    },
    {
      id: 'audit-02',
      timestamp: '2026-02-01T11:30:00.000Z',
      adminId,
      adminName: 'Dr. R. K. Sharma (Chief Warden)',
      action: 'Room Allotted',
      category: 'allotment',
      details: 'Allotted Room A-204 Bed 2 to Gurpreet Singh (2301056). Room A-204 is now full.',
      targetEntityId: 'alt-gurpreet-01',
    },
    {
      id: 'audit-03',
      timestamp: '2026-02-02T16:30:00.000Z',
      adminId,
      adminName: 'Dr. R. K. Sharma (Chief Warden)',
      action: 'Room Allotted',
      category: 'allotment',
      details: 'Allotted Room C-102 Bed 2 to Simran Kaur (2301092).',
      targetEntityId: 'alt-simran-01',
    },
  ];

  return {
    users,
    studentProfiles,
    blocks,
    rooms,
    applications,
    changeRequests,
    allotments,
    notifications,
    auditLogs,
    systemSettings: {
      academicYear: '2025-2026',
      admissionOpen: true,
      autoAllotmentEnabled: true,
      lastUpdated: new Date().toISOString(),
    },
  };
}

class HostelDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.rooms && parsed.applications) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse database file, reinitializing default data:', err);
    }
    const initial = createInitialDatabase();
    this.saveDatabaseSync(initial);
    return initial;
  }

  private saveDatabaseSync(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  public async save(): Promise<void> {
    this.saveDatabaseSync(this.data);
  }

  public resetToDefault(): DatabaseSchema {
    this.data = createInitialDatabase();
    this.saveDatabaseSync(this.data);
    return this.data;
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- Auth & Users ---
  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public async createUser(user: User): Promise<User> {
    return dbMutex.runExclusive(async () => {
      this.data.users.push(user);
      await this.save();
      return user;
    });
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return dbMutex.runExclusive(async () => {
      const idx = this.data.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      await this.save();
      return this.data.users[idx];
    });
  }

  // --- Student Profiles ---
  public getProfileByUserId(userId: string): StudentProfile | undefined {
    return this.data.studentProfiles.find((p) => p.userId === userId);
  }

  public async upsertProfile(profile: StudentProfile): Promise<StudentProfile> {
    return dbMutex.runExclusive(async () => {
      const idx = this.data.studentProfiles.findIndex((p) => p.userId === profile.userId);
      if (idx >= 0) {
        this.data.studentProfiles[idx] = { ...profile, updatedAt: new Date().toISOString() };
      } else {
        this.data.studentProfiles.push(profile);
      }
      await this.save();
      return profile;
    });
  }

  // --- Hostel Blocks & Rooms ---
  public getBlocks(): HostelBlock[] {
    return this.data.blocks;
  }

  public getBlockById(id: string): HostelBlock | undefined {
    return this.data.blocks.find((b) => b.id === id);
  }

  public getRooms(): HostelRoom[] {
    return this.data.rooms;
  }

  public getRoomById(id: string): HostelRoom | undefined {
    return this.data.rooms.find((r) => r.id === id);
  }

  public async addRoom(room: HostelRoom): Promise<HostelRoom> {
    return dbMutex.runExclusive(async () => {
      this.data.rooms.push(room);
      await this.save();
      return room;
    });
  }

  public async updateRoom(id: string, updates: Partial<HostelRoom>): Promise<HostelRoom | null> {
    return dbMutex.runExclusive(async () => {
      const idx = this.data.rooms.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      this.data.rooms[idx] = { ...this.data.rooms[idx], ...updates };
      await this.save();
      return this.data.rooms[idx];
    });
  }

  // --- Applications ---
  public getApplications(): HostelApplication[] {
    return this.data.applications;
  }

  public getApplicationById(id: string): HostelApplication | undefined {
    return this.data.applications.find((a) => a.id === id);
  }

  public getApplicationByStudentId(studentId: string): HostelApplication | undefined {
    return this.data.applications.find((a) => a.studentId === studentId);
  }

  public async submitApplication(appData: Omit<HostelApplication, 'id' | 'referenceNumber' | 'status' | 'submittedAt' | 'updatedAt'>): Promise<HostelApplication> {
    return dbMutex.runExclusive(async () => {
      // Check duplicate active application
      const existing = this.data.applications.find(
        (a) => a.studentId === appData.studentId && ['pending', 'under_review', 'approved'].includes(a.status)
      );
      if (existing) {
        throw new Error('You already have an active hostel application.');
      }

      const seq = Math.floor(1000 + Math.random() * 9000);
      const now = new Date().toISOString();
      const newApp: HostelApplication = {
        ...appData,
        id: `app-${crypto.randomUUID()}`,
        referenceNumber: `PCTE-2026-APP-${seq}`,
        status: 'pending',
        submittedAt: now,
        updatedAt: now,
      };

      this.data.applications.push(newApp);

      // Update student profile status
      const profile = this.data.studentProfiles.find((p) => p.userId === appData.studentId);
      if (profile) {
        profile.allotmentStatus = 'applied';
        profile.updatedAt = now;
      }

      // Add student notification
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: appData.studentId,
        title: 'Application Submitted',
        message: `Your hostel application ${newApp.referenceNumber} has been received and logged for review.`,
        type: 'info',
        isRead: false,
        createdAt: now,
        link: '/applications',
      });

      // Add admin notification
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: 'admins',
        title: 'New Hostel Application',
        message: `${newApp.studentName} (${newApp.studentRollNo}, ${newApp.course}) submitted application ${newApp.referenceNumber}.`,
        type: 'info',
        isRead: false,
        createdAt: now,
        link: '/admin/applications',
      });

      await this.save();
      return newApp;
    });
  }

  public async updateApplicationStatus(
    id: string,
    status: HostelApplication['status'],
    adminRemarks: string | undefined,
    adminId: string,
    adminName: string
  ): Promise<HostelApplication> {
    return dbMutex.runExclusive(async () => {
      const app = this.data.applications.find((a) => a.id === id);
      if (!app) throw new Error('Application not found');

      app.status = status;
      app.adminRemarks = adminRemarks || app.adminRemarks;
      app.reviewedBy = adminName;
      app.reviewedAt = new Date().toISOString();
      app.updatedAt = new Date().toISOString();

      if (status === 'rejected') {
        const prof = this.data.studentProfiles.find((p) => p.userId === app.studentId);
        if (prof && prof.allotmentStatus === 'applied') {
          prof.allotmentStatus = 'not_applied';
        }
      }

      // Notification to student
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: app.studentId,
        title: `Hostel Application ${status.toUpperCase().replace('_', ' ')}`,
        message: `Your application (${app.referenceNumber}) status updated to ${status}. Remarks: ${adminRemarks || 'None'}`,
        type: status === 'approved' ? 'success' : status === 'rejected' ? 'alert' : 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/applications',
      });

      // Audit log
      this.data.auditLogs.unshift({
        id: `audit-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        adminId,
        adminName,
        action: `Application ${status.toUpperCase()}`,
        category: 'application',
        details: `Updated application ${app.referenceNumber} for ${app.studentName} to ${status}.`,
        targetEntityId: app.id,
      });

      await this.save();
      return app;
    });
  }

  // --- Concurrency-Safe Transactional Room Allotment ---
  public async atomicAllotRoom(
    studentId: string,
    roomId: string,
    preferredBedNumber?: number,
    adminId = 'system',
    adminName = 'System / Administrator',
    applicationId?: string
  ): Promise<{ allotment: RoomAllotment; room: HostelRoom }> {
    return dbMutex.runExclusive(async () => {
      const student = this.data.users.find((u) => u.id === studentId);
      if (!student) throw new Error('Student user record not found');

      const profile = this.data.studentProfiles.find((p) => p.userId === studentId);
      if (!profile) throw new Error('Student profile not found');

      // Invariant: Student cannot be assigned to multiple active rooms simultaneously
      if (profile.allottedRoomId) {
        throw new Error(`Student ${student.fullName} is already allotted to room. Vacate or use room-switch instead.`);
      }

      const room = this.data.rooms.find((r) => r.id === roomId);
      if (!room) throw new Error('Hostel room not found');

      if (room.status !== 'active') {
        throw new Error(`Room ${room.roomNumber} is currently under ${room.status} and cannot be allotted.`);
      }

      // Gender safety validation
      if (room.gender !== 'any' && profile.gender !== room.gender) {
        throw new Error(`Gender mismatch: Room ${room.roomNumber} is for ${room.gender} students only.`);
      }

      // Check available beds
      const vacantBeds = room.beds.filter((b) => !b.isOccupied);
      if (vacantBeds.length === 0) {
        throw new Error(`Room ${room.roomNumber} is already at full capacity (${room.capacity}/${room.capacity} beds occupied).`);
      }

      // Select target bed
      let targetBed = preferredBedNumber ? vacantBeds.find((b) => b.bedNumber === preferredBedNumber) : vacantBeds[0];
      if (!targetBed) {
        targetBed = vacantBeds[0];
      }

      const now = new Date().toISOString();

      // Atomically occupy bed
      targetBed.isOccupied = true;
      targetBed.studentId = student.id;
      targetBed.studentName = student.fullName;
      targetBed.studentRollNo = profile.rollNumber;
      targetBed.allottedAt = now;

      room.occupiedBeds = room.beds.filter((b) => b.isOccupied).length;

      // Update student profile
      profile.allottedRoomId = room.id;
      profile.allottedBedNumber = targetBed.bedNumber;
      profile.allottedBlock = room.blockName;
      profile.allotmentStatus = 'allotted';
      profile.updatedAt = now;

      // Create allotment record
      const allotment: RoomAllotment = {
        id: `alt-${crypto.randomUUID()}`,
        studentId: student.id,
        studentName: student.fullName,
        studentRollNo: profile.rollNumber,
        roomId: room.id,
        roomNumber: room.roomNumber,
        bedNumber: targetBed.bedNumber,
        blockName: room.blockName,
        allottedBy: adminName,
        allottedAt: now,
        academicYear: this.data.systemSettings.academicYear,
        status: 'active',
      };
      this.data.allotments.unshift(allotment);

      // If tied to an application, approve application
      if (applicationId) {
        const app = this.data.applications.find((a) => a.id === applicationId);
        if (app) {
          app.status = 'approved';
          app.allottedRoomId = room.id;
          app.allottedBedNumber = targetBed.bedNumber;
          app.reviewedBy = adminName;
          app.reviewedAt = now;
          app.updatedAt = now;
        }
      } else {
        const app = this.data.applications.find((a) => a.studentId === student.id && a.status === 'pending');
        if (app) {
          app.status = 'approved';
          app.allottedRoomId = room.id;
          app.allottedBedNumber = targetBed.bedNumber;
          app.reviewedBy = adminName;
          app.reviewedAt = now;
          app.updatedAt = now;
        }
      }

      // Add student notification
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: student.id,
        title: 'Room Allotment Confirmed',
        message: `You have been officially allotted Bed ${targetBed.bedNumber} in ${room.roomNumber} (${room.blockName}).`,
        type: 'success',
        isRead: false,
        createdAt: now,
        link: '/dashboard',
      });

      // Audit log
      this.data.auditLogs.unshift({
        id: `audit-${crypto.randomUUID()}`,
        timestamp: now,
        adminId,
        adminName,
        action: 'Room Allotted',
        category: 'allotment',
        details: `Allotted Room ${room.roomNumber} Bed ${targetBed.bedNumber} to ${student.fullName} (${profile.rollNumber}).`,
        targetEntityId: allotment.id,
      });

      await this.save();
      return { allotment, room };
    });
  }

  // --- Concurrency-Safe Vacate / De-Allot Room ---
  public async atomicVacateRoom(
    studentId: string,
    adminId: string,
    adminName: string,
    notes = 'Hostel bed vacated by administration.'
  ): Promise<void> {
    return dbMutex.runExclusive(async () => {
      const student = this.data.users.find((u) => u.id === studentId);
      const profile = this.data.studentProfiles.find((p) => p.userId === studentId);
      if (!profile || !profile.allottedRoomId) {
        throw new Error('Student has no active room allotment to vacate.');
      }

      const room = this.data.rooms.find((r) => r.id === profile.allottedRoomId);
      const now = new Date().toISOString();

      if (room) {
        const bed = room.beds.find((b) => b.studentId === studentId);
        if (bed) {
          bed.isOccupied = false;
          bed.studentId = null;
          bed.studentName = null;
          bed.studentRollNo = null;
          bed.allottedAt = null;
        }
        room.occupiedBeds = room.beds.filter((b) => b.isOccupied).length;
      }

      // Deactivate allotment record
      const activeAlt = this.data.allotments.find((a) => a.studentId === studentId && a.status === 'active');
      if (activeAlt) {
        activeAlt.status = 'vacated';
        activeAlt.vacatedAt = now;
        activeAlt.notes = notes;
      }

      const oldRoomNumber = room ? room.roomNumber : 'Unknown';
      profile.allottedRoomId = null;
      profile.allottedBedNumber = null;
      profile.allottedBlock = null;
      profile.allotmentStatus = 'vacated';
      profile.updatedAt = now;

      // Add notification
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: studentId,
        title: 'Room Vacated',
        message: `Your room allotment in ${oldRoomNumber} has been vacated. Contact the warden office for any queries.`,
        type: 'warning',
        isRead: false,
        createdAt: now,
        link: '/dashboard',
      });

      // Audit log
      this.data.auditLogs.unshift({
        id: `audit-${crypto.randomUUID()}`,
        timestamp: now,
        adminId,
        adminName,
        action: 'Room Vacated',
        category: 'de-allotment',
        details: `Vacated Room ${oldRoomNumber} for student ${student?.fullName || studentId}. Reason: ${notes}`,
        targetEntityId: studentId,
      });

      await this.save();
    });
  }

  // --- Room Change Requests ---
  public getChangeRequests(): RoomChangeRequest[] {
    return this.data.changeRequests;
  }

  public getChangeRequestById(id: string): RoomChangeRequest | undefined {
    return this.data.changeRequests.find((r) => r.id === id);
  }

  public async submitRoomChangeRequest(data: {
    studentId: string;
    requestedBlockId?: string;
    requestedRoomType?: RoomType;
    targetRoomId?: string;
    reasonCategory: RoomChangeRequest['reasonCategory'];
    reasonDetails: string;
  }): Promise<RoomChangeRequest> {
    return dbMutex.runExclusive(async () => {
      const student = this.data.users.find((u) => u.id === data.studentId);
      const profile = this.data.studentProfiles.find((p) => p.userId === data.studentId);
      if (!profile || !profile.allottedRoomId) {
        throw new Error('Only students with an active room allotment can submit a room change request.');
      }

      // Check pending request
      const existing = this.data.changeRequests.find((cr) => cr.studentId === data.studentId && cr.status === 'pending');
      if (existing) {
        throw new Error('You already have a pending room change request.');
      }

      const currentRoom = this.data.rooms.find((r) => r.id === profile.allottedRoomId);
      if (!currentRoom) throw new Error('Current room not found');

      let targetRoomNumber: string | undefined;
      if (data.targetRoomId) {
        const tr = this.data.rooms.find((r) => r.id === data.targetRoomId);
        if (tr) {
          targetRoomNumber = tr.roomNumber;
        }
      }

      const now = new Date().toISOString();
      const newReq: RoomChangeRequest = {
        id: `cr-${crypto.randomUUID()}`,
        studentId: data.studentId,
        studentName: student?.fullName || 'Student',
        studentRollNo: profile.rollNumber,
        currentRoomId: currentRoom.id,
        currentRoomNumber: currentRoom.roomNumber,
        currentBedNumber: profile.allottedBedNumber || 1,
        currentBlockName: currentRoom.blockName,
        requestedBlockId: data.requestedBlockId,
        requestedRoomType: data.requestedRoomType,
        targetRoomId: data.targetRoomId,
        targetRoomNumber,
        reasonCategory: data.reasonCategory,
        reasonDetails: data.reasonDetails,
        status: 'pending',
        submittedAt: now,
      };

      this.data.changeRequests.unshift(newReq);

      // Student notification
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: data.studentId,
        title: 'Room Change Request Submitted',
        message: `Your request to switch from ${currentRoom.roomNumber} has been recorded.`,
        type: 'info',
        isRead: false,
        createdAt: now,
        link: '/room-switch',
      });

      // Admin notification
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: 'admins',
        title: 'New Room Switch Request',
        message: `${newReq.studentName} requested room change from ${currentRoom.roomNumber}. Reason: ${data.reasonCategory}.`,
        type: 'warning',
        isRead: false,
        createdAt: now,
        link: '/admin/room-changes',
      });

      await this.save();
      return newReq;
    });
  }

  public async cancelRoomChangeRequest(requestId: string, studentId: string): Promise<void> {
    return dbMutex.runExclusive(async () => {
      const req = this.data.changeRequests.find((r) => r.id === requestId);
      if (!req) throw new Error('Request not found');
      if (req.studentId !== studentId) throw new Error('Unauthorized');
      if (req.status !== 'pending') throw new Error('Cannot cancel a request that is already processed.');

      req.status = 'cancelled';
      await this.save();
    });
  }

  // --- Concurrency-Safe Transactional Room Switch Approval ---
  public async atomicProcessRoomChange(
    requestId: string,
    action: 'approve' | 'reject',
    targetRoomId?: string,
    targetBedNumber?: number,
    adminRemarks?: string,
    adminId = 'admin',
    adminName = 'Administrator'
  ): Promise<RoomChangeRequest> {
    return dbMutex.runExclusive(async () => {
      const request = this.data.changeRequests.find((r) => r.id === requestId);
      if (!request) throw new Error('Room change request not found');
      if (request.status !== 'pending') throw new Error('Request has already been processed.');

      const now = new Date().toISOString();
      const profile = this.data.studentProfiles.find((p) => p.userId === request.studentId);
      if (!profile) throw new Error('Student profile not found');

      if (action === 'reject') {
        request.status = 'rejected';
        request.adminRemarks = adminRemarks || 'Room switch request declined by hostel administration.';
        request.processedBy = adminName;
        request.processedAt = now;

        this.data.notifications.push({
          id: `notif-${crypto.randomUUID()}`,
          userId: request.studentId,
          title: 'Room Change Request Declined',
          message: `Your room change request was declined. Remarks: ${request.adminRemarks}`,
          type: 'alert',
          isRead: false,
          createdAt: now,
          link: '/room-switch',
        });

        this.data.auditLogs.unshift({
          id: `audit-${crypto.randomUUID()}`,
          timestamp: now,
          adminId,
          adminName,
          action: 'Room Change Rejected',
          category: 'room-change',
          details: `Rejected room switch request for ${request.studentName}. Reason: ${request.adminRemarks}`,
          targetEntityId: request.id,
        });

        await this.save();
        return request;
      }

      // Action is APPROVE: Must be atomic!
      const newRoomId = targetRoomId || request.targetRoomId;
      if (!newRoomId) {
        throw new Error('Target room must be specified to approve room switch.');
      }

      const newRoom = this.data.rooms.find((r) => r.id === newRoomId);
      if (!newRoom) throw new Error('Destination room not found');
      if (newRoom.status !== 'active') throw new Error('Destination room is not active.');

      // Check available beds in new room
      const availableBeds = newRoom.beds.filter((b) => !b.isOccupied);
      if (availableBeds.length === 0) {
        throw new Error(`Destination room ${newRoom.roomNumber} has no vacant beds.`);
      }

      const assignedBed = targetBedNumber ? availableBeds.find((b) => b.bedNumber === targetBedNumber) || availableBeds[0] : availableBeds[0];

      // Step 1: Vacate old bed atomically
      const oldRoom = this.data.rooms.find((r) => r.id === profile.allottedRoomId);
      if (oldRoom) {
        const oldBed = oldRoom.beds.find((b) => b.studentId === request.studentId);
        if (oldBed) {
          oldBed.isOccupied = false;
          oldBed.studentId = null;
          oldBed.studentName = null;
          oldBed.studentRollNo = null;
          oldBed.allottedAt = null;
        }
        oldRoom.occupiedBeds = oldRoom.beds.filter((b) => b.isOccupied).length;
      }

      // Mark old allotment as transferred
      const oldAlt = this.data.allotments.find((a) => a.studentId === request.studentId && a.status === 'active');
      if (oldAlt) {
        oldAlt.status = 'transferred';
        oldAlt.vacatedAt = now;
        oldAlt.notes = `Transferred to ${newRoom.roomNumber} Bed ${assignedBed.bedNumber} via room change request.`;
      }

      // Step 2: Occupy new bed atomically
      assignedBed.isOccupied = true;
      assignedBed.studentId = request.studentId;
      assignedBed.studentName = request.studentName;
      assignedBed.studentRollNo = request.studentRollNo;
      assignedBed.allottedAt = now;
      newRoom.occupiedBeds = newRoom.beds.filter((b) => b.isOccupied).length;

      // Step 3: Update student profile
      profile.allottedRoomId = newRoom.id;
      profile.allottedBedNumber = assignedBed.bedNumber;
      profile.allottedBlock = newRoom.blockName;
      profile.updatedAt = now;

      // Step 4: Create new active allotment
      const newAllotment: RoomAllotment = {
        id: `alt-${crypto.randomUUID()}`,
        studentId: request.studentId,
        studentName: request.studentName,
        studentRollNo: request.studentRollNo,
        roomId: newRoom.id,
        roomNumber: newRoom.roomNumber,
        bedNumber: assignedBed.bedNumber,
        blockName: newRoom.blockName,
        allottedBy: adminName,
        allottedAt: now,
        academicYear: this.data.systemSettings.academicYear,
        status: 'active',
        notes: `Allotted via approved room-change request from ${request.currentRoomNumber}.`,
      };
      this.data.allotments.unshift(newAllotment);

      // Step 5: Finalize request record
      request.status = 'approved';
      request.adminRemarks = adminRemarks || `Approved. Transferred to ${newRoom.roomNumber} Bed ${assignedBed.bedNumber}.`;
      request.allottedNewRoomId = newRoom.id;
      request.allottedNewBedNumber = assignedBed.bedNumber;
      request.processedBy = adminName;
      request.processedAt = now;

      // Step 6: Notify student
      this.data.notifications.push({
        id: `notif-${crypto.randomUUID()}`,
        userId: request.studentId,
        title: 'Room Change Request Approved!',
        message: `Your room change has been processed. Your new allotment is Room ${newRoom.roomNumber}, Bed ${assignedBed.bedNumber} in ${newRoom.blockName}.`,
        type: 'success',
        isRead: false,
        createdAt: now,
        link: '/dashboard',
      });

      // Step 7: Audit log
      this.data.auditLogs.unshift({
        id: `audit-${crypto.randomUUID()}`,
        timestamp: now,
        adminId,
        adminName,
        action: 'Room Switch Executed',
        category: 'room-change',
        details: `Successfully switched ${request.studentName} from ${request.currentRoomNumber} to ${newRoom.roomNumber} (Bed ${assignedBed.bedNumber}).`,
        targetEntityId: request.id,
      });

      await this.save();
      return request;
    });
  }

  // --- Smart Automatic Allotment ---
  public async autoAllotPendingApplications(adminId: string, adminName: string): Promise<{ allottedCount: number; messages: string[] }> {
    return dbMutex.runExclusive(async () => {
      const pendingApps = this.data.applications.filter((a) => a.status === 'pending');
      let count = 0;
      const messages: string[] = [];

      for (const app of pendingApps) {
        const student = this.data.users.find((u) => u.id === app.studentId);
        const profile = this.data.studentProfiles.find((p) => p.userId === app.studentId);
        if (!student || !profile || profile.allottedRoomId) continue;

        // Find candidate rooms matching preferences
        const eligibleRooms = this.data.rooms.filter((r) => {
          if (r.status !== 'active') return false;
          if (r.gender !== 'any' && r.gender !== app.gender) return false;
          if (r.occupiedBeds >= r.capacity) return false;

          // Match block if possible
          if (app.preferredBlockId && r.blockId !== app.preferredBlockId) return false;

          // Match room type if possible
          if (app.preferredRoomType && r.roomType !== app.preferredRoomType) return false;

          // Match AC preference if possible
          if (app.isACPreferred && !r.isAC) return false;

          return true;
        });

        let targetRoom = eligibleRooms[0];
        // Fallback: relax block or AC if strict match not available
        if (!targetRoom) {
          targetRoom = this.data.rooms.find((r) => {
            return (
              r.status === 'active' &&
              (r.gender === 'any' || r.gender === app.gender) &&
              r.occupiedBeds < r.capacity &&
              r.roomType === app.preferredRoomType
            );
          }) || this.data.rooms.find((r) => {
            return (
              r.status === 'active' &&
              (r.gender === 'any' || r.gender === app.gender) &&
              r.occupiedBeds < r.capacity
            );
          })!;
        }

        if (targetRoom) {
          const vacantBed = targetRoom.beds.find((b) => !b.isOccupied);
          if (vacantBed) {
            const now = new Date().toISOString();
            vacantBed.isOccupied = true;
            vacantBed.studentId = student.id;
            vacantBed.studentName = student.fullName;
            vacantBed.studentRollNo = profile.rollNumber;
            vacantBed.allottedAt = now;
            targetRoom.occupiedBeds = targetRoom.beds.filter((b) => b.isOccupied).length;

            profile.allottedRoomId = targetRoom.id;
            profile.allottedBedNumber = vacantBed.bedNumber;
            profile.allottedBlock = targetRoom.blockName;
            profile.allotmentStatus = 'allotted';
            profile.updatedAt = now;

            app.status = 'approved';
            app.allottedRoomId = targetRoom.id;
            app.allottedBedNumber = vacantBed.bedNumber;
            app.adminRemarks = 'Auto-allotted based on preference matching and room availability.';
            app.reviewedBy = adminName;
            app.reviewedAt = now;
            app.updatedAt = now;

            const allotment: RoomAllotment = {
              id: `alt-${crypto.randomUUID()}`,
              studentId: student.id,
              studentName: student.fullName,
              studentRollNo: profile.rollNumber,
              roomId: targetRoom.id,
              roomNumber: targetRoom.roomNumber,
              bedNumber: vacantBed.bedNumber,
              blockName: targetRoom.blockName,
              allottedBy: `${adminName} (Auto-Allot)`,
              allottedAt: now,
              academicYear: this.data.systemSettings.academicYear,
              status: 'active',
            };
            this.data.allotments.unshift(allotment);

            this.data.notifications.push({
              id: `notif-${crypto.randomUUID()}`,
              userId: student.id,
              title: 'Room Allotted via Automated Batch',
              message: `Your application has been processed. Allotted ${targetRoom.roomNumber} Bed ${vacantBed.bedNumber}.`,
              type: 'success',
              isRead: false,
              createdAt: now,
              link: '/dashboard',
            });

            count++;
            messages.push(`Allotted ${student.fullName} (${profile.rollNumber}) to ${targetRoom.roomNumber} Bed ${vacantBed.bedNumber}`);
          }
        } else {
          // Waitlist if no matching room available
          app.status = 'waitlisted';
          app.adminRemarks = 'No matching room available in current batch. Placed on priority waitlist.';
          app.reviewedBy = adminName;
          app.reviewedAt = new Date().toISOString();
        }
      }

      if (count > 0) {
        this.data.auditLogs.unshift({
          id: `audit-${crypto.randomUUID()}`,
          timestamp: new Date().toISOString(),
          adminId,
          adminName,
          action: 'Batch Auto-Allotment Executed',
          category: 'allotment',
          details: `Processed auto-allotment for ${count} students.`,
        });
      }

      await this.save();
      return { allottedCount: count, messages };
    });
  }

  // --- Notifications ---
  public getNotifications(userId: string, role: string): NotificationItem[] {
    return this.data.notifications.filter(
      (n) => n.userId === userId || n.userId === 'broadcast' || (role === 'admin' && n.userId === 'admins')
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markNotificationRead(id: string): Promise<void> {
    return dbMutex.runExclusive(async () => {
      const n = this.data.notifications.find((notif) => notif.id === id);
      if (n) {
        n.isRead = true;
        await this.save();
      }
    });
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    return dbMutex.runExclusive(async () => {
      this.data.notifications.forEach((n) => {
        if (n.userId === userId || n.userId === 'admins') {
          n.isRead = true;
        }
      });
      await this.save();
    });
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLogItem[] {
    return this.data.auditLogs;
  }
}

export const dbInstance = new HostelDatabase();
