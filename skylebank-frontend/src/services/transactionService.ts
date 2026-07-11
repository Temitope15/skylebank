import { apiClient } from './apiClient';

export interface TransactionFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface TransactionResponse {
  id: number;
  reference: string;
  sourceWalletNumber: string;
  sourceWalletOwnerName: string;
  targetWalletNumber: string;
  targetWalletOwnerName: string;
  amount: number;
  currency: string;
  transactionType: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface PaginatedTransactions {
  content: TransactionResponse[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export const transactionService = {
  /**
   * Retrieves paginated transactions for the logged-in customer.
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<PaginatedTransactions> {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await apiClient.get<PaginatedTransactions>('/api/v1/transactions', { params });
    return response.data;
  }
};
