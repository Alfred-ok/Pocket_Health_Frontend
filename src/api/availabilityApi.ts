import api from "./axios";
import type { ApiResponse, AvailableSlot, ProviderAvailability } from "../types/pocketHealth";

const availabilityApi = {
  getByProvider: async (providerId: string) => {
    const res = await api.get<ApiResponse<ProviderAvailability[]>>(`/providers/${providerId}/availability`);
    return res.data.data;
  },

  getSlots: async (providerId: string, date: string) => {
    const res = await api.get<ApiResponse<AvailableSlot[]>>(`/providers/${providerId}/availability/slots`, {
      params: { date },
    });
    return res.data.data;
  },

  create: async (
    providerId: string,
    body: { dayOfWeek: number; startTime: string; endTime: string; slotDurationMinutes?: number; isActive?: boolean }
  ) => {
    const res = await api.post<ApiResponse<ProviderAvailability>>(`/providers/${providerId}/availability`, body);
    return res.data.data;
  },

  update: async (availabilityId: string, body: Record<string, unknown>) => {
    const res = await api.patch<ApiResponse<ProviderAvailability>>(`/providers/availability/${availabilityId}`, body);
    return res.data.data;
  },

  remove: async (availabilityId: string) => {
    await api.delete(`/providers/availability/${availabilityId}`);
  },
};

export default availabilityApi;
