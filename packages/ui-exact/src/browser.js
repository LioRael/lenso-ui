// Exact loads page modules after first paint. Resolve their styles before it calls a hatch.
const sheet = document.createElement("link");
sheet.rel = "stylesheet";
sheet.href = new URL("./web.css", import.meta.url).href;
await new Promise((resolve, reject) => {
  sheet.onload = resolve;
  sheet.onerror = () => reject(new Error(`Unable to load Lenso Exact styles: ${sheet.href}`));
  document.head.append(sheet);
});

export { element, elementEnded } from "./web.js";
