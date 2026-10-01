"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { scrollShadowStyles, scrollShadowProperties } from "@lenso/tokens/scroll-shadow";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type ScrollShadowVisibility = "auto" | "both" | "top" | "bottom" | "left" | "right" | "none";
export type ScrollShadowRootProps = StyleXProps<ComponentProps<"div">> & {
  size?: number;
  offset?: number;
  orientation?: "vertical" | "horizontal";
  hideScrollBar?: boolean;
  visibility?: ScrollShadowVisibility;
  isEnabled?: boolean;
  variant?: "fade";
  onVisibilityChange?: (visibility: ScrollShadowVisibility) => void;
};
export function ScrollShadowRoot({
  size = 40,
  offset = 0,
  orientation = "vertical",
  hideScrollBar = false,
  visibility = "auto",
  isEnabled = true,
  variant: _variant,
  onVisibilityChange,
  xstyle,
  style,
  ref,
  ...props
}: ScrollShadowRootProps) {
  const element = useRef<HTMLDivElement | null>(null);
  const callback = useRef(onVisibilityChange);
  const [edges, setEdges] = useState<{
    before: boolean;
    after: boolean;
    overflow: boolean | undefined;
  }>({ before: false, after: false, overflow: undefined });
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      element.current = node;
      if (typeof ref === "function") {
        const cleanup = ref(node);
        return () => {
          element.current = null;
          if (typeof cleanup === "function") cleanup();
          else ref(null);
        };
      }
      if (ref) ref.current = node;
      return () => {
        element.current = null;
        if (ref) ref.current = null;
      };
    },
    [ref],
  );
  useLayoutEffect(() => {
    callback.current = onVisibilityChange;
  }, [onVisibilityChange]);
  useLayoutEffect(() => {
    const el = element.current;
    if (!el || visibility !== "auto" || !isEnabled) return;
    let frame = 0;
    let previous = "";
    const measure = () => {
      frame = 0;
      const vertical = orientation === "vertical";
      const start = vertical ? el.scrollTop : Math.abs(el.scrollLeft);
      const length = vertical ? el.scrollHeight : el.scrollWidth;
      const client = vertical ? el.clientHeight : el.clientWidth;
      const before = start > offset;
      const after = start + client + offset < length - 1;
      const overflow = length > client;
      const key = `${before}:${after}:${overflow}`;
      if (key === previous) return;
      previous = key;
      setEdges({ before, after, overflow });
      callback.current?.(
        before && after
          ? "both"
          : before
            ? vertical
              ? "top"
              : "left"
            : after
              ? vertical
                ? "bottom"
                : "right"
              : "none",
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", schedule, { passive: true });
    // Content can change without resizing the viewport: observe both layout and DOM growth.
    const resize = new ResizeObserver(schedule);
    const observeChildren = () => {
      resize.disconnect();
      resize.observe(el);
      for (const child of el.children) resize.observe(child);
    };
    observeChildren();
    const mutations = new MutationObserver(() => {
      observeChildren();
      schedule();
    });
    mutations.observe(el, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "src"],
    });
    el.addEventListener("load", schedule, true);
    return () => {
      el.removeEventListener("scroll", schedule);
      el.removeEventListener("load", schedule, true);
      resize.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [isEnabled, offset, orientation, visibility]);
  const before =
    visibility === "auto"
      ? isEnabled && edges.before
      : visibility === "both" || visibility === (orientation === "vertical" ? "top" : "left");
  const after =
    visibility === "auto"
      ? isEnabled && edges.after
      : visibility === "both" || visibility === (orientation === "vertical" ? "bottom" : "right");
  const vertical = orientation === "vertical";
  const automatic = isEnabled && visibility === "auto";
  const compiled = stylex.props(
    scrollShadowStyles.root,
    scrollShadowStyles[orientation],
    hideScrollBar && scrollShadowStyles.hideScrollBar,
    (automatic || before || after) &&
      (vertical ? scrollShadowStyles.verticalMask : scrollShadowStyles.horizontalMask),
    scrollShadowStyles.geometry(size, offset, before, after),
    automatic && scrollShadowStyles.automatic,
    automatic &&
      (vertical ? scrollShadowStyles.verticalTimeline : scrollShadowStyles.horizontalTimeline),
    automatic && edges.overflow === false && scrollShadowStyles.inactive,
    xstyle,
  );
  return (
    <>
      <style href="lenso-scroll-shadow-properties" precedence="lenso-components">
        {scrollShadowProperties}
      </style>
      <div
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "scroll-shadow"}
        ref={mergedRef}
        data-orientation={orientation}
        data-scroll-shadow-mode={isEnabled && visibility === "auto" ? "auto" : "manual"}
        data-scroll-shadow-size={size}
        data-top-scroll={vertical && !after ? String(before) : undefined}
        data-bottom-scroll={vertical && !before ? String(after) : undefined}
        data-top-bottom-scroll={vertical && before && after ? "true" : undefined}
        data-left-scroll={!vertical && !after ? String(before) : undefined}
        data-right-scroll={!vertical && !before ? String(after) : undefined}
        data-left-right-scroll={!vertical && before && after ? "true" : undefined}
        {...compiled}
        style={{ ...compiled.style, ...style }}
      />
    </>
  );
}
export const ScrollShadow = Object.assign(ScrollShadowRoot, { Root: ScrollShadowRoot });
export type ScrollShadowProps = ScrollShadowRootProps;
export type ScrollShadow = { Props: ScrollShadowProps; RootProps: ScrollShadowRootProps };
