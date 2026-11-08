import { afterEach, expect, test } from "bun:test";
import { menuBackdrop } from "../src/lib/menu-backdrop/source.js";

afterEach(() => document.body.replaceChildren());
function scene() {
  const page = document.createElement("main");
  page.id = "nd-notebook-layout";
  page.innerHTML =
    '<section><button data-slot="menu-trigger" aria-controls="root-menu"></button></section>';
  document.body.append(page);
  const root = document.createElement("div");
  root.id = "root-menu";
  root.dataset["slot"] = "menu-popup";
  root.setAttribute("data-open", "");
  root.innerHTML =
    '<div data-slot="menu-content" style="opacity:1"></div><span data-material-lens></span>';
  document.body.append(root);
  return { page, example: page.querySelector("section")!, root };
}
function child(parent: HTMLElement, id: string) {
  const trigger = document.createElement("div");
  trigger.dataset["slot"] = "menu-submenu-trigger";
  trigger.setAttribute("aria-controls", id);
  parent.append(trigger);
  const popup = document.createElement("div");
  popup.id = id;
  popup.dataset["slot"] = "menu-popup";
  popup.setAttribute("data-open", "");
  popup.innerHTML =
    '<div data-slot="menu-content" style="opacity:1"></div><span data-material-lens></span>';
  document.body.append(popup);
  return popup;
}
// Nested portals are DOM siblings. Capture ownership must follow native trigger links.
test("the scene supplies the same complete source to its root, child and grandchild menus", () => {
  const { page, example, root } = scene();
  const nested = child(root, "child-menu"),
    deepest = child(nested, "grandchild-menu");
  for (const popup of [root, nested, deepest]) {
    const result = menuBackdrop(example, popup.querySelector("span")!);
    expect(result?.source === page).toBe(true);
    expect(result?.ready()).toBe(true);
    expect(result?.foreground === popup.querySelector("[data-slot=menu-content]")).toBe(true);
  }
});
test("unrelated, dangling and cyclic submenu links cannot claim another scene", async () => {
  const { example } = scene();
  const unrelated = document.createElement("div");
  const first = child(unrelated, "outside-menu"),
    second = child(first, "second-outside-menu");
  const options = menuBackdrop(example, first.querySelector("span")!)!;
  expect(options.ready()).toBe(false);
  expect(await options.prepare(new AbortController().signal, async () => true)).toBeUndefined();
  expect(menuBackdrop(example, second.querySelector("span")!)?.ready()).toBe(false);
  child(second, "outside-menu").remove();
  expect(menuBackdrop(example, first.querySelector("span")!)?.ready()).toBe(false);
});

test("submenu ownership follows portals within a shadow-root preview", () => {
  const { page, example, root } = scene();
  const host = document.createElement("div");
  document.body.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(page, root);
  const nested = child(root, "shadow-child");
  shadow.append(nested);
  expect(menuBackdrop(example, nested.querySelector("span")!)?.source === page).toBe(true);
  expect(menuBackdrop(example, nested.querySelector("span")!)?.ready()).toBe(true);
  const outside = child(nested, "document-child");
  expect(menuBackdrop(example, outside.querySelector("span")!)?.source === page).toBe(true);
  expect(menuBackdrop(example, outside.querySelector("span")!)?.ready()).toBe(true);
});

test("a native trigger link committed after the lens ref can become ready", () => {
  const { example, root } = scene();
  const trigger = example.querySelector("button")!;
  trigger.removeAttribute("aria-controls");
  root.setAttribute("data-open", "");
  root.querySelector<HTMLElement>('[data-slot="menu-content"]')!.style.opacity = "1";
  const options = menuBackdrop(example, root.querySelector("span")!)!;
  expect(options.ready()).toBe(false);
  trigger.setAttribute("aria-controls", root.id);
  expect(options.ready()).toBe(true);
});
