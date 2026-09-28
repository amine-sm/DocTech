// lib/useKeyboardVisible.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Détecte si le clavier virtuel mobile est ouvert.
 * Utilise visualViewport API (support moderne) avec fallback sur resize.
 */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const vv = (window as any).visualViewport as VisualViewport | undefined;

    function check() {
      const winHeight = window.innerHeight;
      const vvHeight = vv?.height ?? winHeight;

      // Si la différence dépasse 150px → clavier ouvert
      const diff = winHeight - vvHeight;
      setVisible(diff > 150);
    }

    if (vv) {
      vv.addEventListener("resize", check);
      vv.addEventListener("scroll", check);
    }

    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    check();

    return () => {
      if (vv) {
        vv.removeEventListener("resize", check);
        vv.removeEventListener("scroll", check);
      }
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return visible;
}