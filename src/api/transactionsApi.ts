import api from "./axios";
import type { ApiResponse, Transaction } from "../types/pocketHealth";

export interface CreateTransactionBody {
  walletId: string;
  amount: number;
  type: string;
  paymentMethod?: string;
  mpesaReference?: string;
  status?: string;
}

const transactionsApi = {
  create: async (body: CreateTransactionBody) => {
    const res = await api.post<ApiResponse<Transaction>>("/transactions", body);
    return res.data.data;
  },

  getByWallet: async (walletId: string) => {
    const res = await api.get<ApiResponse<Transaction[]>>(`/transactions/wallet/${walletId}`);
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return res.data.data;
  },
};

export default transactionsApi;
