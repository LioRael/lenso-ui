import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

const sourceGroup = (trigger: HTMLButtonElement | null) =>
  trigger?.closest<HTMLElement>('[data-lenso-slot="tab-bar-group"]') ?? trigger;

export function usePhotosSearchTransition(
  active: boolean,
  trigger: RefObject<HTMLButtonElement | null>,
) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const previous = useRef<DOMRect | null>(null);
  const animations = useRef(new Set<Animation>());
  const capture = useCallback(
    (opening: boolean, animate: boolean) => {
      previous.current = animate
        ? ((opening ? sourceGroup(trigger.current) : fieldRef.current)?.getBoundingClientRect() ??
          null)
        : null;
    },
    [trigger],
  );
  useLayoutEffect(() => {
    animations.current.forEach((animation) => animation.cancel());
    animations.current.clear();
    const from = previous.current;
    previous.current = null;
    const target = active
      ? fieldRef.current?.querySelector<HTMLElement>('[data-lenso-slot="search-field-group"]')
      : sourceGroup(trigger.current);
    if (!from?.width || !target || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = target.getBoundingClientRect();
    if (!to.width || !to.height) return;
    const easing =
      getComputedStyle(target).getPropertyValue("--lenso-motion-ease-out-quart").trim() ||
      "ease-out";
    const play = (node: Element, frames: Keyframe[], duration = 240) => {
      const animation = node.animate(frames, { duration, easing });
      animations.current.add(animation);
      animation.finished.then(
        () => animations.current.delete(animation),
        () => animations.current.delete(animation),
      );
    };
    // Reveal the live material without scaling its backdrop sampling surface.
    const diameter = Math.min(from.width, from.height, to.height);
    const dx = from.right - to.right;
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    play(
      target,
      active
        ? [
            {
              transform: `translate(${dx}px, ${dy}px)`,
              clipPath: `inset(${(to.height - diameter) / 2}px 0px ${(to.height - diameter) / 2}px ${Math.max(0, to.width - diameter)}px round ${diameter / 2}px)`,
            },
            { transform: "none", clipPath: `inset(0px round ${to.height / 2}px)` },
          ]
        : [
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
    );
    if (active) {
      target
        .querySelectorAll(
          '[data-lenso-slot="search-field-input"], [data-lenso-slot="search-field-search-icon"]',
        )
        .forEach((content) => {
          play(content, [{ opacity: 0 }, { opacity: 1 }], 180);
        });
    }
    const close = target.closest("[data-photos-demo]")?.querySelector("[data-search-close]");
    if (active && close)
      play(
        close,
        [
          { opacity: 0, transform: "scale(.92)" },
          { opacity: 1, transform: "none" },
        ],
        180,
      );
  }, [active, trigger]);
  useLayoutEffect(
    () => () => {
      animations.current.forEach((animation) => animation.cancel());
      animations.current.clear();
    },
    [],
  );
  return { fieldRef, capture };
}
