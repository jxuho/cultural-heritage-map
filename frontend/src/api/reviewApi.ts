import axiosInstance from './axiosInstance';
import { ApiResponse } from '../types/api';
import { Review, ReviewInput } from '../types/review';
import { AxiosError } from 'axios';

/**
 * fetch reviews for a specific cultural site by place ID
 */
export const fetchReviewsByPlaceId = async (
  placeId: string,
): Promise<Review[]> => {
  if (!placeId) throw new Error('Place ID is required to fetch reviews.');

  try {
    const response = await axiosInstance.get<
      ApiResponse<{ reviews: Review[] }>
    >(`/cultural-sites/${placeId}/reviews`);
    return response.data.data.reviews || [];
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error fetching reviews for place ID ${placeId}:`, err);
    throw err;
  }
};

/**
 * create a new review for a specific cultural site
 */
export const createReview = async (
  placeId: string,
  reviewData: ReviewInput,
): Promise<Review | null> => {
  if (!placeId || !reviewData) {
    throw new Error('Place ID and review data are required.');
  }

  try {
    const response = await axiosInstance.post<ApiResponse<{ review: Review }>>(
      `/cultural-sites/${placeId}/reviews`,
      reviewData,
    );
    return response.data.data.review || null;
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error creating review for place ID ${placeId}:`, err);
    throw err;
  }
};

/**
 * update an existing review for a specific cultural site
 */
export const updateReview = async (
  placeId: string,
  reviewId: string,
  reviewData: ReviewInput,
): Promise<Review | null> => {
  if (!placeId || !reviewId || !reviewData) {
    throw new Error(
      'Required parameters (placeId, reviewId, data) are missing.',
    );
  }

  try {
    const response = await axiosInstance.patch<ApiResponse<{ review: Review }>>(
      `/cultural-sites/${placeId}/reviews/${reviewId}`,
      reviewData,
    );
    return response.data.data.review || null;
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error updating review ID ${reviewId}:`, err);
    throw err;
  }
};

/**
 * delete a review for a specific cultural site
 */
export const deleteReview = async (
  placeId: string,
  reviewId: string,
): Promise<boolean> => {
  if (!placeId || !reviewId) {
    throw new Error('Place ID and review ID are required.');
  }

  try {
    await axiosInstance.delete(
      `/cultural-sites/${placeId}/reviews/${reviewId}`,
    );
    return true;
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error deleting review ID ${reviewId}:`, err);
    throw err;
  }
};

/**
 * get the list of reviews I submitted, with optional sorting by date or rating
 */
export const getMyReviews = async (
  sortOption: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest',
): Promise<Review[]> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<{ reviews: Review[] }>
    >('/users/me/reviews', { params: { reviewSort: sortOption } });
    return response.data.data.reviews || [];
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching my reviews:', err);
    throw err;
  }
};

/**
 * [관리자 전용] 시스템 내의 모든 리뷰를 가져옵니다 (페이지네이션 지원)
 */
export const fetchAllReviewsForAdmin = async (
  page = 1,
  limit = 50,
): Promise<{ reviews: Review[]; totalResults: number; totalPages: number }> => {
  try {
    // app.js에 등록한 /api/v1/reviews 경로를 기준으로 호출합니다.
    const response = await axiosInstance.get<
      ApiResponse<{ reviews: Review[] }> & {
        totalResults: number;
        totalPages: number;
      }
    >(`/reviews/admin/all`, { params: { page, limit } });

    return {
      reviews: response.data.data.reviews || [],
      totalResults: response.data.totalResults || 0,
      totalPages: response.data.totalPages || 0,
    };
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching all reviews for admin:', err);
    throw err;
  }
};
