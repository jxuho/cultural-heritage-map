import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

const useSidePanelStore = create(devtools((set) => ({
  isSidePanelOpen: false,
  selectedPlace: null, // 선택된 장소의 정보를 담을 상태
  sidePanelWidth: 360,

  // 사이드 패널을 열고 특정 장소 정보를 설정하는 액션
  openSidePanel: (placeInfo) => set({ isSidePanelOpen: true, selectedPlace: placeInfo }),

  // 사이드 패널을 닫는 액션
  closeSidePanel: () => set({ isSidePanelOpen: false, selectedPlace: null }),

  setSidePanelWidth: (width) => set({sidePanelWidth: width}),
})));

export default useSidePanelStore;