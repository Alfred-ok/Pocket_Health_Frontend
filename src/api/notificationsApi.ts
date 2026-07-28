import api from "./axios";
import type { ApiResponse, Notification } from "../types/pocketHealth";

const notificationsApi = {
  create: async (body: { userId: string; title: string; body?: string; notifType?: string }) => {
    const res = await api.post<ApiResponse<Notification>>("/notifications", body);
    return res.data.data;
  },

  getByUser: async (userId: string) => {
    const res = await api.get<ApiResponse<Notification[]>>(`/notifications/user/${userId}`);
    return res.data.data;
  },

  getUnread: async (userId: string) => {
    const res = await api.get<ApiResponse<Notification[]>>(`/notifications/user/${userId}/unread`);
    return res.data.data;
  },

  getUnreadCount: async (userId: string) => {
    const res = await api.get<ApiResponse<number>>(`/notifications/user/${userId}/unread/count`);
    return res.data.data;
  },

  markRead: async (id: string) => {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllRead: async (userId: string) => {
    await api.patch<ApiResponse<void>>(`/notifications/user/${userId}/read-all`);
  },
};

export default notificationsApi;
