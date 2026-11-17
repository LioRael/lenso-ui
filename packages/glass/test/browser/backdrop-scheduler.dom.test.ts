import { expect, test } from "bun:test";
import { observeBackdrop } from "../../src/backdrop-scheduler.js";

// A visible sibling can consume a shared source edit while another copy is
// paused. The paused consumer must still receive that edit on re-entry.
test("paused backdrop consumers retain source edits consumed by a visible sibling", async () => {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 1;
  const source = document.createElement("div");
  const nodes = Array.from({ length: 4 }, () => document.createElement("div"));
  document.body.append(source, ...nodes);
  const changes: boolean[] = [];
  const subscribe = (index: number) =>
    observeBackdrop({
      source,
      element: nodes[index]!,
      layer: nodes[index + 1]!,
      prepare() {},
      read(change) {
        if (index === 0) changes.push(change.content);
        return () => {};
      },
    });
  const paused = subscribe(0),
    visible = subscribe(2);
  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
  try {
    await settle();
    paused.visible(false);
    source.textContent = "Updated while offscreen";
    // A following style-only mutation in the same batch cannot replace the structural edit.
    source.className = "updated";
    await settle();
    paused.visible(true);
    await settle();
    expect(changes.at(-1)).toBe(true);
    paused.visible(false);
    await settle();
    paused.visible(true);
    await settle();
    expect(changes.at(-1)).toBe(false);
  } finally {
    paused.stop();
    visible.stop();
    source.remove();
    nodes.forEach((node) => node.remove());
    globalThis.requestAnimationFrame = raf;
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});

// Optical outputs change every morph frame. Observing those derived resources
// must not recursively invalidate other lenses; real source edits still must.
test("optical resource updates do not invalidate backdrop consumers", async () => {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 1;
  const source = document.createElement("div");
  const element = document.createElement("div");
  const layer = document.createElement("div");
  document.body.append(source, element, layer);
  let reads = 0;
  const subscription = observeBackdrop({
    source,
    element,
    layer,
    prepare() {},
    read() {
      reads++;
      return () => {};
    },
  });
  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
  const resources = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  resources.setAttribute("data-lenso-glass-optics", "");
  const image = document.createElementNS(resources.namespaceURI, "feImage");
  resources.append(image);
  try {
    await settle();
    const initial = reads;
    document.body.append(resources);
    await settle();
    image.setAttribute("href", "data:image/png;base64,changed");
    await settle();
    expect(reads).toBe(initial);
    source.style.backgroundColor = "red";
    await settle();
    expect(reads).toBeGreaterThan(initial);
    const updated = reads;
    resources.remove();
    await settle();
    expect(reads).toBe(updated);
  } finally {
    subscription.stop();
    resources.remove();
    source.remove();
    element.remove();
    layer.remove();
    globalThis.requestAnimationFrame = raf;
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});

// Native paints and copied optics share a lens but register separately. Existing
// tests use distinct lens elements and cannot catch a skipped second owner.
test("press mutations update every owner of the lens without updating unrelated lenses", async () => {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 1;
  const source = document.createElement("div"),
    lens = document.createElement("button"),
    other = document.createElement("button");
  const layers = Array.from({ length: 3 }, () => document.createElement("div"));
  lens.style.marginLeft = "3px";
  document.body.append(source, lens, other, ...layers);
  const reads = [0, 0, 0],
    geometry = [false, false, false];
  const clients = layers.map((layer, index) =>
    observeBackdrop({
      source,
      element: index < 2 ? lens : other,
      layer,
      prepare() {},
      read(_change: unknown, _reads: unknown, moved: boolean) {
        reads[index]!++;
        geometry[index] = moved;
        return () => {};
      },
    }),
  );
  const settle = () => new Promise((resolve) => setTimeout(resolve, 15));
  try {
    await settle();
    reads.fill(0);
    geometry.fill(false);
    lens.style.setProperty("--lg-press-scale", ".8");
    await settle();
    expect(reads).toEqual([1, 1, 0]);
    expect(geometry).toEqual([true, true, false]);
    clients[1]!.visible(false);
    await settle();
    reads.fill(0);
    lens.style.setProperty("--lg-press-scale", ".9");
    await settle();
    expect(reads).toEqual([1, 0, 0]);
    clients[1]!.visible(true);
    await settle();
    expect(reads).toEqual([1, 1, 0]);
  } finally {
    clients.forEach((c) => c.stop());
    source.remove();
    lens.remove();
    other.remove();
    layers.forEach((e) => e.remove());
    globalThis.requestAnimationFrame = raf;
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});

// Character edits are sampled by the copies that read the batch. A paused
// consumer misses that sample, so it must re-copy instead of keeping old text.
test("a paused backdrop consumer re-copies after a text edit it missed", async () => {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 1;
  const source = document.createElement("div");
  const text = document.createTextNode("initial");
  source.append(text);
  const visibleElement = document.createElement("div"),
    pausedElement = document.createElement("div");
  const layers = [document.createElement("div"), document.createElement("div")];
  document.body.append(source, visibleElement, pausedElement, ...layers);
  const seen: { content: boolean; texts: number }[] = [];
  const visible = observeBackdrop({
    source,
    element: visibleElement,
    layer: layers[0],
    prepare() {},
    read() {
      return () => {};
    },
  });
  const paused = observeBackdrop({
    source,
    element: pausedElement,
    layer: layers[1],
    prepare() {},
    read(change) {
      seen.push({ content: change.content, texts: change.texts?.size ?? 0 });
      return () => {};
    },
  });
  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
  try {
    await settle();
    paused.visible(false);
    await settle();
    seen.length = 0;
    text.data = "edited";
    await settle();
    expect(seen.length).toBe(0);
    paused.visible(true);
    await settle();
    expect(seen.at(-1)?.content).toBe(true);
  } finally {
    visible.stop();
    paused.stop();
    source.remove();
    visibleElement.remove();
    pausedElement.remove();
    layers.forEach((layer) => layer.remove());
    globalThis.requestAnimationFrame = raf;
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});
