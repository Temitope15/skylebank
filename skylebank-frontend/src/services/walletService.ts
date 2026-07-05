import { apiClient } from './apiClient';
import type { WalletInfo, WalletBalanceInfo } from '../types/wallet';

export const walletService = {
  /**
   * Retrieves full wallet details for the authenticated user.
   */
  async getWalletDetails(): Promise<WalletInfo> {
    const response = await apiClient.get<WalletInfo>('/api/v1/wallet');
    return response.data;
  },

  /**
   * Retrieves the wallet balance and currency only.
   */
  async getWalletBalance(): Promise<WalletBalanceInfo> {
    const response = await apiClient.get<WalletBalanceInfo>('/api/v1/wallet/balance');
    return response.data;
  }
};
