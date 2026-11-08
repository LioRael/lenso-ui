import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import {
  draggedPhoto,
  photoReleaseVelocity,
  photoReturnFrames,
  restingPhoto,
  shouldDismissPhoto,
  type PhotoPose,
  type PhotoPointerSample,
} from "../lib/photos-gesture";

type Frame = { left: number; top: number; width: number; height: number };
type PhotoDrag = {
  startX: number;
  startY: number;
  base: PhotoPose;
  clipPath: string;
  active: boolean;
  samples: PhotoPointerSample[];
};

const photoTransform = (pose: PhotoPose) =>
  `translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`;

function fittedImage(stage: HTMLElement, thumbnail?: HTMLImageElement): Frame | undefined {
  const image = stage.querySelector<HTMLImageElement>("[data-photo-current] img");
  const imageWidth = image?.naturalWidth || thumbnail?.naturalWidth;
  const imageHeight = image?.naturalHeight || thumbnail?.naturalHeight;
  if (!imageWidth || !imageHeight) return;
  const bounds = stage.getBoundingClientRect();
  const scale = Math.min(bounds.width / imageWidth, bounds.height / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    left: bounds.left + (bounds.width - width) / 2,
    top: bounds.top + (bounds.height - height) / 2,
    width,
    height,
  };
}

function thumbnailPose(source: Frame, target: Frame) {
  const scale = Math.max(source.width / target.width, source.height / target.height);
  const cropX = (target.width - source.width / scale) / 2;
  const cropY = (target.height - source.height / scale) / 2;
  const x = source.left + source.width / 2 - target.left - target.width / 2;
  const y = source.top + source.height / 2 - target.top - target.height / 2;
  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    clipPath: `inset(${cropY}px ${cropX}px)`,
  };
}

