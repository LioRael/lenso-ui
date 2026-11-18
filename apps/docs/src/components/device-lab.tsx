"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { DeviceScene } from "../lib/device-scene";
import { createPhotosSession, type PhotosFrame } from "../lib/photos-model";
import { deviceLab as s } from "../styles/device-lab.stylex";

const copy = {
  en: {
    title: "Device frame",
    description: "Lenso, in a folding device. Drag beside the device to look around.",
    hinge: "Hinge angle",
    fold: "Fold",
    unfold: "Unfold",
    reset: "Reset view",
    loading: "Preparing 3D view…",
    error: "The 3D view needs WebGL. You can still open the Photos demo directly.",
    screenError: "The screens did not become ready. Reload the preview or open Photos directly.",
    photos: "Open Photos",
  },
  cn: {
    title: "设备预览",
    description: "在折叠设备中体验 Lenso。拖动设备周围的空白区域查看不同角度。",
    hinge: "铰链角度",
    fold: "折叠",
    unfold: "展开",
    reset: "重置视角",
    loading: "正在准备 3D 视图…",
    error: "3D 视图需要 WebGL 支持，你仍可直接打开相册示例。",
    screenError: "屏幕内容未能就绪。请重新加载预览，或直接打开相册。",
    photos: "打开相册",
  },
};

export function DeviceLab({ locale }: { locale: "en" | "cn" }) {
  const t = copy[locale];
  const [hinge, setHinge] = useState(180);
  const [animating, setAnimating] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "content-error">("loading");
  const [photos] = useState(createPhotosSession);
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<DeviceScene | null>(null);
  const frame = useRef(0);
  const pose = useRef({ hinge, busy: false });
  const busy = animating || (hinge > 2 && hinge < 178);

  useLayoutEffect(() => {
    pose.current = { hinge, busy };
    photos.setPose(hinge, busy);
    scene.current?.setHinge(hinge, busy);
  }, [hinge, busy, photos]);

  useEffect(() => {
    let cancelled = false;
    let contentTimer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribeContent: (() => void) | undefined;
    import("../lib/device-scene")
      .then(({ createDeviceScene }) => {
        if (cancelled || !host.current) return;
        const device = createDeviceScene(host.current, `/${locale}/photos`, {
          mount(frame, surface) {
            (frame as PhotosFrame).photosModel = photos.screen(surface);
          },
          isReady: photos.isReady,
          subscribePaint: photos.subscribePaint,
        });
        scene.current = device;
        device.setHinge(pose.current.hinge, pose.current.busy);
        const checkContent = () => {
          if (photos.isReady("inner") && photos.isReady("inner-right") && photos.isReady("cover")) {
            clearTimeout(contentTimer);
            contentTimer = undefined;
            setStatus("ready");
          } else if (!contentTimer) {
            contentTimer = setTimeout(() => setStatus("content-error"), 8000);
          }
        };
        unsubscribeContent = photos.subscribePaint(checkContent);
        checkContent();
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Device preview failed to initialize", error);
        setStatus("error");
      });
    return () => {
      cancelled = true;
      clearTimeout(contentTimer);
      unsubscribeContent?.();
      cancelAnimationFrame(frame.current);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [locale, photos]);
  useEffect(() => () => photos.dispose(), [photos]);

  const animateTo = (target: number) => {
    cancelAnimationFrame(frame.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimating(false);
      setHinge(target);
      return;
    }
    const from = hinge;
    const start = performance.now();
    setAnimating(true);
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      const eased = progress * progress * (3 - 2 * progress);
      setHinge(from + (target - from) * eased);
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else setAnimating(false);
    };
    frame.current = requestAnimationFrame(step);
  };

  const open = hinge > 90;
  return (
    <main id="main-content" tabIndex={-1} {...stylex.props(s.root)}>
      <header {...stylex.props(s.header)}>
        <h1 {...stylex.props(s.title)}>{t.title}</h1>
        <p {...stylex.props(s.description)}>{t.description}</p>
      </header>
      <div {...stylex.props(s.stage)}>
        <div ref={host} {...stylex.props(s.viewport)} />
        {status !== "ready" && (
          <output {...stylex.props(s.status)}>
            <span>
              {status === "error"
                ? t.error
                : status === "content-error"
                  ? t.screenError
                  : t.loading}
            </span>
            {(status === "error" || status === "content-error") && (
              <a href={`/${locale}/photos`}>{t.photos}</a>
            )}
          </output>
        )}
      </div>
      <div {...stylex.props(s.controls)}>
        <Slider
          min={0}
          max={180}
          step={1}
          value={hinge}
          disabled={status !== "ready"}
          onValueChange={(next) => {
            photos.handoff(() => {
              cancelAnimationFrame(frame.current);
              setAnimating(false);
              setHinge(typeof next === "number" ? next : next[0]!);
            });
          }}
          xstyle={s.slider}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb aria-label={t.hinge} />
            </Slider.Track>
          </Slider.Control>
        </Slider>
        <Button
          disabled={status !== "ready"}
          onClick={() => photos.handoff(() => animateTo(open ? 0 : 180))}
        >
          {open ? t.fold : t.unfold}
        </Button>
        <Button disabled={status !== "ready"} onClick={() => scene.current?.resetView()}>
          {t.reset}
        </Button>
      </div>
    </main>
  );
}
