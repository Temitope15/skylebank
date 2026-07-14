import { apiClient } from './apiClient';

export interface TransferRequest {
  targetWalletNumber: string;
  amount: number;
  description: string;
  pin: string;
  trustConfirmed?: boolean;
}

export interface TransferResponse {
  reference: string;
  sourceWalletNumber: string;
  targetWalletNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
}

export const transferService = {
  /**
   * Dispatches a transfer request to the backend.
   */
  async executeTransfer(request: TransferRequest): Promise<TransferResponse> {
    const response = await apiClient.post<TransferResponse>('/api/v1/transfers', request);
    return response.data;
  }
};
