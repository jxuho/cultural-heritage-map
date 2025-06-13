import useSidePanelStore from "../../store/sidePanelStore";
import useViewport from "../../hooks/useViewPort";
import { useCallback, useEffect, useRef, useState } from "react";

const SidePanel = () => {
  const isSidePanelOpen = useSidePanelStore((state) => state.isSidePanelOpen);
  const selectedPlace = useSidePanelStore((state) => state.selectedPlace);
  const closeSidePanel = useSidePanelStore((state) => state.closeSidePanel);
  const sidePanelWidth = useSidePanelStore((state) => state.sidePanelWidth);
  const setSidePanelWidth = useSidePanelStore(
    (state) => state.setSidePanelWidth
  );
  const { width: viewportWidth } = useViewport();

  const detailRef = useRef();
  const [isResizing, setIsResizing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [resizerPosition, setResizerPosition] = useState(360);
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
    // resizer 이동
    (event) => {
      if (!isResizing) return;
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
    [isResizing]
  );

  useEffect(() => {
    document.addEventListener("mousemove", resizeHandler); // resizer 이동조건
    document.addEventListener("mouseup", resizerMouseUpHandler); // resizer 완료조건
    return () => {
      document.removeEventListener("mousemove", resizeHandler);
      document.removeEventListener("mouseup", resizerMouseUpHandler);
    };
  }, [resizeHandler, resizerMouseUpHandler]);

  useEffect(() => {
    // 화면 크기 줄어들 때, sidePanelWidth 강제 설정
    if (viewportWidth - sidePanelWidth < 50 && viewportWidth > 450) {
      setSidePanelWidth(viewportWidth - 50);
      setResizerPosition(viewportWidth - 50);
    } else if (viewportWidth <= 450) {
      setSidePanelWidth(viewportWidth);
      setResizerPosition(viewportWidth);
    }
  }, [viewportWidth, sidePanelWidth, setSidePanelWidth]);

  return (
    isSidePanelOpen && (
      <div
        className="absolute z-30 right-0 top-0 h-full p-4 shadow-lg bg-white max-w-[700px]"
        ref={detailRef}
        style={
          viewportWidth - sidePanelWidth < 560
            ? {
                width: sidePanelWidth,
                transition: "width 180ms ease",
                position: "absolute",
                right: "0",
                boxShadow:
                  "0px 1.2px 3.6px rgba(0,0,0,0.1), 0px 6.4px 14.4px rgba(0,0,0,0.1)",
              }
            : {
                width: sidePanelWidth,
                transition: "width 180ms ease",
                boxShadow:
                  "0px 1.2px 3.6px rgba(0,0,0,0.1), 0px 6.4px 14.4px rgba(0,0,0,0.1)",
              }
        }
      >
        {/* resizer */}
        <div
          className={`w-1 absolute top-0 h-full m-0 p-0 box-border bg-gray-500 opacity-0 translate-x-1 ${
            (isHover || isResizing) && "opacity-40 cursor-ew-resize"
          } `}
          onMouseDown={resizerMouseDownHandler} // resize 시작조건
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          style={{ right: resizerPosition, zIndex: "200" }}
        ></div>

        <div className="flex flex-col before:content-[''] before:h-[0.5px] before:w-full before:bg-ms-bg-border before:top-0 before:left-0">
            <div className="flex items-center justify-between px-0 my-0 mx-6">
              <button
                className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer"
                onClick={() => closeSidePanel()}
              >
                &times;
              </button>
            </div>
          </div>

          
          <div className="space-y-4">
            <p>
              <strong>이름:</strong> {selectedPlace.name}
            </p>
            {selectedPlace.address && (
              <p>
                <strong>주소:</strong> {selectedPlace.address}
              </p>
            )}
            {selectedPlace.description && (
              <p>
                <strong>설명:</strong> {selectedPlace.description}
              </p>
            )}
            {selectedPlace.imageUrl && (
              <img
                src={selectedPlace.imageUrl}
                alt={selectedPlace.name}
                className="w-full h-auto rounded"
              />
            )}
          </div>
        </div>
    )
  );
};

export default SidePanel;
