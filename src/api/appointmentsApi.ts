import api from "./axios";
import type { Appointment, ApiResponse } from "../types/pocketHealth";

const appointmentsApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Appointment[]>>("/appointments");
    return res.data.data;
  },

  getByProfile: async (profileId: string) => {
    const res = await api.get<ApiResponse<Appointment[]>>(`/appointments/profile/${profileId}`);
    return res.data.data;
  },

  getByProvider: async (providerId: string) => {
    const res = await api.get<ApiResponse<Appointment[]>>(`/appointments/provider/${providerId}`);
    return res.data.data;
  },

  book: async (body: { patientProfileId: string; providerId: string; scheduledAt: string; durationSlot?: number }) => {
    const res = await api.post<ApiResponse<Appointment>>("/appointments", body);
    return res.data.data;
  },

  update: async (id: string, body: { status?: string; attended?: boolean }) => {
    const res = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}`, body);
    return res.data.data;
  },

  cancel: async (id: string) => {
    await api.delete(`/appointments/${id}/cancel`);
  },
};

export default appointmentsApi;
