import { expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { NativeApiReference } from "../src/components/native-api-reference";
import reference from "../src/generated/api-reference.json";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// The large closed tables must not burden popup mounting, but native Find and no-JS docs must survive.
test("inherited API tables retain server content and Find text while mounting only when opened", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const example = <NativeApiReference family="menu" reference={reference} />;
  host.innerHTML = renderToStaticMarkup(example);
  const inherited = () =>
    host.querySelector<HTMLElement>('section[aria-labelledby="api-menu-inherited"]')!;
  expect(inherited().querySelectorAll("table").length).toBeGreaterThan(0);
  host.replaceChildren();
  const root = createRoot(host);
  try {
    await act(async () => root.render(example));
    const componentPart = host.querySelector("#api-menu-MenuTrigger")!.closest("details")!;
    expect(componentPart.querySelectorAll("table").length).toBe(0);
    expect(componentPart.textContent).toContain("disabled");
    await act(async () => {
      componentPart.open = true;
      componentPart.dispatchEvent(new Event("toggle"));
    });
    expect(componentPart.querySelectorAll("tbody tr").length).toBeGreaterThan(0);
    await act(async () => {
      componentPart.open = false;
      componentPart.dispatchEvent(new Event("toggle"));
    });
    expect(inherited().textContent).toContain("onAuxClickCapture");
    expect(inherited().querySelectorAll("table").length).toBe(0);
    const disclosure = inherited().querySelector<HTMLDetailsElement>("details")!;
    await act(async () => {
      disclosure.open = true;
      disclosure.dispatchEvent(new Event("toggle"));
    });
    expect(disclosure.querySelectorAll("tbody tr").length).toBeGreaterThan(100);
    expect(disclosure.querySelector("summary")?.id).toBe("api-menu-inherited-1");
    await act(async () => {
      disclosure.open = false;
      disclosure.dispatchEvent(new Event("toggle"));
    });
    expect(inherited().querySelectorAll("table").length).toBe(0);
    expect(inherited().textContent).toContain("onAuxClickCapture");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
