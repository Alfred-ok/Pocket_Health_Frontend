import api from "./axios";
import type { Review, ApiResponse } from "../types/pocketHealth";

export interface ProviderRating {
  providerId: string;
  totalReviews: number;
  averageRating: number;
}

export interface CreateReviewBody {
  reviewerProfileId: string;
  providerId: string;
  ratingQuality: number;
  ratingHelpful: number;
  ratingTimely: number;
  ratingCare: number;
  reviewText?: string;
}

const reviewsApi = {
  create: async (body: CreateReviewBody) => {
    const res = await api.post<ApiResponse<Review>>("/reviews", body);
    return res.data.data;
  },

  getByProvider: async (providerId: string) => {
    const res = await api.get<ApiResponse<Review[]>>(`/reviews/provider/${providerId}`);
    return res.data.data;
  },

  getRating: async (providerId: string) => {
    const res = await api.get<ApiResponse<ProviderRating>>(`/reviews/provider/${providerId}/rating`);
    return res.data.data;
  },
};

export default reviewsApi;
