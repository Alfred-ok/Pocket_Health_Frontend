import api from "./axios";
import type { ApiResponse, HealthTopic } from "../types/pocketHealth";

const healthTopicApi = {
  getByModule: async (moduleKey: string) => {
    const res = await api.get<ApiResponse<HealthTopic[]>>(`/health-topics/module/${moduleKey}`);
    return res.data.data;
  },
};

export default healthTopicApi;
