import api from "./axios";
import type { ApiResponse, Insurance } from "../types/pocketHealth";

export interface InsuranceBody {
  profileId?: string;
  insurerName?: string;
  policyNumber?: string;
  phone1?: string;
  phone2?: string;
}

const insuranceApi = {
  create: async (body: InsuranceBody) => {
    const res = await api.post<ApiResponse<Insurance>>("/insurance", body);
    return res.data.data;
  },

  getByProfile: async (profileId: string) => {
    const res = await api.get<ApiResponse<Insurance[]>>(`/insurance/profile/${profileId}`);
    return res.data.data;
  },

  update: async (id: string, body: InsuranceBody) => {
    const res = await api.patch<ApiResponse<Insurance>>(`/insurance/${id}`, body);
    return res.data.data;
  },

  remove: async (id: string) => {
    await api.delete<ApiResponse<void>>(`/insurance/${id}`);
  },
};

export default insuranceApi;
