"use client";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import * as stylex from "@stylexjs/stylex";
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "./render.js";
import { presentationMaterials } from "./presentation.js";

const arrowPaths = {
  popover: {
    inset: 13,
    points: [
      [0, 0],
      [14, 0],
      [17, 3],
      [23, 10],
      [26, 14],
      [30, 14],
      [33, 10],
      [39, 3],
      [42, 0],
      [56, 0],
    ],
  },
  tooltip: {
    inset: 12,
    points: [
      [0, 0],
      [5.48483, 8],
      [6.5, 8],
      [12, 0],
    ],
  },
} as const;

/** One native-coordinate backdrop sample for a body and its default arrow. */
export function AnchoredMaterial({ kind }: { kind: keyof typeof arrowPaths }) {
  const { inset, points } = arrowPaths[kind];
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const surface = ref.current!;
    const popup = surface.parentElement!;
    const update = () => {
      const style = getComputedStyle(popup);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      const box = popup.getBoundingClientRect();
      if (!width || !height || !box.width || !box.height) return;
      const radius = Math.min(parseFloat(style.borderTopLeftRadius), width / 2, height / 2);
      const arrow = popup.querySelector<HTMLElement>(`[data-slot="${kind}-arrow-material"]`);
      let path = "";
      if (arrow && getComputedStyle(arrow.parentElement!).display !== "none") {
        const arrowStyle = getComputedStyle(arrow);
        const parentStyle = getComputedStyle(arrow.parentElement!);
        const angle =
          (((parseFloat(arrowStyle.rotate) || 0) + (parseFloat(parentStyle.rotate) || 0)) *
            Math.PI) /
          180;
        const cosine = Math.cos(angle),
          sine = Math.sin(angle);
        const arrowWidth = parseFloat(arrowStyle.width),
          arrowHeight = parseFloat(arrowStyle.height);
        const corners: [number, number][] = [
          [0, 0],
          [arrowWidth, 0],
          [0, arrowHeight],
          [arrowWidth, arrowHeight],
        ];
        const rotatedX = corners.map(([x, y]) => x * cosine - y * sine);
        const rotatedY = corners.map(([x, y]) => x * sine + y * cosine);
        const anchor = arrow.getBoundingClientRect();
        const x = ((anchor.left - box.left) * width) / box.width + inset - Math.min(...rotatedX);
        const y = ((anchor.top - box.top) * height) / box.height + inset - Math.min(...rotatedY);
        const transformed = points.map(
          ([px, py]) => `${x + px * cosine - py * sine} ${y + px * sine + py * cosine}`,
        );
        path = `M${transformed[0]}`;
        for (let i = 1; i < transformed.length; i += 3)
          path += ` C${transformed.slice(i, i + 3).join(" ")}`;
        path += " Z";
      }
      const right = width + inset,
        bottom = height + inset;
      const arc = `A${radius} ${radius} 0 0 0`;
      const panel = `M${inset + radius} ${inset} ${arc} ${inset} ${inset + radius} V${bottom - radius} ${arc} ${inset + radius} ${bottom} H${right - radius} ${arc} ${right} ${bottom - radius} V${inset + radius} ${arc} ${right - radius} ${inset} Z`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width + inset * 2}" height="${height + inset * 2}"><path fill="white" d="${panel} ${path}"/></svg>`;
      surface.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      surface.setAttribute("data-material-shaped", "");
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(popup);
    const observer = new MutationObserver((records) => {
      if (
        records.some(
          ({ target, type }) =>
            type === "childList" ||
            target === popup ||
            target === popup.querySelector(`[data-slot="${kind}-arrow-material"]`)?.parentElement,
        )
      )
        update();
    });
    observer.observe(popup, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class", "data-side", "data-direction"],
    });
    return () => {
      resize.disconnect();
      observer.disconnect();
    };
  }, [kind, inset, points]);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot={`${kind}-material`}
      style={{ "--anchored-material-inset": `${inset}px` } as CSSProperties}
      {...stylex.props(
        materialStyles.root,
        materialStyles[presentationMaterials.anchored],
        materialStyles.anchored,
        materialStyles.accessible,
      )}
    >
      <MaterialBackground
        variant={presentationMaterials.anchored}
        local
        layerXstyle={materialStyles.anchoredPaint}
      />
    </span>
  );
}
