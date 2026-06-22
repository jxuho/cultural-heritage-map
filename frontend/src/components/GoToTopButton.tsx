import { useState, useEffect, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const VISIBILITY_THRESHOLD = 300;

const getScrollableParent = (element: HTMLElement | null) => {
  let parent = element?.parentElement;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    const canScroll = /(auto|scroll|overlay)/.test(overflowY);

    if (canScroll && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return window;
};

const isWindow = (
  scrollTarget: HTMLElement | Window,
): scrollTarget is Window => {
  return scrollTarget === window;
};

const getScrollTop = (scrollTarget: HTMLElement | Window) => {
  return isWindow(scrollTarget) ? scrollTarget.scrollY : scrollTarget.scrollTop;
};

const GoToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    const scrollTarget = getScrollableParent(buttonContainerRef.current);

    scrollTarget.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const scrollTarget = getScrollableParent(buttonContainerRef.current);
    const toggleVisibility = () => {
      setIsVisible(getScrollTop(scrollTarget) > VISIBILITY_THRESHOLD);
    };

    toggleVisibility();
    scrollTarget.addEventListener('scroll', toggleVisibility, {
      passive: true,
    });

    return () => scrollTarget.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div
      ref={buttonContainerRef}
      className={`fixed bottom-8 right-8 z-1000 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <button
        onClick={scrollToTop}
        className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
        aria-label="Return to Top"
      >
        {/* 상단으로 향하는 선과 화살표 애니메이션 */}
        <div className="relative w-12 h-12 border border-black bg-white flex items-center justify-center group-hover:bg-black transition-colors duration-300">
          <FaArrowUp className="text-sm text-black group-hover:text-white transition-transform duration-300 group-hover:-translate-y-1" />

          {/* 디자인 포인트: 바우하우스 스타일의 작은 숫자나 기호 */}
          <span className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-mono px-1 py-0.5 tracking-tighter">
            TOP
          </span>
        </div>

        {/* 하단 텍스트 가이드 */}
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Return
        </span>
      </button>
    </div>
  );
};

export default GoToTopButton;
