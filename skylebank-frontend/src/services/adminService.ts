import { apiClient } from './apiClient';

export interface AdminStats {
  totalUsers: number;
  totalActiveWallets: number;
  totalSystemBalance: number;
  totalTransactions: number;
  totalTransactionVolume: number;
  unresolvedComplaints: number;
  dbStatus: string;
  cacheStatus: string;
  systemFreeMemoryBytes: number;
  systemUptimeSeconds: number;
}

export interface AdminUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  walletNumber: string;
  walletBalance: number;
  walletStatus: 'ACTIVE' | 'SUSPENDED' | 'N/A';
}

export interface AdminTransaction {
  id: number;
  reference: string;
  sourceWalletNumber: string | null;
  targetWalletNumber: string;
  amount: number;
  transactionType: 'DEPOSIT' | 'TRANSFER';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  description: string;
  createdAt: string;
}

export interface ComplaintInfo {
  id: number;
  userEmail: string;
  userFullName: string;
  title: string;
  description: string;
  category: 'TRANSACTION' | 'ACCOUNT' | 'SECURITY' | 'OTHER';
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/api/v1/admin/stats');
    return response.data;
  }

  async getUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>('/api/v1/admin/users');
    return response.data;
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    await apiClient.patch(`/api/v1/admin/users/${userId}/status`, null, {
      params: { status }
    });
  }

  async updateWalletStatus(walletNumber: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    await apiClient.patch(`/api/v1/admin/wallets/${walletNumber}/status`, null, {
      params: { status }
    });
  }

  async getTransactions(): Promise<AdminTransaction[]> {
    const response = await apiClient.get<AdminTransaction[]>('/api/v1/admin/transactions');
    return response.data;
  }

  async getComplaints(): Promise<ComplaintInfo[]> {
    const response = await apiClient.get<ComplaintInfo[]>('/api/v1/admin/complaints');
    return response.data;
  }

  async resolveComplaint(id: number): Promise<void> {
    await apiClient.patch(`/api/v1/admin/complaints/${id}/resolve`);
  }
}

export const adminService = new AdminService();
