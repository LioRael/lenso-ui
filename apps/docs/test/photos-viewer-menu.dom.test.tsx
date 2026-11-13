import { expect, test } from "bun:test";
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { PhotosViewerMenu } from "../src/components/photos-viewer-menu";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

test("photo options uses the morphing menu contract and dispatches each selected action once", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const root = createRoot(host);
  let duplicated = 0;
  const calls: string[] = [];
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <PhotosViewerMenu
        open={open}
        onOpenChange={setOpen}
        onCopy={() => calls.push("copy")}
        onDuplicate={() => duplicated++}
        onHide={() => calls.push("hide")}
        onSlideshow={() => calls.push("slideshow")}
        onAlbum={(name) => calls.push(name)}
        onInformation={() => calls.push("information")}
      />
    );
  }
  async function step(work: () => void) {
    await act(async () => {
      work();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
  }
  const trigger = () => document.querySelector<HTMLButtonElement>('[aria-label="Photo options"]')!;
  try {
    await step(() => root.render(<Example />));
    await step(() => trigger().click());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector('[role="menu"] [data-lenso-slot="menu-glyph"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-lenso-slot="menu-action"]').length).toBe(3);
    const duplicate = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
      (node) => node.textContent === "Duplicate",
    )!;
    await step(() => duplicate.click());
    expect(duplicated).toBe(1);
    expect(calls).toEqual([]);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  } finally {
    await step(() => root.unmount());
    host.remove();
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});
