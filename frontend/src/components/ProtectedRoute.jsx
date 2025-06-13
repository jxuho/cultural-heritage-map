// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router';
import useAuthStore from '../store/authStore'; // 인증 스토어 임포트
import LoadingSpinner from './LoadingSpinner'; // 로딩 스피너 임포트

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuthStore(); // 인증 상태와 로딩 상태 가져오기

  if (loading) {
    return <LoadingSpinner />; // 인증 상태 확인 중 로딩 스피너 표시
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;