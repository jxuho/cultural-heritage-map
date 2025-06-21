import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api/v1"; 

// 사용자 프로필 업데이트 함수
export const updateProfileApi = async (updateData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/users/updateMe`, updateData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error); 
    // 서버 응답에서 오류 메시지를 가져오거나 일반적인 오류 메시지 반환
    throw error.response?.data?.message || 'Failed to update profile. Please try again.'; 
  }
};