import { expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { ThemeScope } from "@lenso/ui";
import { PhotosEditor } from "../src/components/photos-editor";
import { originalAdjustments } from "../src/lib/photos-adjustments";
import { library } from "../src/lib/photos-library";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

async function step(work: () => void) {
  await act(async () => {
    work();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

test("editor and its confirmation inherit live appearance changes without dropping the draft", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const root = createRoot(host);
  const button = (name: string) =>
    [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (el) => el.getAttribute("aria-label") === name || el.textContent?.trim() === name,
    )!;
  const render = (theme: "light" | "dark") =>
    root.render(
      <ThemeScope theme={theme}>
        <PhotosEditor
          photo={library[0]!}
          initial={originalAdjustments}
          onSave={() => {}}
          onClose={() => {}}
        />
      </ThemeScope>,
    );
  const appearance = (slot: string) =>
    document
      .querySelector(`[data-slot="${slot}"]`)
      ?.closest("[data-theme]")
      ?.getAttribute("data-theme");
  try {
    await step(() => render("light"));
    expect(appearance("modal-popup")).toBe("light");
    await step(() => button("Filters").click());
    await step(() => button("Vivid").click());
    await step(() => button("Cancel").click());
    expect(appearance("action-sheet-popup")).toBe("light");
    await step(() => render("dark"));
    expect(appearance("modal-popup")).toBe("dark");
    expect(appearance("action-sheet-popup")).toBe("dark");
    await step(() => render("light"));
    expect(appearance("action-sheet-popup")).toBe("light");
    await step(() =>
      document
        .querySelector('[data-slot="action-sheet-popup"]')!
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }),
        ),
    );
    expect(button("Vivid").getAttribute("aria-pressed")).toBe("true");
    expect(button("Done").disabled).toBe(false);
  } finally {
    await step(() => root.unmount());
    host.remove();
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});

test("unchanged edits cannot save and dirty cancellation preserves or discards the session explicitly", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const root = createRoot(host);
  let closed = 0;
  const button = (name: string) =>
    [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (el) => el.getAttribute("aria-label") === name || el.textContent?.trim() === name,
    )!;
  try {
    await step(() =>
      root.render(
        <PhotosEditor
          photo={library[0]!}
          initial={originalAdjustments}
          onSave={() => {
            throw new Error("unexpected save");
          }}
          onClose={() => {
            closed++;
          }}
        />,
      ),
    );
    expect(button("Done").disabled).toBe(true);
    await step(() => button("Cancel").click());
    expect(closed).toBe(1);
    closed = 0;
    await step(() => button("Filters").click());
    await step(() => button("Vivid").click());
    expect(button("Done").disabled).toBe(false);
    await step(() => button("Cancel").click());
    expect(document.querySelector('[data-slot="action-sheet-popup"]')).not.toBeNull();
    expect(
      document.querySelector('[data-slot="action-sheet-popup"]')!.querySelectorAll("button").length,
    ).toBe(1);
    expect(closed).toBe(0);
    await step(() =>
      document
        .querySelector('[data-slot="action-sheet-popup"]')!
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }),
        ),
    );
    expect(button("Vivid").getAttribute("aria-pressed")).toBe("true");
    await step(() => button("Undo edit").click());
    expect(button("Done").disabled).toBe(true);
    await step(() => button("Redo edit").click());
    expect(button("Done").disabled).toBe(false);
    await step(() => button("Cancel").click());
    await step(() => button("Discard changes").click());
    expect(closed).toBe(1);
  } finally {
    await step(() => root.unmount());
    host.remove();
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});
