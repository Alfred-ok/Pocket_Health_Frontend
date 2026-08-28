import api from "./axios";
import type { ApiResponse, EmergencyAlert } from "../types/pocketHealth";

export interface EmergencyAlertBody {
  profileId?: string;
  alertType?: string;
  notes?: string;
  location?: string;
  recordingDocumentId?: string;
  status?: string;
}

const emergencyAlertsApi = {
  create: async (body: EmergencyAlertBody) => {
    const res = await api.post<ApiResponse<EmergencyAlert>>("/emergency-alerts", body);
    return res.data.data;
  },

  getByProfile: async (profileId: string) => {
    const res = await api.get<ApiResponse<EmergencyAlert[]>>(`/emergency-alerts/profile/${profileId}`);
    return res.data.data;
  },

  update: async (id: string, body: EmergencyAlertBody) => {
    const res = await api.patch<ApiResponse<EmergencyAlert>>(`/emergency-alerts/${id}`, body);
    return res.data.data;
  },
};

export default emergencyAlertsApi;
