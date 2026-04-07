"use client"
import { useEffect } from "react"
import { polyfill } from "mobile-drag-drop"
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour"

export default function MobileDragPolyfill() {
  useEffect(() => {
    polyfill({
      dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
      holdToDrag: 300
    });
    const listener = (e) => {};
    window.addEventListener('touchmove', listener, { passive: false });
    return () => window.removeEventListener('touchmove', listener);
  }, []);
  return null;
}
