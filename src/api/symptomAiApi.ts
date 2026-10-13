import api from "./axios";
import type { ApiResponse } from "../types/pocketHealth";

export interface SymptomCheckRequest {
  symptoms: string[];
  possibleConditions?: string[];
  /** Who the check is for; the server turns this into fixed prompt wording. */
  audience?: "adult" | "child" | "pregnant" | "lactating";
  weeks?: number;
}

const symptomAiApi = {
  analyze: async (body: SymptomCheckRequest) => {
    const res = await api.post<ApiResponse<string>>("/symptom-checker/analyze", body);
    return res.data.data;
  },
};

export default symptomAiApi;
