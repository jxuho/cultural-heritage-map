import axios, { AxiosError } from 'axios';
import { ApiResponse } from '../types/api';
import { Review, ReviewInput } from '../types/review';

const API_BASE_URL = import.meta.env.PROD 
  ? "https://chemnitz-cultural-sites-map.onrender.com/api/v1" 
  : "http://localhost:5000/api/v1";

/**
 * 특정 문화재의 리뷰 목록을 가져오는 함수
 */
export const fetchReviewsByPlaceId = async (placeId: string): Promise<Review[]> => {
  if (!placeId) throw new Error("Place ID is required to fetch reviews.");

  try {
    const response = await axios.get<ApiResponse<{ reviews: Review[] }>>(
      `${API_BASE_URL}/cultural-sites/${placeId}/reviews`
    );
    return response.data.data.reviews || [];
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error fetching reviews for place ID ${placeId}:`, err);
    throw err;
  }
};

/**
 * 리뷰 생성 함수
 * @param reviewData - { rating: number, comment: string } 구조
 */
export const createReview = async (placeId: string, reviewData: ReviewInput): Promise<Review | null> => {
  if (!placeId || !reviewData) {
    throw new Error("Place ID and review data are required to create a review.");
  }

  try {
    const response = await axios.post<ApiResponse<{ review: Review }>>(
      `${API_BASE_URL}/cultural-sites/${placeId}/reviews`, 
      reviewData, // 백엔드 모델의 'comment' 필드명 사용
      { withCredentials: true }
    );
    return response.data.data.review || null;
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error creating review for place ID ${placeId}:`, err);
    throw err;
  }
};

/**
 * 리뷰 수정 함수
 */
export const updateReview = async (
  placeId: string, 
  reviewId: string, 
  reviewData: ReviewInput
): Promise<Review | null> => {
  if (!placeId || !reviewId || !reviewData) {
    throw new Error("Place ID, review ID, and review data are required to update a review.");
  }
  
  try {
    const response = await axios.patch<ApiResponse<{ review: Review }>>(
      `${API_BASE_URL}/cultural-sites/${placeId}/reviews/${reviewId}`, 
      reviewData, 
      { withCredentials: true }
    );
    return response.data.data.review || null;
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error updating review ID ${reviewId}:`, err);
    throw err;
  }
};

/**
 * 리뷰 삭제 함수
 */
export const deleteReview = async (placeId: string, reviewId: string): Promise<boolean> => {
  if (!placeId || !reviewId) {
    throw new Error("Place ID and review ID are required to delete a review.");
  }
  
  try {
    await axios.delete(
      `${API_BASE_URL}/cultural-sites/${placeId}/reviews/${reviewId}`, 
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    const err = error as AxiosError;
    console.error(`Error deleting review ID ${reviewId}:`, err);
    throw err;
  }
};

/**
 * 특정 유저의 모든 리뷰 가지고 오는 함수
 */
export const getMyReviews = async (
  sortOption: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest'
): Promise<Review[]> => {
  try {
    const response = await axios.get<ApiResponse<{ reviews: Review[] }>>(
      `${API_BASE_URL}/users/me/reviews?reviewSort=${sortOption}`, 
      { withCredentials: true }
    );
    return response.data.data.reviews || [];
  } catch (error) {
    const err = error as AxiosError;
    console.error("Error fetching my reviews:", err);
    throw err;
  }
};