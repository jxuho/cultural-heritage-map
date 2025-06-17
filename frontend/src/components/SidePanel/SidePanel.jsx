import { useEffect, useRef, useState } from "react";
import useUiStore from "../../store/uiStore";
import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient

import Resizer from "./SidePanelResizer";
import useSidePanelResizer from "../../hooks/useSidePanelResizer";

import { useCulturalSiteDetail } from "../../hooks/useCulturalSitesQueries";

import SidePanelItems from "./SidePanelItems";
import SidePanelSkeleton from "./SidePanelSkeleton";
import ErrorMessage from "../ErrorMessage";
import NearbySitesList from "./NearbySitesList";

const SidePanel = () => {
  // --- Zustand (UI State Management) ---
  const isSidePanelOpen = useUiStore((state) => state.isSidePanelOpen);
  const uiSelectedPlace = useUiStore((state) => state.selectedPlace);

  const nearbySites = useUiStore((state) => state.nearbySites);
  const clearNearbySites = useUiStore((state) => state.clearNearbySites);
  const nearbySitesLoading = useUiStore((state) => state.nearbySitesLoading);
  const nearbySitesError = useUiStore((state) => state.nearbySitesError);
  const closeSidePanel = useUiStore((state) => state.closeSidePanel);
  const clearSelectedPlace = useUiStore((state) => state.clearSelectedPlace); // Make sure this function exists in your store

  // --- TanStack Query Client ---
  const queryClient = useQueryClient(); // Get the query client instance

  // --- Local UI State (useState) ---
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

  // --- useSidePanelResizer Hook ---
  const detailRef = useRef();
  const { sidePanelWidth } = useSidePanelResizer(detailRef);

  // --- TanStack Query: Fetch top-level cultural site detail for initial state ---
  const {
    data: selectedPlaceData,
    isLoading: isPlaceLoading,
    isError: isPlaceError,
    error: placeError,
  } = useCulturalSiteDetail(uiSelectedPlace?._id);

  // --- Combined Close and Cancel Function ---
  const handleCloseAndCancel = (queryKeyToCancel) => {
    // 1. Close the side panel
    closeSidePanel();
    // 2. Clear any displayed nearby sites or selected place
    clearNearbySites();
    clearSelectedPlace(); // Ensure selected place is also cleared
    // 3. Cancel the specific query if a key is provided
    if (queryKeyToCancel) {
      console.log(`Cancelling query with key: ${queryKeyToCancel}`);
      queryClient.cancelQueries({ queryKey: [queryKeyToCancel] });
    }
  };

  // --- Effects ---
  // Side panel이 닫히거나 장소가 변경되면 리뷰 섹션 축소 및 상태 초기화
  useEffect(() => {
    if (!isSidePanelOpen || (!uiSelectedPlace?._id && !nearbySites.length)) {
      setIsReviewsExpanded(false);
      if (!isSidePanelOpen) {
        // When panel is truly closed, ensure all related data is cleared
        clearNearbySites();
        clearSelectedPlace();
      }
    }
  }, [
    isSidePanelOpen,
    uiSelectedPlace?._id,
    nearbySites.length,
    clearNearbySites,
    clearSelectedPlace, // Add clearSelectedPlace to dependencies
  ]);

  // --- Rendering Logic ---
  if (!isSidePanelOpen) {
    return null; // 패널이 닫혀있으면 아무것도 렌더링하지 않음
  }

  let panelContent;

  // Prioritize rendering based on state:
  // 1. Nearby sites loading (from context menu search)
  if (nearbySitesLoading) {
    // Pass 'nearbyOsm' as the query key to cancel
    panelContent = <SidePanelSkeleton onClose={() => handleCloseAndCancel('nearbyOsm')} />;
  }
  // 2. Nearby sites error
  else if (nearbySitesError) {
    panelContent = (
      <ErrorMessage
        message={
          nearbySitesError?.message ||
          "주변 문화재 정보를 불러오는데 실패했습니다."
        }
        onClose={() => handleCloseAndCancel(null)} // No specific query to cancel here, just close
      />
    );
  }
  // 3. Nearby sites available (and no specific place selected)
  else if (nearbySites.length > 0 && !uiSelectedPlace?._id) {
    panelContent = <NearbySitesList sites={nearbySites} onClose={() => handleCloseAndCancel(null)} />; // No specific query to cancel
  }
  // 4. Specific place error
  else if (isPlaceError) {
    panelContent = (
      <ErrorMessage
        message={placeError?.message || "문화재 정보를 불러오는데 실패했습니다."}
        onClose={() => handleCloseAndCancel(null)} // No specific query to cancel
      />
    );
  }
  // 5. Specific place loading
  else if (isPlaceLoading && !selectedPlaceData) {
    // Pass 'culturalSiteDetail' as the query key to cancel
    panelContent = <SidePanelSkeleton onClose={() => handleCloseAndCancel('culturalSiteDetail')} />;
  }
  // 6. Specific place data available
  else if (selectedPlaceData) {
    panelContent = (
      <SidePanelItems
        isReviewsExpanded={isReviewsExpanded}
        toggleReviewsExpansion={() => setIsReviewsExpanded((prev) => !prev)}
        onClose={() => handleCloseAndCancel(null)} // Allow closing the detail view
      />
    );
  }
  // 7. Default case (no specific place, no nearby sites, not loading/error)
  else {
    panelContent = (
      <p className="p-4 text-gray-600 text-center relative">
        <div className="absolute top-4 right-4">
          <button
            className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
            onClick={() => handleCloseAndCancel(null)} // Allow closing this default view
            aria-label="Close panel"
          >
            &times;
          </button>
        </div>
        No information
      </p>
    );
  }

  return (
    <div
      className="absolute z-30 right-0 top-0 h-full shadow-lg bg-white max-w-[700px] flex flex-col"
      ref={detailRef}
      style={{
        width: sidePanelWidth,
        transition: "width 180ms ease",
        position: "absolute",
        right: "0",
        boxShadow:
          "0px 1.2px 3.6px rgba(0,0,0,0.1), 0px 6.4px 14.4px rgba(0,0,0,0.1)",
      }}
    >
      <Resizer detailRef={detailRef} />
      {panelContent}
      {/* This loading overlay is for the entire panel's initial load,
          individual data section loading is better handled inside SidePanelItems. */}
      {isPlaceLoading && !selectedPlaceData && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="absolute top-4 right-4">
            <button
              className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
              onClick={() => handleCloseAndCancel('culturalSiteDetail')} // Cancel the specific detail query here too
              aria-label="Close panel"
            >
              &times;
            </button>
          </div>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default SidePanel;