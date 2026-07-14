import { apiClient } from './apiClient';

export interface KycUpgradeRequest {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  targetTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  bvn?: string;
  nin?: string;
  documentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  kycLevel: 'TIER_1' | 'TIER_2' | 'TIER_3';
  hasTransactionPin: boolean;
}

export const kycService = {
  /**
   * Set or update transaction PIN.
   */
  async setupPin(pin: string, oldPin?: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/kyc/pin', { pin, oldPin });
    return response.data;
  },

  /**
   * Submit upgrade request.
   */
  async submitUpgrade(data: {
    targetTier: 'TIER_2' | 'TIER_3';
    bvn?: string;
    nin?: string;
    documentUrl?: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/kyc/upgrade', data);
    return response.data;
  },

  /**
   * Get fresh user profile containing latest KYC/PIN details.
   */
  async getUserProfile(): Promise<UserProfileResponse> {
    const response = await apiClient.get<UserProfileResponse>('/api/v1/auth/me');
    return response.data;
  },

  /**
   * Fetch pending requests for admin review.
   */
  async getPendingRequests(): Promise<KycUpgradeRequest[]> {
    const response = await apiClient.get<KycUpgradeRequest[]>('/api/v1/admin/kyc/requests');
    return response.data;
  },

  /**
   * Approve a pending upgrade request.
   */
  async approveRequest(id: string): Promise<{ message: string }> {
    const response = await apiClient.patch(`/api/v1/admin/kyc/requests/${id}/approve`);
    return response.data;
  },

  /**
   * Reject a pending upgrade request.
   */
  async rejectRequest(id: string): Promise<{ message: string }> {
    const response = await apiClient.patch(`/api/v1/admin/kyc/requests/${id}/reject`);
    return response.data;
  }
};
