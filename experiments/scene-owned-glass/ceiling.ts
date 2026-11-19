import { mountCeilingScene } from "../../apps/docs/src/lib/glass-composition-scene.js";

const dispose = mountCeilingScene(document.querySelector<HTMLElement>("#app")!);
window.addEventListener("pagehide", dispose, { once: true });
if (import.meta.hot) import.meta.hot.dispose(dispose);
