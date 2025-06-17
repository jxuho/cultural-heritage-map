import { useEffect, useRef, useState } from "react";
import useUiStore from "../../store/uiStore";
import { useQueryClient } from "@tanstack/react-query";

import Resizer from "./SidePanelResizer";
import useSidePanelResizer from "../../hooks/useSidePanelResizer";

import { useCulturalSiteDetail } from "../../hooks/useCulturalSitesQueries";

import SidePanelItems from "./SidePanelItems";
import SidePanelSkeleton from "./SidePanelSkeleton";
import ErrorMessage from "../ErrorMessage";
import NearbySitesList from "./NearbySitesList";
import ProposalForm from "./ProposalForm"; // Import the ProposalForm component

const SidePanel = () => {
  // --- Zustand (UI State Management) ---
  const isSidePanelOpen = useUiStore((state) => state.isSidePanelOpen);
  const uiSelectedPlace = useUiStore((state) => state.selectedPlace);

  const nearbySites = useUiStore((state) => state.nearbySites);
  const clearNearbySites = useUiStore((state) => state.clearNearbySites);
  const nearbySitesLoading = useUiStore((state) => state.nearbySitesLoading);
  const nearbySitesError = useUiStore((state) => state.nearbySitesError);
  const closeSidePanel = useUiStore((state) => state.closeSidePanel);
  const clearSelectedPlace = useUiStore((state) => state.clearSelectedPlace);

  const isProposalFormOpen = useUiStore((state) => state.isProposalFormOpen);

  // --- TanStack Query Client ---
  const queryClient = useQueryClient();

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
    closeSidePanel();
    clearNearbySites();
    clearSelectedPlace();
    if (queryKeyToCancel) {
      console.log(`Cancelling query with key: ${queryKeyToCancel}`);
      queryClient.cancelQueries({ queryKey: [queryKeyToCancel] });
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (!isSidePanelOpen || (!uiSelectedPlace?._id && !nearbySites.length && !isProposalFormOpen)) {
      setIsReviewsExpanded(false);
      if (!isSidePanelOpen) {
        clearNearbySites();
        clearSelectedPlace();
      }
    }
  }, [
    isSidePanelOpen,
    uiSelectedPlace?._id,
    nearbySites.length,
    clearNearbySites,
    clearSelectedPlace,
    isProposalFormOpen,
  ]);

  // --- Rendering Logic ---
  if (!isSidePanelOpen) {
    return null;
  }

  let panelContent;

  if (isProposalFormOpen) {
    panelContent = <ProposalForm />;
  }
  else if (nearbySitesLoading) {
    panelContent = <SidePanelSkeleton onClose={() => handleCloseAndCancel('nearbyOsm')} />;
  }
  else if (nearbySitesError) {
    panelContent = (
      <ErrorMessage
        message={
          nearbySitesError?.message ||
          "Failed to load nearby cultural sites." // English translation
        }
        onClose={() => handleCloseAndCancel(null)}
      />
    );
  }
  else if (nearbySites.length > 0 && !uiSelectedPlace?._id) {
    panelContent = <NearbySitesList sites={nearbySites} onClose={() => handleCloseAndCancel(null)} />;
  }
  else if (isPlaceError) {
    panelContent = (
      <ErrorMessage
        message={placeError?.message || "Failed to load cultural site information."} // English translation
        onClose={() => handleCloseAndCancel(null)}
      />
    );
  }
  else if (isPlaceLoading && !selectedPlaceData) {
    panelContent = <SidePanelSkeleton onClose={() => handleCloseAndCancel('culturalSiteDetail')} />;
  }
  else if (selectedPlaceData) {
    // Assuming SidePanelItems also needs a close button if not handled by outer panel
    panelContent = (
      <SidePanelItems
        isReviewsExpanded={isReviewsExpanded}
        toggleReviewsExpansion={() => setIsReviewsExpanded((prev) => !prev)}
        onClose={() => handleCloseAndCancel(null)} // Pass onClose if SidePanelItems has a close button
      />
    );
  }
  else {
    panelContent = (
      <p className="p-4 text-gray-600 text-center relative">
        <div className="absolute top-4 right-4">
          <button
            className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
            onClick={() => handleCloseAndCancel(null)}
            aria-label="Close panel"
          >
            &times;
          </button>
        </div>
        No information available.
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
      {isPlaceLoading && !selectedPlaceData && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="absolute top-4 right-4">
            <button
              className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
              onClick={() => handleCloseAndCancel('culturalSiteDetail')}
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