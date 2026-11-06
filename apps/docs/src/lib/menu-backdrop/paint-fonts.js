// A standalone SVG image needs its own copies of the document's web fonts.
const fontsByDocument = new WeakMap();

function fontData(document, url) {
  let fonts = fontsByDocument.get(document);
  if (!fonts) fontsByDocument.set(document, (fonts = new Map()));
  if (fonts.has(url.href)) return fonts.get(url.href);
  const loading = (async () => {
    if (url.origin !== document.location.origin) throw new Error("Unowned backdrop font");
    const response = await document.defaultView.fetch(url.href, {
      mode: "same-origin",
      credentials: "same-origin",
      cache: "force-cache",
    });
    if (!response.ok || new URL(response.url).origin !== url.origin) {
      throw new Error("Unavailable backdrop font");
    }
    const bytes = await response.blob();
    if (!bytes.size) throw new Error("Empty backdrop font");
    const extension = url.pathname.split(".").at(-1)?.toLowerCase();
    const type = { ttf: "font/ttf", otf: "font/otf", woff: "font/woff", woff2: "font/woff2" }[
      extension
    ];
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(type ? bytes.slice(0, bytes.size, type) : bytes);
    });
  })();
  fonts.set(url.href, loading);
  loading.catch(() => {
    if (fonts.get(url.href) === loading) fonts.delete(url.href);
  });
  return loading;
}

export async function fontFaceForImage(document, rule) {
  let css = rule.cssText;
  for (const match of rule.style
    .getPropertyValue("src")
    .matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]+))\s*\)/gi)) {
    const url = new URL(
      (match[1] ?? match[2] ?? match[3]).trim(),
      rule.parentStyleSheet?.href ?? document.baseURI,
    );
    if (url.protocol === "data:") continue;
    const data = await fontData(document, url);
    css = css.replace(match[0], () => 'url("' + data + '")');
  }
  return css;
}
