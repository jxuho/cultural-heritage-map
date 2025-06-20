// FilterPanel.jsx
import { useState } from "react";
import useFilterStore from "../store/filterStore";
import { CULTURAL_CATEGORY } from "../config/culturalSiteConfig";

const FilterPanel = () => {
  const selectedCategories = useFilterStore(
    (state) => state.selectedCategories
  );
  const toggleCategory = useFilterStore((state) => state.toggleCategory);
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`relative transition-all duration-300 ${
        isOpen ? "bg-white shadow-lg rounded-lg p-2" : ""
      }`}
    >
      <button
        onClick={handleToggle}
        className={`flex items-center justify-center px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
          isOpen
            ? "bg-blue-600 text-white hover:bg-blue-700 mb-2"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } min-w-[120px]`}
      >
        <span className="mr-2">
          {isOpen ? "Close Filters" : "Open Filters"}
        </span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      <div
        className={`grid transition-all duration-300 ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap justify-center gap-2 pb-2">
            {CULTURAL_CATEGORY.map((category) => (
              <button
                key={category}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          {/* 검색 입력 필드 추가 */}
          <div className="p-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;