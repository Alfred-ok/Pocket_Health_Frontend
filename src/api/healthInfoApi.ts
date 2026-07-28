import api from "./axios";
import type { ApiResponse, HealthInfo } from "../types/pocketHealth";

export interface HealthInfoBody {
  profileId?: string;
  identifier?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  mentalConditions?: string;
  longTermMeds?: string;
  familyHistory?: string;
  drugUse?: string;
}

const healthInfoApi = {
  create: async (body: HealthInfoBody) => {
    const res = await api.post<ApiResponse<HealthInfo>>("/health-info", body);
    return res.data.data;
  },

  getByProfile: async (profileId: string) => {
    const res = await api.get<ApiResponse<HealthInfo>>(`/health-info/profile/${profileId}`);
    return res.data.data;
  },

  update: async (id: string, body: HealthInfoBody) => {
    const res = await api.patch<ApiResponse<HealthInfo>>(`/health-info/${id}`, body);
    return res.data.data;
  },
};

export default healthInfoApi;
