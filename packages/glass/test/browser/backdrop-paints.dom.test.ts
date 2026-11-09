import { expect, test } from "bun:test";
import { paintMaterialBackdrop } from "../../src/backdrop-paints.js";

test("floating material paints stay above content inside an isolated scroll container", () => {
  const surface = document.createElement("div");
  surface.style.backgroundColor = "white";
  const scroller = document.createElement("main");
  scroller.style.cssText =
    "background:transparent; background-image:none; overflow-x:auto; overflow-y:auto; isolation:isolate";
  const navigation = document.createElement("nav");
  navigation.style.cssText =
    "background:transparent; background-image:none; overflow-x:visible; overflow-y:visible; position:fixed; z-index:10";
  const material = document.createElement("span");
  navigation.append(material);
  scroller.append(navigation);
  surface.append(scroller);
  document.body.append(surface);
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  const replaceFonts = fonts?.configurable !== false;
  if (replaceFonts)
    Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const stop = paintMaterialBackdrop(material);
  try {
    const paint = surface.querySelector("[data-material-local-paints]")!;
    expect(paint.parentElement === navigation).toBe(true);
    expect(paint.nextElementSibling === material).toBe(true);
  } finally {
    stop();
    if (replaceFonts) {
      if (fonts) Object.defineProperty(document, "fonts", fonts);
      else Reflect.deleteProperty(document, "fonts");
    }
    surface.remove();
  }
});
