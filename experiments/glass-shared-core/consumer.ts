import React from "react";
import { createRoot } from "react-dom/client";
import { GlassButton } from "../../packages/ui/dist/components/glass-button/index.js";
import "../../packages/tokens/dist/styles.css";

const options = new URLSearchParams(location.search);
if (options.has("disable-wasm"))
  Object.defineProperty(globalThis, "WebAssembly", { configurable: true, value: undefined });
document.documentElement.dataset["theme"] = options.get("theme") ?? "light";
const main = document.createElement("main");
main.innerHTML = `<h1>Glass package integration</h1>
<p>Real GlassButton components, default renderer, shared animated DOM backdrop.</p>
<button id="toggle">Animate backdrop</button> <button id="loss">Lose GPU context</button>
<button id="mount">Unmount controls</button> <output id="status">Preparing…</output>
<div id="scene"><div id="background" data-lenso-backdrop="true"><div id="moving"></div></div><div id="controls"></div></div>`;
document.body.append(main);
const style = document.createElement("style");
style.textContent = `body{margin:24px;font:15px system-ui;background:#eee;color:#202124}button{cursor:pointer}#scene{position:relative;width:800px;height:600px;margin-top:24px}#background{position:absolute;inset:0;background:repeating-linear-gradient(37deg,#17365d 0px,#315f9f 80px,#a9c9ee 83px,#315f9f 90px,#17365d 160px);overflow:hidden}#moving{position:absolute;left:200px;top:0;width:110px;height:600px;background:#ffbe65}#status{display:block;margin-top:12px}#controls>button{position:absolute;width:120px;height:68px;border-radius:24px}`;
document.head.append(style);
if (options.get("content") === "canvas") {
  const source = document.createElement("canvas");
  source.width = 800;
  source.height = 600;
  source.style.cssText = "position:absolute;inset:0";
  const pixels = source.getContext("2d")!;
  pixels.fillStyle = "#ef8058";
  pixels.fillRect(70, 70, 630, 450);
  pixels.fillStyle = "white";
  pixels.font = "48px system-ui";
  pixels.fillText("Native canvas backdrop", 100, 260);
  document.querySelector("#background")!.append(source);
}
const material =
  options.get("profile") === "medium"
    ? { "--apple-material-profile": "medium", "--lg-blur": "8px" }
    : {};
const root = createRoot(document.querySelector("#controls")!);
let revealed = options.get("hidden") !== "1";
let mounted = true,
  activations = 0;
function render() {
  root.render(
    mounted
      ? React.createElement(
          React.Fragment,
          null,
          ...Array.from({ length: 16 }, (_, i) =>
            React.createElement(
              GlassButton,
              {
                key: i,
                style: {
                  position: "absolute",
                  ...material,
                  opacity: revealed || i !== 0 ? 1 : 0,
                  left: 100 + (i % 4) * 144,
                  top: 100 + Math.floor(i / 4) * 96,
                  width: 120,
                  height: 68,
                  borderRadius: 24,
                },
                onClick: () => {
                  activations++;
                },
                "aria-label": `Glass ${i + 1}`,
              },
              `${i + 1}`,
            ),
          ),
        )
      : null,
  );
}
render();
if (!revealed) {
  const reveal = document.createElement("button");
  reveal.textContent = "Reveal first control";
  main.insertBefore(reveal, document.querySelector("#scene"));
  reveal.onclick = () => {
    revealed = true;
    render();
    reveal.remove();
  };
}
const moving = document.querySelector<HTMLElement>("#moving")!;
const motion = moving.animate(
  { transform: ["translateX(-100px)", "translateX(300px)", "translateX(-100px)"] },
  { duration: 3000, iterations: Infinity },
);
motion.pause();
document.querySelector<HTMLButtonElement>("#toggle")!.onclick = (event) => {
  const playing = motion.playState === "running";
  if (playing) motion.pause();
  else motion.play();
  (event.currentTarget as HTMLButtonElement).textContent = playing
    ? "Animate backdrop"
    : "Pause backdrop";
};
document.querySelector<HTMLButtonElement>("#mount")!.onclick = (event) => {
  mounted = !mounted;
  render();
  (event.currentTarget as HTMLButtonElement).textContent = mounted
    ? "Unmount controls"
    : "Remount controls";
};
// Capture the private context only in this fixture, to exercise actual browser context loss.
const glCanvases: HTMLCanvasElement[] = [];
const getContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  ...args: [string, unknown?]
) {
  const result: RenderingContext | GPUCanvasContext | null = Reflect.apply(getContext, this, args);
  if (args[0] === "webgl2" && !glCanvases.includes(this)) glCanvases.push(this);
  return result;
} as typeof getContext;
document.querySelector<HTMLButtonElement>("#loss")!.onclick = () => {
  for (const canvas of glCanvases)
    canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
};
let previous = performance.now();
const intervals: number[] = [];
function tick(time: number) {
  intervals.push(time - previous);
  previous = time;
  if (intervals.length > 180) intervals.shift();
  const sorted = [...intervals].sort((a, b) => a - b);
  const count = document.querySelectorAll('[data-glass-renderer="shared-core"]').length;
  document.querySelector("#status")!.textContent =
    `Shared core: ${count}/16; activations: ${activations}; copied: ${document.querySelectorAll("#controls [data-copy]").length}; frame p95: ${sorted[Math.floor(sorted.length * 0.95)]?.toFixed(1)} ms`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
