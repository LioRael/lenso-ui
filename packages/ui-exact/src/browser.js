const url = new URL("./web.css", import.meta.url);
const loaded = [...document.querySelectorAll('link[rel="stylesheet"]')].some((sheet) => {
  if (!sheet.href || !sheet.sheet || sheet.disabled || sheet.sheet.disabled) return false;
  if (sheet.media && !matchMedia(sheet.media).matches) return false;
  const href = new URL(sheet.href);
  return href.origin === url.origin && href.pathname === url.pathname;
});
// Keep the standalone hatch usable, while reusing CSS linked by the build helper.
if (!loaded) {
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = url.href;
  await new Promise((resolve, reject) => {
    sheet.onload = resolve;
    sheet.onerror = () => reject(new Error(`Unable to load Lenso Exact styles: ${sheet.href}`));
    document.head.append(sheet);
  });
}

export { element, elementEnded } from "./web.js";
