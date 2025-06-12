import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

// 실제 백엔드 응답에 따라 필드를 조정하세요.
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [role] // 선택적 필드
 * @property {Object} [settings] // 선택적 필드
 */

const useAuthStore = create(devtools((set) => ({
  /** @type {User | null} */
  user: null, // 사용자 정보
  isAuthenticated: false, // 인증 여부
  loading: true, // 초기 인증 상태 로딩 중 여부

  // 로그인 액션
  login: (/** @type {User} */ userData) => {
    set({ user: userData, isAuthenticated: true });
  },

  // 로그아웃 액션
  logout: async () => {
    try {
      // 서버 측 로그아웃 API 호출 (HttpOnly 쿠키 삭제 등)
      // 이 API는 JWT 쿠키를 지우거나 세션을 무효화해야 합니다.
      const response = await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('Logout API call failed:', response.statusText);
        // 에러 처리: 사용자에게 알리거나, 강제로 상태를 변경할지 결정
      }
    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      // API 호출 성공 여부와 관계없이 클라이언트 상태 초기화
      set({ user: null, isAuthenticated: false });
    }
  },

  // 초기 인증 상태 확인 (앱 시작 시 호출)
  // HttpOnly 쿠키 방식을 사용하므로 클라이언트에서 JWT에 직접 접근 불가.
  // 백엔드 API를 통해 유효성 검사 및 사용자 정보 요청.
  checkAuthStatus: async () => {
    set({ loading: true }); // 로딩 시작
    try {
      // 백엔드에 JWT 유효성 검사 및 사용자 정보 요청
      // 이 API는 인증된 경우 사용자 정보를, 아니면 401 에러를 반환해야 합니다.
      const response = await fetch('http://localhost:5000/api/v1/users/me', {
        // credentials: 'include'는 HttpOnly 쿠키를 포함하여 요청을 보낼 때 필요
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // 백엔드 응답 구조에 따라 user 데이터를 추출하여 설정
        set({ user: data.data.user, isAuthenticated: true });
      } else {
        // 인증 실패 (토큰 만료, 없거나 유효하지 않음)
        console.warn('Authentication check failed:', response.status, response.statusText);
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false }); // 로딩 완료
    }
  },
})));




export default useAuthStore;