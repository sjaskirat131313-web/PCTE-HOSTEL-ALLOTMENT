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
  StatsData,
} from '../types';

const TOKEN_KEY = 'pcte_hostel_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; profile: StudentProfile | null }> {
    const res = await request<{ token: string; user: User; profile: StudentProfile | null }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async register(data: any): Promise<{ token: string; user: User; profile: StudentProfile | null }> {
    const res = await request<{ token: string; user: User; profile: StudentProfile | null }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User; profile: StudentProfile | null }> {
    return request<{ user: User; profile: StudentProfile | null }>('/auth/me');
  },

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  // Students
  async getStudentProfile(): Promise<{ profile: StudentProfile }> {
    return request<{ profile: StudentProfile }>('/students/profile');
  },

  async updateStudentProfile(data: Partial<StudentProfile>): Promise<{ profile: StudentProfile }> {
    return request<{ profile: StudentProfile }>('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAllStudents(): Promise<{ students: any[] }> {
    return request<{ students: any[] }>('/students');
  },

  // Blocks & Rooms
  async getBlocks(): Promise<{ blocks: HostelBlock[] }> {
    return request<{ blocks: HostelBlock[] }>('/blocks');
  },

  async getRooms(params: Record<string, any> = {}): Promise<{ rooms: HostelRoom[] }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ rooms: HostelRoom[] }>(`/rooms${qs}`);
  },

  async getRoomById(id: string): Promise<{ room: HostelRoom }> {
    return request<{ room: HostelRoom }>(`/rooms/${id}`);
  },

  async createRoom(data: any): Promise<{ room: HostelRoom }> {
    return request<{ room: HostelRoom }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateRoom(id: string, data: any): Promise<{ room: HostelRoom }> {
    return request<{ room: HostelRoom }>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Applications
  async getApplications(): Promise<{ applications: HostelApplication[] }> {
    return request<{ applications: HostelApplication[] }>('/applications');
  },

  async submitApplication(data: any): Promise<{ application: HostelApplication }> {
    return request<{ application: HostelApplication }>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateApplicationStatus(id: string, status: string, adminRemarks?: string): Promise<{ application: HostelApplication }> {
    return request<{ application: HostelApplication }>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminRemarks }),
    });
  },

  // Allotments
  async getAllotments(): Promise<{ allotments: RoomAllotment[] }> {
    return request<{ allotments: RoomAllotment[] }>('/allotments');
  },

  async allotRoom(data: { studentId: string; roomId: string; bedNumber?: number; applicationId?: string }): Promise<{ allotment: RoomAllotment; room: HostelRoom }> {
    return request<{ allotment: RoomAllotment; room: HostelRoom }>('/allotments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async vacateRoom(studentId: string, notes?: string): Promise<{ message: string }> {
    return request<{ message: string }>('/allotments/vacate', {
      method: 'POST',
      body: JSON.stringify({ studentId, notes }),
    });
  },

  async autoAllot(): Promise<{ allottedCount: number; messages: string[] }> {
    return request<{ allottedCount: number; messages: string[] }>('/allotments/auto', {
      method: 'POST',
    });
  },

  // Room Changes
  async getRoomChangeRequests(): Promise<{ requests: RoomChangeRequest[] }> {
    return request<{ requests: RoomChangeRequest[] }>('/room-change-requests');
  },

  async submitRoomChangeRequest(data: any): Promise<{ request: RoomChangeRequest }> {
    return request<{ request: RoomChangeRequest }>('/room-change-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async cancelRoomChangeRequest(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/room-change-requests/${id}`, {
      method: 'DELETE',
    });
  },

  async processRoomChange(id: string, data: { action: 'approve' | 'reject'; targetRoomId?: string; targetBedNumber?: number; adminRemarks?: string }): Promise<{ request: RoomChangeRequest }> {
    return request<{ request: RoomChangeRequest }>(`/room-change-requests/${id}/process`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return request<{ notifications: NotificationItem[] }>('/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    });
  },

  // Reports
  async getStats(): Promise<StatsData> {
    return request<StatsData>('/reports/stats');
  },

  getExportCsvUrl(type: 'allotments' | 'rooms' | 'applications'): string {
    const token = getStoredToken();
    return `/api/reports/export-csv?type=${type}&token=${token || ''}`;
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ auditLogs: AuditLogItem[] }> {
    return request<{ auditLogs: AuditLogItem[] }>('/audit-logs');
  },

  // System
  async resetDemo(): Promise<{ message: string }> {
    return request<{ message: string }>('/system/reset-demo', {
      method: 'POST',
    });
  },
};
