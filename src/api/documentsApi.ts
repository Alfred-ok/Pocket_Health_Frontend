import api from "./axios";
import type { ApiResponse, Document } from "../types/pocketHealth";

export interface CreateDocumentBody {
  ownerProfileId: string;
  docType?: string;
  fileUrl: string;
  fileName?: string;
  sharedWith?: string;
}

const documentsApi = {
  create: async (body: CreateDocumentBody) => {
    const res = await api.post<ApiResponse<Document>>("/documents", body);
    return res.data.data;
  },

  getByProfile: async (profileId: string, type?: string) => {
    const res = await api.get<ApiResponse<Document[]>>(`/documents/profile/${profileId}`, {
      params: type ? { type } : undefined,
    });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return res.data.data;
  },

  update: async (id: string, body: Partial<CreateDocumentBody>) => {
    const res = await api.patch<ApiResponse<Document>>(`/documents/${id}`, body);
    return res.data.data;
  },

  remove: async (id: string) => {
    await api.delete<ApiResponse<void>>(`/documents/${id}`);
  },
};

export default documentsApi;
