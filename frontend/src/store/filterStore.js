// src/store/filterStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 필터 및 정렬 관련 상태를 관리하는 스토어 생성
const useFilterStore = create(devtools((set) => ({
  selectedCategories: [],
  searchQuery: '',
  sortBy: 'alphabetical', 

  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((cat) => cat !== category)
        : [...state.selectedCategories, category],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortBy: (sortOption) => set({ sortBy: sortOption }),

  resetFilters: () => set({
    selectedCategories: [],
    searchQuery: '',
    sortBy: 'alphabetical', 
  }),
})));

export default useFilterStore;