import { useEffect, useRef, useState } from "react";
import useUiStore from "../../store/uiStore";

import Resizer from './SidePanelResizer';
import useSidePanelResizer from "../../hooks/useSidePanelResizer";

import { useCulturalSiteDetail } from "../../hooks/useCulturalSitesQueries";

import SidePanelItems from './SidePanelItems';
import SidePanelSkeleton from "./SidePanelSkeleton";
import ErrorMessage from '../ErrorMessage'; // ErrorDisplay 대신 ErrorMessage 사용

const SidePanel = () => {
  // --- Zustand (UI State Management) ---
  const isSidePanelOpen = useUiStore((state) => state.isSidePanelOpen);
  const uiSelectedPlace = useUiStore((state) => state.selectedPlace);

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
    error: placeError
  } = useCulturalSiteDetail(uiSelectedPlace?._id);

  // --- Effects ---
  // Side panel이 닫히거나 장소가 변경되면 리뷰 섹션 축소 및 상태 초기화
  useEffect(() => {
    if (!isSidePanelOpen || !uiSelectedPlace?._id) {
      setIsReviewsExpanded(false);
    }
  }, [isSidePanelOpen, uiSelectedPlace?._id]);

  // --- Rendering Logic ---
  if (!isSidePanelOpen) {
    return null; // 패널이 닫혀있으면 아무것도 렌더링하지 않음
  }

  let panelContent;

  // 1. 에러가 발생한 경우 최우선으로 에러 메시지 표시
  if (isPlaceError) {
    panelContent = <ErrorMessage message={placeError?.message || "문화재 정보를 불러오는데 실패했습니다."} />;
  }
  // 2. 데이터 로딩 중이고 아직 데이터가 없는 경우 스켈레톤 UI 표시
  else if (isPlaceLoading && !selectedPlaceData) {
    panelContent = <SidePanelSkeleton />;
  }
  // 3. 데이터가 성공적으로 로드된 경우 SidePanelItems 렌더링
  else if (selectedPlaceData) {
    panelContent = (
      <SidePanelItems
        isReviewsExpanded={isReviewsExpanded}
        toggleReviewsExpansion={() => setIsReviewsExpanded((prev) => !prev)}
      />
    );
  }
  // 4. 패널은 열렸지만 선택된 장소 데이터가 없는 경우 (예: 초기 상태)
  else {
    panelContent = <p className="p-4 text-gray-600 text-center">선택된 장소 정보가 없습니다.</p>;
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
      {/* 이 로딩 오버레이는 전체 패널의 초기 로딩에만 사용하고, 
          각 데이터 섹션의 로딩은 SidePanelItems 내부에서 개별적으로 처리하는 것이 더 좋습니다. */}
      {isPlaceLoading && !selectedPlaceData && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default SidePanel;