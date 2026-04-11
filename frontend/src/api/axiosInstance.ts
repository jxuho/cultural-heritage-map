//TODO: API_BASE_URL을 환경 변수로 관리하여 개발과 배포 환경에서 유연하게 사용할 수 있도록 개선


import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? "https://chemnitz-cultural-sites-map.onrender.com/api/v1" 
  : "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 모든 요청에 쿠키 포함 (반복 제거!)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;