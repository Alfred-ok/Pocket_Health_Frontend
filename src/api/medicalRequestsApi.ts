import api from "./axios";
import type { ApiResponse, MedicalRequest } from "../types/pocketHealth";

export interface CreateMedicalRequestBody {
  consultationId: string;
  requestType: string;
  content?: string;
  sentToProviderId?: string;
}

const medicalRequestsApi = {
  create: async (body: CreateMedicalRequestBody) => {
    const res = await api.post<ApiResponse<MedicalRequest>>("/medical-requests", body);
    return res.data.data;
  },

  getByConsultation: async (consultationId: string) => {
    const res = await api.get<ApiResponse<MedicalRequest[]>>(`/medical-requests/consultation/${consultationId}`);
    return res.data.data;
  },

  getAll: async (type?: string) => {
    const res = await api.get<ApiResponse<MedicalRequest[]>>("/medical-requests", {
      params: type ? { type } : undefined,
    });
    return res.data.data;
  },

  update: async (id: string, body: Partial<CreateMedicalRequestBody>) => {
    const res = await api.patch<ApiResponse<MedicalRequest>>(`/medical-requests/${id}`, body);
    return res.data.data;
  },

  remove: async (id: string) => {
    await api.delete<ApiResponse<void>>(`/medical-requests/${id}`);
  },
};

export default medicalRequestsApi;
