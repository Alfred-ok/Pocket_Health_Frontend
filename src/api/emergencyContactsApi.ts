import api from "./axios";
import type { ApiResponse, EmergencyContact } from "../types/pocketHealth";

export interface EmergencyContactBody {
  profileId?: string;
  name?: string;
  phone1?: string;
  phone2?: string;
  priority?: number;
  emergencyType?: string;
}

const emergencyContactsApi = {
  create: async (body: EmergencyContactBody) => {
    const res = await api.post<ApiResponse<EmergencyContact>>("/emergency-contacts", body);
    return res.data.data;
  },

  getByProfile: async (profileId: string) => {
    const res = await api.get<ApiResponse<EmergencyContact[]>>(`/emergency-contacts/profile/${profileId}`);
    return res.data.data;
  },

  update: async (id: string, body: EmergencyContactBody) => {
    const res = await api.patch<ApiResponse<EmergencyContact>>(`/emergency-contacts/${id}`, body);
    return res.data.data;
  },

  remove: async (id: string) => {
    await api.delete<ApiResponse<void>>(`/emergency-contacts/${id}`);
  },
};

export default emergencyContactsApi;
