import { useEffect, useRef, useState } from "react";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import {
  constrainCrop,
  drawPhotoEdit,
  loadPhoto,
  originalAdjustments,
  type PhotoAdjustments,
  type CropRect,
} from "../lib/photos-adjustments";
import { editor as s } from "../styles/photos-editor.stylex";

export function PhotosEditorPreview({
  src,
  title,
  value,
  cropping,
  lockedAspect,
  comparing,
  onCompare,
  onChange,
  onCommit,
  onLoaded,
}: {
  src: string;
  title: string;
  value: PhotoAdjustments;
  cropping: boolean;
  lockedAspect: number;
  comparing: boolean;
  onCompare: (holding: boolean) => void;
  onChange: (value: PhotoAdjustments) => void;
  onCommit: () => void;
  onLoaded: (size: { width: number; height: number }) => void;
}) {
  const stage = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0, centerOffset: 0 });
  const [ratio, setRatio] = useState(1);
  const [error, setError] = useState(false);
  const gesture = useRef<{
    x: number;
    y: number;
    corner: string;
    crop: CropRect;
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    let active = true;
    loadPhoto(src).then(
      (img) => {
        if (active) {
          setImage(img);
          onLoaded({ width: img.naturalWidth, height: img.naturalHeight });
        }
      },
      () => {
        if (active) setError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [src, onLoaded]);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const rect = node.getBoundingClientRect();
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
          centerOffset: innerHeight / 2 - (rect.top + rect.height / 2),
        });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!image || !canvas.current) return;
    const frame = requestAnimationFrame(() => {
      try {
        const node = canvas.current;
        if (!node) return;
        drawPhotoEdit(node, image, comparing ? originalAdjustments : value, 1400, cropping);
        setRatio(node.width / node.height);
      } catch {
        setError(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [image, value, cropping, comparing]);
  const width = Math.min(size.width, size.height * ratio),
    height = width / ratio;
  const centerOffset = cropping
    ? 0
    : Math.max(
        -(size.height - height) / 2,
        Math.min((size.height - height) / 2, size.centerOffset),
      );
  function change(dx: number, dy: number, corner: string, crop: CropRect) {
    let rect = { ...crop };
    if (corner === "move") {
      rect.x += dx;
      rect.y += dy;
    } else {
      const left = corner.includes("w"),
        top = corner.includes("n");
      const x = Math.max(0, Math.min(crop.x + crop.width - 0.1, crop.x + dx));
      const y = Math.max(0, Math.min(crop.y + crop.height - 0.1, crop.y + dy));
      if (left) {
        rect.width = crop.x + crop.width - x;
        rect.x = x;
      } else rect.width = Math.max(0.1, Math.min(1 - crop.x, crop.width + dx));
      if (top) {
        rect.height = crop.y + crop.height - y;
        rect.y = y;
      } else rect.height = Math.max(0.1, Math.min(1 - crop.y, crop.height + dy));
    }
    if (corner !== "move" && lockedAspect > 0) {
      const left = corner.includes("w"),
        top = corner.includes("n");
      const anchorX = left ? crop.x + crop.width : crop.x;
      const anchorY = top ? crop.y + crop.height : crop.y;
      const normalizedRatio = lockedAspect / ratio;
      const desiredWidth =
        Math.abs(dx * width) >= Math.abs(dy * height) ? rect.width : rect.height * normalizedRatio;
      const maxWidth = Math.min(
        left ? anchorX : 1 - anchorX,
        (top ? anchorY : 1 - anchorY) * normalizedRatio,
      );
      const w = Math.min(maxWidth, Math.max(0.1, 0.1 * normalizedRatio, desiredWidth));
      const h = w / normalizedRatio;
      rect = {
        x: left ? anchorX - w : anchorX,
        y: top ? anchorY - h : anchorY,
        width: w,
        height: h,
      };
    }
    rect = constrainCrop(rect);
    onChange({ ...value, crop: rect });
  }
  return (
    <div ref={stage} {...stylex.props(s.imageStage, cropping && s.cropStage)}>
      {(!image || error) && <output>{error ? "Photo unavailable" : "Loading photo…"}</output>}
      {image && !error && (
        <div
          {...stylex.props(s.previewFrame)}
          style={{ width, height, transform: `translateY(${centerOffset}px)` }}
        >
          {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Canvas renders the same pixels as export; an image role names its bitmap for assistive technology. */}
          <canvas ref={canvas} role="img" aria-label={title} {...stylex.props(s.canvas)} />
          {!cropping && (
            <Button
              aria-label="Hold to view original"
              variant="borderless"
              xstyle={s.compareSurface}
              onPointerDown={(e) => {
                if (e.button === 0) {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  onCompare(true);
                }
              }}
              onPointerUp={() => onCompare(false)}
              onPointerCancel={() => onCompare(false)}
              onLostPointerCapture={() => onCompare(false)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onCompare(true);
                }
              }}
              onKeyUp={() => onCompare(false)}
              onBlur={() => onCompare(false)}
            />
          )}
          {comparing && <span {...stylex.props(s.originalLabel)}>Original</span>}
          {cropping && (
            <div
              {...stylex.props(s.cropBounds)}
              style={{
                left: `${value.crop.x * 100}%`,
                top: `${value.crop.y * 100}%`,
                width: `${value.crop.width * 100}%`,
                height: `${value.crop.height * 100}%`,
              }}
            >
              {["move", "nw", "ne", "sw", "se"].map((corner) => (
                <Button
                  key={corner}
                  aria-label={corner === "move" ? "Move crop" : `Resize crop ${corner}`}
                  variant="borderless"
                  xstyle={[s.cropHandle, corner === "move" ? s.cropMove : s.cropCorner]}
                  data-corner={corner}
                  onPointerDown={(e) => {
                    if (e.button !== 0 || !e.isPrimary) return;
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    gesture.current = {
                      x: e.clientX,
                      y: e.clientY,
                      corner,
                      crop: value.crop,
                      width,
                      height,
                    };
                  }}
                  onPointerMove={(e) => {
                    const g = gesture.current;
                    if (!g || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
                    change(
                      (e.clientX - g.x) / g.width,
                      (e.clientY - g.y) / g.height,
                      g.corner,
                      g.crop,
                    );
                  }}
                  onPointerUp={(e) => {
                    if (gesture.current) {
                      gesture.current = null;
                      onCommit();
                      e.currentTarget.releasePointerCapture(e.pointerId);
                    }
                  }}
                  onPointerCancel={() => {
                    gesture.current = null;
                    onCommit();
                  }}
                  onLostPointerCapture={() => {
                    if (gesture.current) {
                      gesture.current = null;
                      onCommit();
                    }
                  }}
                  onKeyDown={(e) => {
                    const directions: Record<string, [number, number]> = {
                      ArrowLeft: [-0.01, 0],
                      ArrowRight: [0.01, 0],
                      ArrowUp: [0, -0.01],
                      ArrowDown: [0, 0.01],
                    };
                    const d = directions[e.key];
                    if (!d) return;
                    e.preventDefault();
                    change(d[0], d[1], corner, value.crop);
                  }}
                  onKeyUp={onCommit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
