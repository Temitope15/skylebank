import { apiClient } from './apiClient';
import type { ComplaintInfo } from './adminService';

export interface CreateComplaintDto {
  title: string;
  description: string;
  category: string; // TRANSACTION, ACCOUNT, SECURITY, OTHER
}

class ComplaintService {
  async fileComplaint(data: CreateComplaintDto): Promise<ComplaintInfo> {
    const response = await apiClient.post<ComplaintInfo>('/api/v1/complaints', data);
    return response.data;
  }

  async getUserComplaints(): Promise<ComplaintInfo[]> {
    const response = await apiClient.get<ComplaintInfo[]>('/api/v1/complaints');
    return response.data;
  }
}

export const complaintService = new ComplaintService();
