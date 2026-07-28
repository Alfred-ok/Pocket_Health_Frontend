import api from "./axios";
import type { Profile, ApiResponse } from "../types/pocketHealth";

export interface ProfileBody {
  userId?: string;
  surname?: string;
  otherNames?: string;
  dateOfBirth?: string;
  gender?: string;
  phone1?: string;
  residence?: string;
  region?: string;
  relation?: string;
  isPrimary?: boolean;
}

const profilesApi = {
  create: async (body: ProfileBody) => {
    const res = await api.post<ApiResponse<Profile>>("/profiles", body);
    return res.data.data;
  },

  getByUser: async (userId: string) => {
    const res = await api.get<ApiResponse<Profile[]>>(`/profiles/user/${userId}`);
    return res.data.data;
  },

  update: async (id: string, body: ProfileBody) => {
    const res = await api.patch<ApiResponse<Profile>>(`/profiles/${id}`, body);
    return res.data.data;
  },
};

export default profilesApi;
