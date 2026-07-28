import api from "./axios";
import type { Consultation, ApiResponse } from "../types/pocketHealth";

const consultationsApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Consultation[]>>("/consultations");
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Consultation>>(`/consultations/${id}`);
    return res.data.data;
  },

  getByProfile: async (profileId: string) => {
    const res = await api.get<ApiResponse<Consultation[]>>(`/consultations/profile/${profileId}`);
    return res.data.data;
  },

  getByProvider: async (providerId: string) => {
    const res = await api.get<ApiResponse<Consultation[]>>(`/consultations/provider/${providerId}`);
    return res.data.data;
  },

  create: async (body: { patientProfileId: string; providerId: string; callType: string }) => {
    const res = await api.post<ApiResponse<Consultation>>("/consultations", body);
    return res.data.data;
  },

  update: async (
    id: string,
    body: { status?: string; startedAt?: string; endedAt?: string; amountCharged?: number }
  ) => {
    const res = await api.patch<ApiResponse<Consultation>>(`/consultations/${id}`, body);
    return res.data.data;
  },
};

export default consultationsApi;
