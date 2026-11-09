"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** The scene reserves its height; closed disclosures and distant demos stay unmounted. */
export function VisiblePreview({
  children,
  fallback = null,
  rootMargin = "200px",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
}) {
  const marker = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const scene = marker.current?.closest("[data-example-scene]") ?? marker.current?.parentElement;
    if (!scene) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(scene);
    return () => observer.disconnect();
  }, [rootMargin]);
  return (
    <>
      <span ref={marker} hidden />
      {visible ? children : fallback}
    </>
  );
}
