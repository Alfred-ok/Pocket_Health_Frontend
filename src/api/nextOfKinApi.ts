import api from "./axios";
import type { NextOfKin } from "../types/pocketHealth";

export interface NextOfKinBody {
  profileId: string;
  fullName: string;
  relationship: string;
  phone1: string;
  phone2?: string;
  emergencyType?: string;
  priority?: number;
}

export default {
  async create(body: NextOfKinBody) {
    const res = await api.post("/next-of-kin", body);
    return res.data.data;
  },

  async update(id: string, body: Partial<NextOfKinBody>) {
    const res = await api.patch(`/next-of-kin/${id}`, body);
    return res.data.data;
  },

  async delete(id: string) {
    await api.delete(`/next-of-kin/${id}`);
  },

  async getByProfile(profileId: string): Promise<NextOfKin[]> {
    const res = await api.get(`/next-of-kin/profile/${profileId}`);
    return res.data.data;
  },
};