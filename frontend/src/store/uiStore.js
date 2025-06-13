import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

const useUiStore = create(devtools((set) => ({
  isModalOpen: false,
  modalContent: null, // 모달 내부에 렌더링할 JSX 또는 컴포넌트
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),

  isAccountManagerOpen: false,
  openAccountManager: () => set({isAccountManagerOpen: true}),
  closeAccountManager: () => set({isAccountManagerOpen: false})

  
})));

export default useUiStore;