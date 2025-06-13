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

  // 로그인 액션 (현재 user 정보도 함께 설정)
  login: (/** @type {User} */ userData) => {
    set({ user: userData, isAuthenticated: true });
  },

  // ✨ 추가된 액션: 사용자 정보 업데이트
  updateUser: (/** @type {Partial<User>} */ userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : userData,
    }));
  },

  // 로그아웃 액션
  logout: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include' // HttpOnly 쿠키 전송
      });
      if (!response.ok) {
        console.error('로그아웃 API 호출 실패:', response.statusText);
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    } finally {
      // API 호출 성공 여부와 관계없이 클라이언트 상태 초기화
      set({ user: null, isAuthenticated: false });
    }
  },

  // 초기 인증 상태 확인 (앱 시작 시 호출)
  checkAuthStatus: async () => {
    set({ loading: true });
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/me', {
        credentials: 'include' // HttpOnly 쿠키 전송
      });

      if (response.ok) {
        const data = await response.json();
        set({ user: data.data.user, isAuthenticated: true });
      } else {
        console.warn('인증 확인 실패:', response.status, response.statusText);
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('인증 상태 확인 중 오류 발생:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },
})));





export default useAuthStore;