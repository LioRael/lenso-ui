import React from "react";
import { createRoot } from "react-dom/client";
import { GlassButton } from "../../packages/ui/dist/components/glass-button/index.js";
import "../../packages/tokens/dist/styles.css";
import { createRenderer } from "./renderer.ts";

declare global {
  interface Window {
    glassExperiment: {
      renderer: string;
      theme: string;
      dynamic: boolean;
      stats: Awaited<ReturnType<typeof createRenderer>>["stats"];
      activations: () => number;
      settled: () => Promise<void>;
      motion: Animation | undefined;
      dispose: () => void;
    };
    glassExperimentError?: string;
    samples: number[];
    frame: number;
  }
}

const parameters = new URLSearchParams(location.search);
const theme = parameters.get("theme") ?? "dark";
const renderer = parameters.get("renderer") ?? "native";
const dynamic = parameters.get("dynamic") === "1";
document.documentElement.dataset["theme"] = theme;
document.body.style.cssText = "margin:0;background:#777;font-family:Arial";
const scene = document.createElement("div");
scene.id = "scene";
scene.style.cssText = "position:relative;width:600px;height:600px;margin:24px";
document.body.append(scene);
const canvas = document.createElement("canvas");
canvas.content = "drawable";
canvas.width = 600 * devicePixelRatio;
canvas.height = 600 * devicePixelRatio;
canvas.style.cssText = "position:absolute;inset:0;width:600px;height:600px";
const background = document.createElement("div");
background.setAttribute("drawable", "");
background.style.cssText =
  "position:relative;width:600px;height:600px;overflow:hidden;background:linear-gradient(120deg,#315f9f,#a9c9ee)";
if (parameters.get("pattern") === "1")
  background.style.background =
    "repeating-linear-gradient(37deg,#17365d 0px,#315f9f 80px,#a9c9ee 83px,#315f9f 90px,#17365d 160px)";
const moving = document.createElement("div");
let motion: Animation | undefined;
moving.style.cssText =
  "position:absolute;left:160px;top:0;width:100px;height:600px;background:linear-gradient(90deg,transparent,#ef978b,transparent)";
if (dynamic) {
  background.append(moving);
  motion = moving.animate(
    { transform: ["translateX(-200px)", "translateX(300px)", "translateX(-200px)"] },
    { duration: 3000, iterations: Infinity },
  );
  motion.pause();
  motion.currentTime = 1000;
}
canvas.append(background);
scene.append(canvas);
const controls = document.createElement("div");
scene.append(controls);
let activations = 0;
const root = createRoot(controls);
root.render(
  React.createElement(
    React.Fragment,
    null,
    ...Array.from({ length: 100 }, (_, i) =>
      React.createElement(
        GlassButton,
        {
          key: i,
          isIconOnly: true,
          ...{ "data-testid": `grid-${i}` },
          "aria-label": `Stress ${i}`,
          onClick: () => {
            activations++;
          },
          style: {
            position: "absolute",
            left: 25 + (i % 10) * 55,
            top: 25 + Math.floor(i / 10) * 55,
          },
        },
        String(i),
      ),
    ),
  ),
);
const until = async (predicate: () => boolean) => {
  const deadline = performance.now() + 10000;
  while (!predicate()) {
    if (performance.now() > deadline) throw new Error("Lens initialization timed out");
    await new Promise(requestAnimationFrame);
  }
};
try {
  await until(() => controls.querySelectorAll("[data-material-filter]").length === 100);
  const buttons = [...controls.querySelectorAll("button")];
  const implementation = await createRenderer(canvas, background, buttons, {
    gpu: renderer === "gpu",
    dpr: devicePixelRatio,
  });
  await until(() => implementation.stats.submissions > 0);
  await implementation.settled();
  window.glassExperiment = {
    renderer,
    theme,
    dynamic,
    stats: implementation.stats,
    activations: () => activations,
    settled: implementation.settled,
    motion,
    dispose() {
      implementation.dispose();
      root.unmount();
    },
  };
  document.title = `Glass 100 — ${renderer}`;
} catch (error) {
  window.glassExperimentError = String(error);
  document.title = "Glass experiment failed";
  console.error(error);
}
