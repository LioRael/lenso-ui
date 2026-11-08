import { useEffect, useRef, type RefObject } from "react";
import { selectionRange } from "../lib/photos-selection";

export function usePhotosDragSelection({
  active,
  ids,
  selected,
  onChange,
  viewport,
}: {
  active: boolean;
  ids: number[];
  selected: Set<number>;
  onChange: (value: Set<number>) => void;
  viewport: RefObject<HTMLElement | null>;
}) {
  const identity = ids.join(",");
  const grid = useRef<HTMLElement>(null);
  const current = useRef({ ids, selected, onChange });
  const suppressClick = useRef(false);
  useEffect(() => {
    current.current = { ids, selected, onChange };
  });
  useEffect(() => {
    const host = grid.current;
    const scroll = viewport.current;
    if (!active || !host || !scroll) return;
    let frame = 0;
    let previousTime = 0;
    let session: {
      pointer: number;
      anchor: number;
      initial: Set<number>;
      startX: number;
      startY: number;
      x: number;
      y: number;
      dragging: boolean;
      endpoint: number;
      rects: { left: number; right: number; top: number; bottom: number }[];
      top: number;
    } | null = null;
    const stop = () => {
      if (session?.dragging) suppressClick.current = true;
      const pointer = session?.pointer;
      session = null;
      cancelAnimationFrame(frame);
      frame = 0;
      if (pointer !== undefined && host.hasPointerCapture(pointer))
        host.releasePointerCapture(pointer);
    };
    const tick = (time: number) => {
      frame = 0;
      const s = session;
      if (!s?.dragging) return;
      const bounds = scroll.getBoundingClientRect();
      const top =
        bounds.top + (scroll.querySelector("header")?.getBoundingClientRect().height ?? 0);
      const bottom = bounds.bottom - 100;
      const band = Math.min(64, (bottom - top) / 4);
      const velocity =
        s.y < top + band
          ? -Math.min(1, (top + band - s.y) / band)
          : s.y > bottom - band
            ? Math.min(1, (s.y - bottom + band) / band)
            : 0;
      const dt = Math.min(32, previousTime ? time - previousTime : 16);
      previousTime = time;
      if (velocity) scroll.scrollTop += velocity * Math.abs(velocity) * dt * 0.65;
      const delta = scroll.scrollTop - s.top;
      const y = Math.max(top + 1, Math.min(bottom - 1, s.y));
      let nearest = -1;
      let distance = Infinity;
      for (let i = 0; i < s.rects.length; i++) {
        const rect = s.rects[i]!;
        const dx = Math.max(rect.left - s.x, 0, s.x - rect.right);
        const dy = Math.max(rect.top - delta - y, 0, y - (rect.bottom - delta));
        const d = dx * dx + dy * dy;
        if (d < distance) {
          distance = d;
          nearest = i;
        }
      }
      if (nearest >= 0 && s.endpoint !== nearest) {
        s.endpoint = nearest;
        current.current.onChange(selectionRange(s.initial, current.current.ids, s.anchor, nearest));
      }
      frame = requestAnimationFrame(tick);
    };
    const down = (e: PointerEvent) => {
      if (session || !e.isPrimary || e.button !== 0 || !(e.target instanceof Element)) return;
      const tile = e.target.closest<HTMLElement>("[data-selection-id]");
      if (!tile) return;
      suppressClick.current = false;
      const anchor = current.current.ids.indexOf(Number(tile.dataset["selectionId"]));
      if (anchor < 0) return;
      session = {
        pointer: e.pointerId,
        anchor,
        initial: new Set(current.current.selected),
        startX: e.clientX,
        startY: e.clientY,
        x: e.clientX,
        y: e.clientY,
        dragging: false,
        endpoint: -1,
        top: scroll.scrollTop,
        rects: [...host.querySelectorAll<HTMLElement>("[data-selection-id]")].map((node) =>
          node.getBoundingClientRect(),
        ),
      };
    };
    const move = (e: PointerEvent) => {
      const s = session;
      if (!s || s.pointer !== e.pointerId) return;
      s.x = e.clientX;
      s.y = e.clientY;
      if (!s.dragging) {
        const dx = Math.abs(s.x - s.startX),
          dy = Math.abs(s.y - s.startY);
        if (dy > 8 && dy > dx) {
          stop();
          return;
        }
        if (dx < 8 || dx < dy) return;
        s.dragging = true;
        host.setPointerCapture(e.pointerId);
        previousTime = 0;
        frame = requestAnimationFrame(tick);
      }
      e.preventDefault();
    };
    const end = (e: PointerEvent) => {
      if (e.pointerId !== session?.pointer) return;
      if (session.dragging && e.type === "pointerup") tick(performance.now());
      stop();
    };
    const click = (e: MouseEvent) => {
      if (!suppressClick.current || !e.detail) return;
      suppressClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const secondPointer = (e: PointerEvent) => {
      if (!e.isPrimary && session) stop();
    };
    host.addEventListener("pointerdown", down);
    host.addEventListener("pointermove", move, { passive: false });
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);
    host.addEventListener("lostpointercapture", end);
    host.addEventListener("click", click, true);
    document.addEventListener("pointerdown", secondPointer);
    window.addEventListener("blur", stop);
    window.addEventListener("resize", stop);
    return () => {
      stop();
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", end);
      host.removeEventListener("pointercancel", end);
      host.removeEventListener("lostpointercapture", end);
      host.removeEventListener("click", click, true);
      document.removeEventListener("pointerdown", secondPointer);
      window.removeEventListener("blur", stop);
      window.removeEventListener("resize", stop);
    };
  }, [active, identity, viewport]);
  return grid;
}
