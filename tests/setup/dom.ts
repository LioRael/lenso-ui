import "./stylex.js";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "http://localhost:3000" });

// Happy DOM does not model browser animation timelines.
const dom = globalThis as typeof globalThis & {
  document: { getAnimations(): unknown[] };
  HTMLElement: { prototype: { getAnimations(): unknown[] } };
};
dom.document.getAnimations = () => [];
dom.HTMLElement.prototype.getAnimations = () => [];
