import { useCallback, useEffect, useState } from "react";
import useUiStore from "../../store/uiStore";
import useViewport from "./useViewPort";

// Change to accept detailRef as an argument.
const useSidePanelResizer = (detailRef: React.RefObject<HTMLDivElement>) => {
  const sidePanelWidth = useUiStore((state) => state.sidePanelWidth);
  const setSidePanelWidth = useUiStore((state) => state.setSidePanelWidth);
  const { width: viewportWidth } = useViewport();

  // detailRef is now externally injected.
  const [isResizing, setIsResizing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [resizerPosition, setResizerPosition] = useState(sidePanelWidth);

  const resizerMouseDownHandler = useCallback(() => {
    setIsResizing(true);
  }, []);

  const resizerMouseUpHandler = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (!isResizing) {
      setSidePanelWidth(resizerPosition);
    }
  }, [isResizing, resizerPosition, setSidePanelWidth]);

  const resizeHandler = useCallback(
    (event: MouseEvent) => {
      // Use the injected detailRef.
      if (!isResizing || !detailRef.current) return;
      let calculatedPosition =
        detailRef.current.getBoundingClientRect().right - event.clientX;
      if (calculatedPosition > 700) {
        calculatedPosition = 700;
      }
      if (calculatedPosition < 360) {
        calculatedPosition = 360;
      }
      setResizerPosition(calculatedPosition);
    },
    [isResizing, detailRef] // Add detailRef to dependencies as well
  );

  useEffect(() => {
    document.addEventListener("mousemove", resizeHandler);
    document.addEventListener("mouseup", resizerMouseUpHandler);
    return () => {
      document.removeEventListener("mousemove", resizeHandler);
      document.removeEventListener("mouseup", resizerMouseUpHandler);
    };
  }, [resizeHandler, resizerMouseUpHandler]);

  useEffect(() => {
    if (viewportWidth <= 450 || sidePanelWidth > viewportWidth) {
      setResizerPosition(viewportWidth);
    } 
  }, [viewportWidth, sidePanelWidth, setSidePanelWidth]);

  return {
    sidePanelWidth,
    resizerPosition,
    isHover,
    isResizing,
    resizerMouseDownHandler,
    setIsHover,
  };
};

export default useSidePanelResizer;