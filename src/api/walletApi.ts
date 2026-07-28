import api from "./axios";
import type { ApiResponse, Wallet } from "../types/pocketHealth";

const walletApi = {
  create: async (userId: string) => {
    const res = await api.post<ApiResponse<Wallet>>("/wallets", { userId });
    return res.data.data;
  },

  getByUser: async (userId: string) => {
    const res = await api.get<ApiResponse<Wallet>>(`/wallets/user/${userId}`);
    return res.data.data;
  },

  topUp: async (walletId: string, amount: number) => {
    const res = await api.patch<ApiResponse<Wallet>>(`/wallets/${walletId}/topup`, { amount });
    return res.data.data;
  },

  debit: async (walletId: string, amount: number) => {
    const res = await api.patch<ApiResponse<Wallet>>(`/wallets/${walletId}/debit`, { amount });
    return res.data.data;
  },
};

export default walletApi;