export function usePhotoZoom(
  selected: number | null,
  tiles: RefObject<Map<number, HTMLElement>>,
  onClosed: () => void,
  pointerOpened: RefObject<boolean>,
) {
  const stage = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);
  const closing = useRef(false);
  const hiddenTile = useRef<HTMLElement | null>(null);
  const presented = useRef(false);
  const drag = useRef<PhotoDrag | null>(null);
  const controls = useCallback(
    () => Array.from(chrome.current?.querySelectorAll<HTMLElement>("[data-photo-control]") ?? []),
    [],
  );

  const stopDragging = useCallback(() => {
    drag.current = null;
    stage.current?.removeAttribute("data-dragging");
  }, []);

  const cancel = useCallback(() => {
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    closing.current = false;
    stage.current?.style.removeProperty("opacity");
    backdrop.current?.style.removeProperty("opacity");
    controls().forEach((element) => element.style.removeProperty("opacity"));
    if (ghost.current) {
      ghost.current.style.visibility = "hidden";
      ghost.current.style.removeProperty("transform");
      ghost.current.style.removeProperty("clip-path");
    }
    if (hiddenTile.current) hiddenTile.current.style.visibility = "";
    hiddenTile.current = null;
  }, [controls]);

  const transition = useCallback(
    (exiting: boolean, contentPose?: { x: number; y: number; scale: number }) => {
      const imageStage = stage.current;
      const layer = ghost.current;
      const tile = selected === null ? undefined : tiles.current.get(selected);
      const target = imageStage && fittedImage(imageStage, tile?.querySelector("img") ?? undefined);
      const source = tile?.getBoundingClientRect();
      if (
        !imageStage ||
        !layer ||
        !target ||
        !source ||
        source.bottom <= 0 ||
        source.top >= innerHeight
      )
        return false;
      const interrupted =
        exiting && layer.style.visibility === "visible"
          ? {
              transform: getComputedStyle(layer).transform,
              clipPath: getComputedStyle(layer).clipPath,
            }
          : contentPose
            ? {
                transform: photoTransform({ ...restingPhoto, ...contentPose }),
                clipPath: "inset(0px)",
              }
            : undefined;
      const opacities = [backdrop.current, controls()[0]].map((element) =>
        element ? getComputedStyle(element).opacity : "1",
      );
      cancel();
      const pose = thumbnailPose(source, target);
      const rest = { transform: "translate(0px, 0px) scale(1)", clipPath: "inset(0px 0px)" };
      Object.assign(layer.style, {
        left: `${target.left}px`,
        top: `${target.top}px`,
        width: `${target.width}px`,
        height: `${target.height}px`,
        visibility: "visible",
      });
      imageStage.style.opacity = "0";
      if (tile) {
        tile.style.visibility = "hidden";
        hiddenTile.current = tile;
      }
      const easing =
        getComputedStyle(imageStage).getPropertyValue("--lenso-motion-ease-out-quart").trim() ||
        "cubic-bezier(0.25, 1, 0.5, 1)";
      const timing = { duration: exiting ? 240 : 280, easing, fill: "both" as const };
      const imageAnimation = layer.animate(
        exiting ? [interrupted ?? rest, pose] : [pose, rest],
        timing,
      );
      animations.current.push(imageAnimation);
      // Fading a lens ancestor creates a backdrop root and cuts off its sampled background.
      [backdrop.current, ...controls()].forEach((element, index) => {
        if (element)
          animations.current.push(
            element.animate(
              { opacity: exiting ? [opacities[index === 0 ? 0 : 1]!, "0"] : ["0", "1"] },
              timing,
            ),
          );
      });
      imageAnimation.onfinish = () => {
        if (exiting) onClosed();
        else {
          imageStage.style.removeProperty("opacity");
          layer.style.visibility = "hidden";
          cancel();
        }
      };
      return true;
    },
    [selected, tiles, onClosed, cancel, controls],
  );

  useLayoutEffect(() => {
    if (selected === null) presented.current = false;
    return () => {
      stopDragging();
      cancel();
    };
  }, [selected, cancel, stopDragging]);

  const mountGhost = useCallback(
    (node: HTMLDivElement | null) => {
      ghost.current = node;
      if (node && !presented.current) {
        presented.current = true;
        if (pointerOpened.current && !matchMedia("(prefers-reduced-motion: reduce)").matches)
          transition(false);
      }
    },
    [transition, pointerOpened],
  );

  function close(animate = true, contentPose?: { x: number; y: number; scale: number }) {
    if (closing.current) return;
    stopDragging();
    if (
      !animate ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !transition(true, contentPose)
    )
      onClosed();
    else closing.current = true;
  }

  function presentation() {
    const layer = ghost.current;
    if (!layer || layer.style.visibility !== "visible")
      return { pose: restingPhoto, clipPath: "inset(0px)" };
    const style = getComputedStyle(layer);
    const control = controls()[0];
    const matrix = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
    return {
      pose: {
        x: matrix.m41,
        y: matrix.m42,
        scale: matrix.a,
        background: backdrop.current ? Number(getComputedStyle(backdrop.current).opacity) : 1,
        controls: control ? Number(getComputedStyle(control).opacity) : 1,
      },
      clipPath: style.clipPath,
    };
  }

  function paintDrag(pose: PhotoPose, clipPath: string) {
    if (ghost.current)
      Object.assign(ghost.current.style, { transform: photoTransform(pose), clipPath });
    if (backdrop.current) backdrop.current.style.opacity = String(pose.background);
    controls().forEach((element) => {
      element.style.opacity = String(pose.controls);
    });
  }

  function returnPhoto(velocity: { x: number; y: number }) {
    const layer = ghost.current;
    if (!layer) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancel();
      return;
    }
    const { pose, clipPath } = presentation();
    const frames = photoReturnFrames(pose, velocity);
    animations.current.forEach((animation) => animation.cancel());
    const timing = { duration: 600, easing: "linear", fill: "both" as const };
    const imageFrames: Keyframe[] = frames.map((frame) => ({ transform: photoTransform(frame) }));
    imageFrames[0]!["clipPath"] = clipPath;
    imageFrames.at(-1)!["clipPath"] = "inset(0px)";
    const imageAnimation = layer.animate(imageFrames, timing);
    animations.current = [imageAnimation];
    for (const [element, key] of [
      [backdrop.current, "background"],
      ...controls().map((element) => [element, "controls"] as const),
    ] as const) {
      if (element)
        animations.current.push(
          element.animate(
            frames.map((frame) => ({ opacity: frame[key] })),
            timing,
          ),
        );
    }
    imageAnimation.onfinish = cancel;
  }

  function finishDrag(time: number, interrupted: boolean) {
    const gesture = drag.current;
    if (!gesture) return;
    stopDragging();
    if (!gesture.active) {
      animations.current.forEach((animation) => animation.play());
      return;
    }
    const velocity = interrupted ? { x: 0, y: 0 } : photoReleaseVelocity(gesture.samples, time);
    const { pose } = presentation();
    if (!interrupted && shouldDismissPhoto(pose.y, velocity.y, innerHeight)) close();
    else returnPhoto(velocity);
  }

  function beginPull(point: PhotoPointerSample) {
    if (closing.current) return false;
    const { pose, clipPath } = presentation();
    animations.current.forEach((animation) => animation.pause());
    drag.current = {
      startX: point.x,
      startY: point.y,
      base: pose,
      clipPath,
      active: false,
      samples: [point],
    };
    return true;
  }

  function movePull(point: PhotoPointerSample) {
    const gesture = drag.current;
    if (!gesture) return;
    const dx = point.x - gesture.startX;
    const dy = point.y - gesture.startY;
    gesture.samples.push(point);
    gesture.samples = gesture.samples.filter((sample) => point.time - sample.time <= 100);
    if (!gesture.active) {
      const imageStage = stage.current;
      const layer = ghost.current;
      const tile = selected === null ? undefined : tiles.current.get(selected);
      const target = imageStage && fittedImage(imageStage, tile?.querySelector("img") ?? undefined);
      if (!imageStage || !layer || !target) {
        stopDragging();
        animations.current.forEach((animation) => animation.play());
        return;
      }
      cancel();
      gesture.active = true;
      Object.assign(layer.style, {
        left: `${target.left}px`,
        top: `${target.top}px`,
        width: `${target.width}px`,
        height: `${target.height}px`,
        visibility: "visible",
      });
      imageStage.style.opacity = "0";
      imageStage.setAttribute("data-dragging", "");
      if (tile) {
        tile.style.visibility = "hidden";
        hiddenTile.current = tile;
      }
    }
    paintDrag(
      draggedPhoto(
        gesture.base,
        dx,
        dy,
        innerHeight,
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
      gesture.clipPath,
    );
  }

  return {
    stageRef: stage,
    ghostRef: mountGhost,
    backdropRef: backdrop,
    chromeRef: chrome,
    close,
    pull: {
      begin: beginPull,
      move: movePull,
      end: finishDrag,
      takeOver: () => {
        const { pose } = presentation();
        stopDragging();
        cancel();
        return pose;
      },
    },
  };
}
