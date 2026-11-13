import { useCallback, useLayoutEffect, useRef } from "react";

export function usePhotosSelectionTransition(selecting: boolean) {
  const root = useRef<HTMLDivElement>(null);
  const before = useRef(new Map<string, { rect: DOMRect; contents: DOMRect[] }>());
  const animations = useRef(new Set<Animation>());
  const capture = useCallback((animate = true) => {
    root.current?.toggleAttribute("data-selection-instant", !animate);
    before.current.clear();
    if (!animate) return;
    root.current?.querySelectorAll<HTMLElement>("[data-selection-morph]").forEach((element) => {
      before.current.set(element.dataset["selectionMorph"]!, {
        rect: element.getBoundingClientRect(),
        contents: [...element.querySelectorAll("[data-selection-content]")].map((content) =>
          content.getBoundingClientRect(),
        ),
      });
    });
  }, []);
  useLayoutEffect(() => {
    const host = root.current;
    const previous = before.current;
    animations.current.forEach((animation) => animation.cancel());
    animations.current.clear();
    if (!host || !previous.size) return;
    before.current = new Map();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const easing =
      getComputedStyle(host).getPropertyValue("--lenso-motion-ease-out-quart").trim() || "ease-out";
    const play = (element: Element, frames: Keyframe[], duration = 240) => {
      const animation = element.animate(frames, { duration, easing });
      animations.current.add(animation);
      animation.finished.then(
        () => animations.current.delete(animation),
        () => animations.current.delete(animation),
      );
    };
    host.querySelectorAll<HTMLElement>("[data-selection-morph]").forEach((element) => {
      const snapshot = previous.get(element.dataset["selectionMorph"]!);
      const from = snapshot?.rect;
      const to = element.getBoundingClientRect();
      if (!from || !from.width || !to.width) return;
      const scale = from.width / to.width;
      const contents = [...element.querySelectorAll<HTMLElement>("[data-selection-content]")].map(
        (content) => ({ content, end: content.getBoundingClientRect() }),
      );
      play(element, [
        {
          transform: `translateX(${from.left - to.left}px) scaleX(${scale})`,
          transformOrigin: "left center",
        },
        { transform: "none", transformOrigin: "left center" },
      ]);
      contents.forEach(({ content, end }, index) => {
        const start = snapshot?.contents[index];
        if (!start) return;
        const centre = end.left + end.width / 2;
        const startCentre = start.left + start.width / 2;
        // Match the shell's eased progress, cancelling its scale and centre drift at every sample.
        play(
          content,
          Array.from({ length: 17 }, (_, sample) => {
            const progress = sample / 16;
            const shellScale = scale + (1 - scale) * progress;
            const shellLeft = to.left + (from.left - to.left) * (1 - progress);
            const desired = startCentre + (centre - startCentre) * progress;
            const actual = shellLeft + (centre - to.left) * shellScale;
            return {
              offset: progress,
              transform: `translateX(${(desired - actual) / shellScale}px) scaleX(${1 / shellScale})`,
            };
          }),
        );
      });
    });
    const footer = host
      .closest("main")
      ?.querySelector(selecting ? "[data-photo-selection-footer]" : '[data-lenso-slot="tab-bar"]');
    if (footer) play(footer, [{ transform: "translateY(10px)" }, { transform: "none" }], 180);
  }, [selecting]);
  useLayoutEffect(
    () => () => {
      animations.current.forEach((animation) => animation.cancel());
      animations.current.clear();
    },
    [],
  );
  return { headerRef: root, capture };
}
