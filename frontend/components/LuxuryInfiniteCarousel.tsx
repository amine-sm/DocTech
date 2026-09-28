"use client";

import {
  Children,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type LuxuryInfiniteCarouselProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  itemClassName?: string;
  gap?: number;
  duration?: number;
  ariaLabel?: string;
  showArrows?: boolean;
};

/* =========================================================
   CONSTANTES
========================================================= */

const RESUME_DELAY = 500;           // ✅ réduit (était 1800)
const DRAG_THRESHOLD = 8;            // seuil horizontal avant drag
const VERTICAL_LOCK_RATIO = 1.1;     // si vertical dépasse horizontal ×1.1 → scroll page
const ENTER_RISE_DISTANCE = 90;
const ENTER_RISE_DURATION = 700;
const ENTER_RISE_SCALE = 0.97;
const GROUP_COPIES = 4;

export default function LuxuryInfiniteCarousel({
  children,
  className = "",
  viewportClassName = "",
  itemClassName = "",
  gap = 16,
  duration = 36,
  ariaLabel = "Carrousel",
  showArrows = true,
}: LuxuryInfiniteCarouselProps) {
  const items = Children.toArray(children);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);

  const positionRef = useRef(0);
  const targetRef = useRef(0);
  const cycleWidthRef = useRef(0);

  const autoFrameRef = useRef<number | null>(null);
  const manualFrameRef = useRef<number | null>(null);
  const lastAutoFrameRef = useRef(0);
  const lastManualFrameRef = useRef(0);

  const pointerDownRef = useRef(false);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const blockClickRef = useRef(false);

  const resumeAtRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const pauseForInteraction = useCallback(() => {
    resumeAtRef.current = performance.now() + RESUME_DELAY;
  }, []);

  /**
   * Normalise la position de rendu dans [-cycle, 0].
   * positionRef garde la vraie position non-bornée.
   */
  const getRenderedOffset = useCallback((position: number) => {
    const cycle = cycleWidthRef.current;
    if (!cycle) return position;

    let normalized = position % cycle;
    if (normalized > 0) normalized -= cycle;
    return normalized;
  }, []);

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const renderedOffset = getRenderedOffset(positionRef.current);
    track.style.transform = `translate3d(${renderedOffset}px, 0, 0)`;
  }, [getRenderedOffset]);

  const stopManualAnimation = useCallback(() => {
    if (manualFrameRef.current !== null) {
      cancelAnimationFrame(manualFrameRef.current);
      manualFrameRef.current = null;
    }
    lastManualFrameRef.current = 0;
    targetRef.current = positionRef.current;
  }, []);

  const getStep = useCallback(() => {
    const firstItem = firstGroupRef.current?.querySelector<HTMLElement>(
      "[data-luxury-carousel-item]",
    );
    if (!firstItem) return 280 + gap;
    return firstItem.getBoundingClientRect().width + gap;
  }, [gap]);

  const startManualAnimation = useCallback(() => {
    pauseForInteraction();

    if (reducedMotionRef.current) {
      positionRef.current = targetRef.current;
      applyTransform();
      pauseForInteraction();
      return;
    }

    if (manualFrameRef.current !== null) return;

    const tick = (now: number) => {
      if (!lastManualFrameRef.current) lastManualFrameRef.current = now;

      const dt = Math.min(
        0.045,
        Math.max(0.001, (now - lastManualFrameRef.current) / 1000),
      );
      lastManualFrameRef.current = now;

      const distance = targetRef.current - positionRef.current;
      const smoothing = 1 - Math.exp(-14 * dt);
      positionRef.current += distance * smoothing;
      applyTransform();

      if (Math.abs(targetRef.current - positionRef.current) > 0.35) {
        manualFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      positionRef.current = targetRef.current;
      applyTransform();
      manualFrameRef.current = null;
      lastManualFrameRef.current = 0;
      pauseForInteraction();
    };

    manualFrameRef.current = requestAnimationFrame(tick);
  }, [applyTransform, pauseForInteraction]);

  const moveBySteps = useCallback(
    (steps: number) => {
      const step = getStep();
      if (manualFrameRef.current === null) {
        targetRef.current = positionRef.current;
      }
      targetRef.current += step * steps;
      startManualAnimation();
    },
    [getStep, startManualAnimation],
  );

  const goPrevious = useCallback(() => moveBySteps(1), [moveBySteps]);
  const goNext = useCallback(() => moveBySteps(-1), [moveBySteps]);

  /* =========================================================
     MESURE + BOUCLE AUTOMATIQUE
  ========================================================= */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };
    updateMotionPreference();
    mediaQuery.addEventListener?.("change", updateMotionPreference);

    const measure = () => {
      const width =
        firstGroupRef.current?.getBoundingClientRect().width ?? 0;
      cycleWidthRef.current = width;
      applyTransform();
    };

    const resizeObserver = new ResizeObserver(measure);
    if (firstGroupRef.current) resizeObserver.observe(firstGroupRef.current);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);

    measure();
    const raf1 = requestAnimationFrame(measure);
    const t1 = window.setTimeout(measure, 200);
    const t2 = window.setTimeout(measure, 800);

    const autoLoop = (now: number) => {
      if (!lastAutoFrameRef.current) lastAutoFrameRef.current = now;

      const deltaSeconds = Math.min(
        0.05,
        Math.max(0, (now - lastAutoFrameRef.current) / 1000),
      );
      lastAutoFrameRef.current = now;

      const cycle = cycleWidthRef.current;
      const paused =
        reducedMotionRef.current ||
        pointerDownRef.current ||
        draggingRef.current ||
        manualFrameRef.current !== null ||
        now < resumeAtRef.current;

      if (!paused && cycle > 0) {
        const pixelsPerSecond = cycle / Math.max(4, duration);
        positionRef.current -= pixelsPerSecond * deltaSeconds;
        targetRef.current = positionRef.current;
        applyTransform();
      }

      autoFrameRef.current = requestAnimationFrame(autoLoop);
    };

    autoFrameRef.current = requestAnimationFrame(autoLoop);

    return () => {
      resizeObserver.disconnect();
      mediaQuery.removeEventListener?.("change", updateMotionPreference);
      cancelAnimationFrame(raf1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);

      if (autoFrameRef.current !== null) {
        cancelAnimationFrame(autoFrameRef.current);
      }
      if (manualFrameRef.current !== null) {
        cancelAnimationFrame(manualFrameRef.current);
      }
    };
  }, [applyTransform, duration]);

  /* =========================================================
     ANIMATION D'ENTRÉE DES CARTES — adoucie sur mobile
  ========================================================= */
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const cardItems = Array.from(
      track.querySelectorAll<HTMLElement>("[data-luxury-carousel-item]"),
    );
    if (cardItems.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // ✅ Sur mobile, on ne cache PAS les items → ils restent visibles
    // pendant le scroll, plus de "disparition".
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches;

    if (reduceMotion || isTouch || typeof IntersectionObserver === "undefined") {
      cardItems.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "translate3d(0,0,0) scale(1)";
      });
      return;
    }

    const showItem = (item: HTMLElement) => {
      item.style.opacity = "1";
      item.style.transform = "translate3d(0, 0, 0) scale(1)";
    };

    const hideItemBelow = (item: HTMLElement) => {
      item.style.opacity = "0.25"; // ✅ plus visible (était 0.08)
      item.style.transform = `translate3d(0, ${ENTER_RISE_DISTANCE}px, 0) scale(${ENTER_RISE_SCALE})`;
    };

    cardItems.forEach((item) => {
      item.style.willChange = "transform, opacity";
      item.style.transition = `transform ${ENTER_RISE_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${Math.round(
        ENTER_RISE_DURATION * 0.68,
      )}ms ease-out`;
      hideItemBelow(item);
    });

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const item = entry.target as HTMLElement;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.02) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => showItem(item));
            });
          } else {
            item.style.transition = "none";
            hideItemBelow(item);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                item.style.transition = `transform ${ENTER_RISE_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${Math.round(
                  ENTER_RISE_DURATION * 0.68,
                )}ms ease-out`;
              });
            });
          }
        }
      },
      { root: viewport, threshold: [0, 0.02, 0.08, 0.2, 0.5] },
    );

    cardItems.forEach((item) => intersectionObserver.observe(item));

    return () => {
      intersectionObserver.disconnect();
      cardItems.forEach((item) => {
        item.style.removeProperty("will-change");
        item.style.removeProperty("transition");
        item.style.removeProperty("transform");
        item.style.removeProperty("opacity");
      });
    };
  }, [items.length]);

  /* =========================================================
     POINTER / DRAG / SCROLL VERTICAL (mobile)
  ========================================================= */

  const releasePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    stopManualAnimation();

    pointerDownRef.current = true;
    draggingRef.current = false;
    pointerIdRef.current = event.pointerId;
    pointerStartXRef.current = event.clientX;
    pointerStartYRef.current = event.clientY;
    lastPointerXRef.current = event.clientX;
    blockClickRef.current = false;
    resumeAtRef.current = Number.POSITIVE_INFINITY;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const totalX = event.clientX - pointerStartXRef.current;
    const totalY = event.clientY - pointerStartYRef.current;

    if (!draggingRef.current) {
      // ✅ Si le geste est vertical → on ABANDONNE complètement le carrousel
      // et on rend la main au navigateur pour le scroll de la page.
      if (
        Math.abs(totalY) > DRAG_THRESHOLD &&
        Math.abs(totalY) > Math.abs(totalX) * VERTICAL_LOCK_RATIO
      ) {
        pointerDownRef.current = false;
        draggingRef.current = false;
        pointerIdRef.current = null;
        blockClickRef.current = false;
        releasePointer(event);
        // ✅ PAS de pauseForInteraction ici → le carrousel doit
        // continuer à tourner pendant que l'utilisateur scrolle la page.
        return;
      }

      if (
        Math.abs(totalX) < DRAG_THRESHOLD ||
        Math.abs(totalX) <= Math.abs(totalY) * VERTICAL_LOCK_RATIO
      ) {
        return;
      }

      draggingRef.current = true;
      blockClickRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    const delta = event.clientX - lastPointerXRef.current;
    lastPointerXRef.current = event.clientX;

    positionRef.current += delta;
    targetRef.current = positionRef.current;
    applyTransform();
  };

  const endPointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      pointerIdRef.current !== event.pointerId &&
      pointerIdRef.current !== null
    ) {
      return;
    }

    releasePointer(event);

    pointerDownRef.current = false;
    draggingRef.current = false;
    pointerIdRef.current = null;
    targetRef.current = positionRef.current;

    // ✅ Pause courte uniquement si un vrai drag a eu lieu
    if (blockClickRef.current) {
      pauseForInteraction();
    }
  };

  if (items.length === 0) return null;

  return (
    <div
      className={`relative ${className}`}
      aria-label={ariaLabel}
      role="region"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goPrevious();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goNext();
        }
      }}
    >
      <div
        ref={viewportRef}
        className={`relative overflow-hidden [touch-action:pan-y] ${viewportClassName}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerInteraction}
        onPointerCancel={endPointerInteraction}
        onClickCapture={(event) => {
          if (blockClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            blockClickRef.current = false;
          }
        }}
        onDragStartCapture={(event) => event.preventDefault()}
        onWheel={(event) => {
          const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX;

          if (
            Math.abs(horizontalDelta) < 1 ||
            (!event.shiftKey &&
              Math.abs(event.deltaX) <= Math.abs(event.deltaY))
          ) {
            return;
          }

          event.preventDefault();
          stopManualAnimation();
          positionRef.current -= horizontalDelta;
          targetRef.current = positionRef.current;
          applyTransform();
          pauseForInteraction();
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max select-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {Array.from({ length: GROUP_COPIES }).map((_, groupIndex) => (
            <div
              key={`carousel-group-${groupIndex}`}
              ref={groupIndex === 0 ? firstGroupRef : undefined}
              className="flex shrink-0 items-stretch"
              style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}
            >
              {items.map((item, index) => (
                <div
                  key={`group-${groupIndex}-item-${index}`}
                  data-luxury-carousel-item
                  className={`shrink-0 [backface-visibility:hidden] ${itemClassName}`}
                >
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showArrows && items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Élément précédent"
            onClick={goPrevious}
            className="absolute start-2 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.15)] backdrop-blur transition duration-200 hover:scale-105 hover:text-blue-600 active:scale-95 sm:start-3 sm:flex sm:h-11 sm:w-11"
          >
            <ChevronLeft size={20} strokeWidth={2.2} className="rtl-flip" />
          </button>

          <button
            type="button"
            aria-label="Élément suivant"
            onClick={goNext}
            className="absolute end-2 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.15)] backdrop-blur transition duration-200 hover:scale-105 hover:text-blue-600 active:scale-95 sm:end-3 sm:flex sm:h-11 sm:w-11"
          >
            <ChevronRight size={20} strokeWidth={2.2} className="rtl-flip" />
          </button>
        </>
      )}
    </div>
  );
}