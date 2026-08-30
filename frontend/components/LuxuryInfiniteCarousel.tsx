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

const RESUME_DELAY = 2200;
const DRAG_THRESHOLD = 8;
const HORIZONTAL_LOCK_RATIO = 1.12;
const ENTER_RISE_DISTANCE = 110;
const ENTER_RISE_DURATION = 760;
const ENTER_RISE_SCALE = 0.97;
const GROUP_COPIES = 5;

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

  // Position virtuelle non bornée. On ne la normalise jamais pendant un clic.
  // C'est ce qui permet d'empiler plusieurs clics sans perdre de déplacement.
  const positionRef = useRef(0);
  const targetRef = useRef(0);
  const cycleWidthRef = useRef(0);

  const autoFrameRef = useRef<number | null>(null);
  const manualFrameRef = useRef<number | null>(null);
  const lastAutoFrameRef = useRef(0);
  const lastManualFrameRef = useRef(0);

  const hoverRef = useRef(false);
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

  const getRenderedOffset = useCallback((position: number) => {
    const cycle = cycleWidthRef.current;
    if (!cycle) return position;

    // Garde toujours le rendu dans [-cycle, 0].
    // La position logique reste, elle, complètement libre.
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

    // Si l'animation est déjà active, on ne l'annule pas :
    // les nouveaux clics modifient simplement targetRef.current.
    // Ainsi les clics rapides s'accumulent proprement.
    if (manualFrameRef.current !== null) return;

    const tick = (now: number) => {
      if (!lastManualFrameRef.current) lastManualFrameRef.current = now;

      const dt = Math.min(
        0.045,
        Math.max(0.001, (now - lastManualFrameRef.current) / 1000),
      );
      lastManualFrameRef.current = now;

      const distance = targetRef.current - positionRef.current;

      // Lissage exponentiel : rapide au départ, doux à l'arrivée.
      // Il reste stable même si l'utilisateur clique plusieurs fois.
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

      // Si aucune animation manuelle n'est active, la cible repart de la
      // position réellement affichée. Sinon, on ajoute à la cible existante.
      if (manualFrameRef.current === null) {
        targetRef.current = positionRef.current;
      }

      targetRef.current += step * steps;
      startManualAnimation();
    },
    [getStep, startManualAnimation],
  );

  const goPrevious = useCallback(() => {
    moveBySteps(1);
  }, [moveBySteps]);

  const goNext = useCallback(() => {
    moveBySteps(-1);
  }, [moveBySteps]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    updateMotionPreference();
    mediaQuery.addEventListener?.("change", updateMotionPreference);

    const measure = () => {
      const width = firstGroupRef.current?.getBoundingClientRect().width ?? 0;
      cycleWidthRef.current = width;
      applyTransform();
    };

    const resizeObserver = new ResizeObserver(measure);
    if (firstGroupRef.current) resizeObserver.observe(firstGroupRef.current);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    measure();

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
        hoverRef.current ||
        pointerDownRef.current ||
        draggingRef.current ||
        manualFrameRef.current !== null ||
        now < resumeAtRef.current;

      if (!paused && cycle > 0) {
        const pixelsPerSecond = cycle / Math.max(1, duration);
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

      if (autoFrameRef.current !== null) {
        cancelAnimationFrame(autoFrameRef.current);
      }

      if (manualFrameRef.current !== null) {
        cancelAnimationFrame(manualFrameRef.current);
      }
    };
  }, [applyTransform, duration]);

  // Animation verticale de la prochaine card qui entre dans le viewport.
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

    const showItem = (item: HTMLElement) => {
      item.style.opacity = "1";
      item.style.transform = "translate3d(0, 0, 0) scale(1)";
    };

    const hideItemBelow = (item: HTMLElement) => {
      item.style.opacity = "0.06";
      item.style.transform = `translate3d(0, ${ENTER_RISE_DISTANCE}px, 0) scale(${ENTER_RISE_SCALE})`;
    };

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      cardItems.forEach(showItem);
      return;
    }

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
      {
        root: viewport,
        threshold: [0, 0.02, 0.08, 0.2, 0.5],
      },
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

  if (items.length === 0) return null;

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
      // Si le geste est surtout vertical, on laisse la page défiler normalement.
      if (
        Math.abs(totalY) > DRAG_THRESHOLD &&
        Math.abs(totalY) > Math.abs(totalX) * HORIZONTAL_LOCK_RATIO
      ) {
        pointerDownRef.current = false;
        pointerIdRef.current = null;
        pauseForInteraction();
        return;
      }

      if (
        Math.abs(totalX) < DRAG_THRESHOLD ||
        Math.abs(totalX) <= Math.abs(totalY) * HORIZONTAL_LOCK_RATIO
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
    if (pointerIdRef.current !== event.pointerId && pointerIdRef.current !== null) {
      return;
    }

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerDownRef.current = false;
    draggingRef.current = false;
    pointerIdRef.current = null;
    targetRef.current = positionRef.current;
    pauseForInteraction();
  };

  return (
    <div
      className={`relative ${className}`}
      aria-label={ariaLabel}
      role="region"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        pauseForInteraction();
      }}
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
            (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY))
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
