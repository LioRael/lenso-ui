import {
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
  type PointerEvent,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import {
  photoReleaseVelocity,
  returningValue,
  type PhotoPointerSample,
} from "../lib/photos-gesture";
import {
  boundImage,
  imageRest,
  maxImageScale,
  photoPageDirection,
  scaleAround,
  type ImagePose,
  type Point,
} from "../lib/photos-surface";
import type { usePhotoZoom } from "./photos-zoom";

type Presentation = ReturnType<typeof usePhotoZoom>;
type Gesture = {
  mode: "pending" | "pull" | "page" | "pan" | "pinch" | "ignored";
  start: Point;
  started: number;
  base: ImagePose;
  page: number;
  distance: number;
  samples: PhotoPointerSample[];
  moved: boolean;
  interruptedTarget?: ImagePose;
};

const transform = (pose: ImagePose) => `translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`;
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function usePhotoSurface(
  { stageRef, pull, close: closePresentation }: Presentation,
  selected: number | null,
  previous: number | undefined,
  next: number | undefined,
  onChange: (id: number) => void,
  onTap: () => void,
) {
  const track = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const pose = useRef<ImagePose>(imageRest);
  const page = useRef(0);
  const motion = useRef<Animation | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const pendingPage = useRef<{ id: number; offset: number; velocity: number } | null>(null);
  const lastTap = useRef<{ point: Point; time: number } | null>(null);
  const touchZoomTime = useRef(-Infinity);
  const zoomedRef = useRef(false);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function cancelTap() {
    clearTimeout(tapTimer.current);
  }
  const nativeHandlers = useRef<{ wheel: (event: WheelEvent) => void; resize: () => void } | null>(
    null,
  );
  const [zoomed, setZoomed] = useState(false);

  function geometry() {
    const stage = stageRef.current;
    const photo = image.current?.querySelector("img");
    if (!stage || !photo?.naturalWidth) return;
    const factor = Math.min(
      stage.clientWidth / photo.naturalWidth,
      stage.clientHeight / photo.naturalHeight,
    );
    return {
      width: photo.naturalWidth * factor,
      height: photo.naturalHeight * factor,
      viewportWidth: stage.clientWidth,
      viewportHeight: stage.clientHeight,
    };
  }

  const paintImage = useCallback(
    (value: ImagePose) => {
      pose.current = value;
      if (image.current) image.current.style.transform = transform(value);
      const active = value.scale > 1.02;
      stageRef.current?.toggleAttribute("data-zoomed", active);
      if (active !== zoomedRef.current) {
        zoomedRef.current = active;
        setZoomed(active);
      }
    },
    [stageRef],
  );

  function paintPage(value: number) {
    page.current = value;
    if (track.current) track.current.style.transform = `translateX(${value}px)`;
  }

  function freeze() {
    if (!motion.current) return;
    const element =
      motion.current.effect instanceof KeyframeEffect ? motion.current.effect.target : null;
    if (element instanceof HTMLElement) {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      if (element === image.current) paintImage({ x: matrix.m41, y: matrix.m42, scale: matrix.a });
      else paintPage(matrix.m41);
    }
    motion.current.cancel();
    motion.current = null;
  }

  function animateImage(target: ImagePose, velocity = { x: 0, y: 0 }) {
    freeze();
    const from = pose.current;
    const frames = Array.from({ length: 37 }, (_, i) => ({
      transform: transform(
        i === 36
          ? target
          : {
              x: target.x + returningValue(from.x - target.x, velocity.x * 1000, i / 60),
              y: target.y + returningValue(from.y - target.y, velocity.y * 1000, i / 60),
              scale: target.scale + returningValue(from.scale - target.scale, 0, i / 60),
            },
      ),
    }));
    paintImage(target);
    if (reducedMotion() || !image.current) return;
    const animation = image.current.animate(frames, { duration: 600, easing: "linear" });
    motion.current = animation;
    animation.onfinish = () => {
      if (motion.current === animation) motion.current = null;
    };
  }

  function animatePage(from: number, velocity: number) {
    paintPage(0);
    if (reducedMotion() || !track.current) return;
    const frames = Array.from({ length: 37 }, (_, i) => ({
      transform: `translateX(${i === 36 ? 0 : returningValue(from, velocity * 1000, i / 60)}px)`,
    }));
    const animation = track.current.animate(frames, { duration: 600, easing: "linear" });
    motion.current = animation;
    animation.onfinish = () => {
      if (motion.current === animation) motion.current = null;
    };
  }

  const releasePointers = useCallback(() => {
    const stage = stageRef.current;
    const ids = [...pointers.current.keys()];
    pointers.current.clear();
    gesture.current = null;
    for (const id of ids) if (stage?.hasPointerCapture(id)) stage.releasePointerCapture(id);
    stage?.removeAttribute("data-dragging");
  }, [stageRef]);

  useLayoutEffect(() => {
    motion.current?.cancel();
    motion.current = null;
    releasePointers();
    paintImage(imageRest);
    const pending = pendingPage.current;
    pendingPage.current = null;
    if (pending?.id === selected) animatePage(pending.offset, pending.velocity);
    else paintPage(0);
    lastTap.current = null;
    return () => {
      releasePointers();
      motion.current?.cancel();
      motion.current = null;
      clearTimeout(wheelTimer.current);
      clearTimeout(tapTimer.current);
    };
  }, [selected, paintImage, releasePointers]);

  function relative(point: Point) {
    const bounds = stageRef.current!.getBoundingClientRect();
    return {
      x: point.x - bounds.left - bounds.width / 2,
      y: point.y - bounds.top - bounds.height / 2,
    };
  }

  function takeOver() {
    const visible = pull.takeOver();
    if (visible.x || visible.y || visible.scale !== 1) paintImage(visible);
  }

  function toggleZoom(point?: Point) {
    cancelTap();
    freeze();
    takeOver();
    releasePointers();
    clearTimeout(wheelTimer.current);
    paintPage(0);
    const size = geometry();
    if (!size) return;
    const origin = point ? relative(point) : { x: 0, y: 0 };
    const target =
      pose.current.scale > 1.02
        ? imageRest
        : boundImage(scaleAround(pose.current, origin, origin, 3), size);
    animateImage(target);
  }

  function pinchBase() {
    const [a, b] = [...pointers.current.values()];
    if (!a || !b) return;
    gesture.current = {
      mode: "pinch",
      start: relative({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }),
      started: 0,
      base: pose.current,
      page: 0,
      distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
      samples: [],
      moved: true,
    };
    lastTap.current = null;
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || (visualViewport?.scale ?? 1) > 1)
      return;
    clearTimeout(wheelTimer.current);
    cancelTap();
    const interruptedTarget =
      motion.current?.effect instanceof KeyframeEffect &&
      motion.current.effect.target === image.current
        ? pose.current
        : undefined;
    freeze();
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size > 1) {
      takeOver();
      if (page.current) {
        paintImage({ ...pose.current, x: pose.current.x + page.current });
        paintPage(0);
      }
      pinchBase();
      return;
    }
    const mode =
      Math.abs(pose.current.scale - 1) > 0.001
        ? "pan"
        : Math.abs(page.current) > 1
          ? "page"
          : "pending";
    if (mode === "pending" && !pull.begin({ ...point, time: event.timeStamp })) {
      releasePointers();
      return;
    }
    gesture.current = {
      mode,
      start: point,
      started: event.timeStamp,
      base: pose.current,
      page: page.current,
      distance: 0,
      samples: [{ ...point, time: event.timeStamp }],
      moved: false,
      interruptedTarget,
    };
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    const current = gesture.current;
    if (!current) return;
    const dx = point.x - current.start.x;
    const dy = point.y - current.start.y;
    if (current.mode === "pinch") {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const raw = (current.base.scale * Math.hypot(a.x - b.x, a.y - b.y)) / current.distance;
      const scale =
        raw < 1
          ? Math.max(0.65, 1 + (raw - 1) * 0.35)
          : raw > maxImageScale
            ? Math.min(maxImageScale * 1.15, maxImageScale + (raw - maxImageScale) * 0.22)
            : raw;
      const center = relative({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      paintImage(scaleAround(current.base, current.start, center, scale));
      event.preventDefault();
      return;
    }
    current.samples.push({ ...point, time: event.timeStamp });
    current.samples = current.samples.filter((sample) => event.timeStamp - sample.time <= 100);
    if (Math.hypot(dx, dy) >= 8) {
      current.moved = true;
      lastTap.current = null;
    }
    if (current.mode === "pending") {
      if (!current.moved) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        pull.takeOver();
        current.mode = "page";
      } else current.mode = dy > 0 ? "pull" : "ignored";
    }
    if (current.mode === "pull") pull.move({ ...point, time: event.timeStamp });
    if (current.mode === "page") {
      const offset = current.page + dx;
      paintPage(
        (offset > 0 && previous === undefined) || (offset < 0 && next === undefined)
          ? offset * 0.22
          : offset,
      );
    }
    if (current.mode === "pan") {
      const size = geometry();
      if (size)
        paintImage(
          boundImage(
            { ...current.base, x: current.base.x + dx, y: current.base.y + dy },
            size,
            true,
          ),
        );
    }
    if (current.moved) {
      event.preventDefault();
      event.currentTarget.setAttribute("data-dragging", "");
    }
  }

  function pointerEnd(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    if (!pointers.current.has(event.pointerId)) return;
    const current = gesture.current;
    if (cancelled) lastTap.current = null;
    pointers.current.delete(event.pointerId);
    if (!current) return;
    if (!cancelled && pointers.current.size) {
      if (pointers.current.size >= 2) pinchBase();
      else {
        const remaining = [...pointers.current.values()][0]!;
        gesture.current = {
          ...current,
          mode: "pan",
          start: remaining,
          base: pose.current,
          samples: [{ ...remaining, time: event.timeStamp }],
          moved: true,
        };
      }
      return;
    }
    releasePointers();
    const velocity = cancelled
      ? { x: 0, y: 0 }
      : photoReleaseVelocity(current.samples, event.timeStamp);
    if (current.mode === "pull" || current.mode === "pending" || current.mode === "ignored")
      pull.end(event.timeStamp, cancelled);
    if (current.mode === "page") {
      const distance = (current.samples.at(-1)?.x ?? current.start.x) - current.start.x;
      const direction = cancelled
        ? 0
        : photoPageDirection(distance, velocity.x, event.currentTarget.clientWidth);
      const id = direction === 1 ? next : direction === -1 ? previous : undefined;
      if (id !== undefined) {
        pendingPage.current = {
          id,
          offset: page.current + direction * (event.currentTarget.clientWidth + 12),
          velocity: velocity.x,
        };
        onChange(id);
      } else
        animatePage(
          page.current,
          (page.current > 0 && previous === undefined) || (page.current < 0 && next === undefined)
            ? velocity.x * 0.22
            : velocity.x,
        );
    }
    if (current.mode === "pinch" || current.mode === "pan") {
      const size = geometry();
      if (size)
        animateImage(
          boundImage(
            {
              ...pose.current,
              x: pose.current.x + (velocity.x * 1000 * 31) / 230,
              y: pose.current.y + (velocity.y * 1000 * 31) / 230,
              scale: Math.min(maxImageScale, Math.max(1, pose.current.scale)),
            },
            size,
          ),
          velocity,
        );
    }
    if (!current.moved && current.interruptedTarget) animateImage(current.interruptedTarget);
    if (
      !cancelled &&
      !current.moved &&
      (current.mode === "pending" || current.mode === "pan") &&
      event.timeStamp - current.started < 250
    ) {
      const point = { x: event.clientX, y: event.clientY };
      const last = lastTap.current;
      if (
        event.pointerType === "touch" &&
        last &&
        event.timeStamp - last.time < 280 &&
        Math.hypot(point.x - last.point.x, point.y - last.point.y) < 24
      ) {
        lastTap.current = null;
        touchZoomTime.current = event.timeStamp;
        toggleZoom(point);
      } else {
        if (event.pointerType === "touch") lastTap.current = { point, time: event.timeStamp };
        tapTimer.current = setTimeout(onTap, 280);
      }
    }
  }

  function close(animate = true) {
    cancelTap();
    freeze();
    releasePointers();
    clearTimeout(wheelTimer.current);
    closePresentation(animate, { ...pose.current, x: pose.current.x + page.current });
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "+" || event.key === "=" || event.key === "0" || event.key === "-") {
      event.preventDefault();
      if (event.key === "0" || event.key === "-") {
        freeze();
        takeOver();
        releasePointers();
        animateImage(imageRest);
      } else if (!zoomedRef.current) toggleZoom();
    } else if (zoomedRef.current && event.key.startsWith("Arrow")) {
      event.preventDefault();
      freeze();
      const size = geometry();
      if (size)
        animateImage(
          boundImage(
            {
              ...pose.current,
              x:
                pose.current.x +
                (event.key === "ArrowLeft" ? 80 : event.key === "ArrowRight" ? -80 : 0),
              y:
                pose.current.y +
                (event.key === "ArrowUp" ? 80 : event.key === "ArrowDown" ? -80 : 0),
            },
            size,
          ),
        );
    }
  }

  function wheelZoom(event: WheelEvent) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    freeze();
    takeOver();
    releasePointers();
    paintPage(0);
    const size = geometry();
    if (!size) return;
    const origin = relative({ x: event.clientX, y: event.clientY });
    const scale = Math.max(
      1,
      Math.min(maxImageScale, pose.current.scale * Math.exp(-event.deltaY * 0.01)),
    );
    paintImage(boundImage(scaleAround(pose.current, origin, origin, scale), size, true));
    clearTimeout(wheelTimer.current);
    wheelTimer.current = setTimeout(() => {
      const currentSize = geometry();
      if (currentSize) animateImage(boundImage(pose.current, currentSize));
    }, 120);
  }

  function resize() {
    freeze();
    takeOver();
    releasePointers();
    paintPage(0);
    const size = geometry();
    if (size)
      paintImage(
        boundImage(
          { ...pose.current, scale: Math.max(1, Math.min(maxImageScale, pose.current.scale)) },
          size,
        ),
      );
  }

  useLayoutEffect(() => {
    nativeHandlers.current = { wheel: wheelZoom, resize };
  });

  const mountStage = useCallback(
    (stage: HTMLDivElement | null) => {
      stageRef.current = stage;
      if (!stage) return;
      let width = stage.clientWidth;
      let height = stage.clientHeight;
      const wheel = (event: WheelEvent) => nativeHandlers.current?.wheel(event);
      const observer = new ResizeObserver(() => {
        if (width === stage.clientWidth && height === stage.clientHeight) return;
        width = stage.clientWidth;
        height = stage.clientHeight;
        nativeHandlers.current?.resize();
      });
      stage.addEventListener("wheel", wheel, { passive: false });
      observer.observe(stage);
      return () => {
        stage.removeEventListener("wheel", wheel);
        observer.disconnect();
        clearTimeout(wheelTimer.current);
        stageRef.current = null;
      };
    },
    [stageRef],
  );

  return {
    trackRef: track,
    surfaceRef: mountStage,
    imageRef: image,
    zoomed,
    toggleZoom,
    close,
    keyDown,
    cancelTap,
    gestureHandlers: {
      onPointerDown: pointerDown,
      onPointerMove: pointerMove,
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => pointerEnd(event, false),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => pointerEnd(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => pointerEnd(event, true),
      onDoubleClick: (event: MouseEvent<HTMLDivElement>) => {
        cancelTap();
        event.preventDefault();
        if (event.timeStamp - touchZoomTime.current > 500)
          toggleZoom({ x: event.clientX, y: event.clientY });
      },
    },
  };
}
