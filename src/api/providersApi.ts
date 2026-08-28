import api from "./axios";
import type { ApiResponse, Provider } from "../types/pocketHealth";

export interface ProviderSearchParams {
  query?: string;
  specialty?: string;
  region?: string;
  category?: string;
  available?: boolean;
}

const providersApi = {
  search: async (params: ProviderSearchParams) => {
    const res = await api.get<ApiResponse<Provider[]>>("/providers/search", { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
    return res.data.data;
  },

  getByUserId: async (userId: string) => {
    const res = await api.get<ApiResponse<Provider>>(`/providers/user/${userId}`);
    return res.data.data;
  },

  getSpecialties: async () => {
    const res = await api.get<ApiResponse<string[]>>("/providers/specialties");
    return res.data.data;
  },

  getCategories: async () => {
    const res = await api.get<ApiResponse<string[]>>("/providers/categories");
    return res.data.data;
  },

  update: async (id: string, body: Record<string, unknown>) => {
    const res = await api.patch<ApiResponse<Provider>>(`/providers/${id}`, body);
    return res.data.data;
  },
};

export default providersApi;
