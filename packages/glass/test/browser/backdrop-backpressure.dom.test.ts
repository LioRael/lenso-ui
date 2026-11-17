import { expect, test } from "bun:test";
import { copyBackdrop } from "../../src/backdrop.js";
import { BackdropReads } from "../../src/backdrop-scheduler.js";

// A dynamic backdrop re-clones its source and decodes every image on each content
// edit. These regressions bound the in-flight work and keep text edits local to
// the changed nodes instead of the whole copied tree.

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

interface Counters {
  clone: number;
  trees: number;
  computed: number;
  properties: number;
}

function countDomWork(root?: Node): { counts: Counters; restore(): void } {
  const counts: Counters = { clone: 0, trees: 0, computed: 0, properties: 0 };
  const clone = Node.prototype.cloneNode;
  const computed = globalThis.getComputedStyle;
  const declaration = Object.getPrototypeOf(
    document.createElement("div").style,
  ) as CSSStyleDeclaration;
  const setProperty = declaration.setProperty;
  Node.prototype.cloneNode = function (this: Node, deep?: boolean) {
    counts.clone++;
    // Happy DOM re-enters cloneNode for every descendant; count root copies too.
    if (deep && this === root) counts.trees++;
    return clone.call(this, deep);
  };
  globalThis.getComputedStyle = ((element: Element, pseudo?: string | null) => {
    counts.computed++;
    return computed.call(globalThis, element, pseudo!);
  }) as typeof globalThis.getComputedStyle;
  declaration.setProperty = function (
    this: CSSStyleDeclaration,
    name: string,
    value: string | null,
    priority?: string,
  ) {
    counts.properties++;
    return setProperty.call(this, name, value, priority);
  };
  return {
    counts,
    restore() {
      Node.prototype.cloneNode = clone;
      globalThis.getComputedStyle = computed;
      declaration.setProperty = setProperty;
    },
  };
}

function decodeBacklog(): {
  started: number;
  pending: (() => void)[];
  restore(): void;
} {
  const decode = HTMLImageElement.prototype.decode;
  const backlog = {
    started: 0,
    pending: [] as (() => void)[],
    restore() {
      HTMLImageElement.prototype.decode = decode;
    },
  };
  HTMLImageElement.prototype.decode = () =>
    new Promise<void>((resolve) => {
      backlog.started++;
      backlog.pending.push(resolve);
    });
  return backlog;
}

function schedulerEnvironment(): { restore(): void } {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  const raf = globalThis.requestAnimationFrame;
  const cancel = globalThis.cancelAnimationFrame;
  const values = BackdropReads.prototype.values;
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  // Keep the shared animation tick out of these copy-lifecycle assertions.
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  // Happy DOM's CSSStyleDeclaration is not iterable. Enumerate its own names so
  // the real inline/copy path runs instead of stubbing the reads away.
  BackdropReads.prototype.values = function (this: BackdropReads, element, names) {
    if (!names) {
      const computed = this.style(element);
      names = Array.from({ length: computed.length }, (_, index) => computed.item(index)).filter(
        (name) => name !== "",
      );
    }
    return values.call(this, element, names);
  };
  return {
    restore() {
      BackdropReads.prototype.values = values;
      globalThis.requestAnimationFrame = raf;
      globalThis.cancelAnimationFrame = cancel;
      if (fonts) Object.defineProperty(document, "fonts", fonts);
      else Reflect.deleteProperty(document, "fonts");
    },
  };
}

function place(element: HTMLElement, box: DOMRect, width: number, height: number): void {
  element.getBoundingClientRect = () => box;
  Object.defineProperties(element, {
    offsetWidth: { configurable: true, value: width },
    offsetHeight: { configurable: true, value: height },
  });
}

interface Mounted {
  lens: HTMLElement;
  layer: HTMLElement;
  frame: HTMLElement;
  stop(): void;
}

async function mount(source: HTMLElement): Promise<Mounted> {
  const lens = document.createElement("div");
  lens.style.cssText = "--lg-blur:3px;border-radius:12px;opacity:1;visibility:visible";
  place(source, new DOMRect(0, 0, 300, 300), 300, 300);
  place(lens, new DOMRect(20, 20, 72, 48), 72, 48);
  document.body.append(source, lens);
  const stop = copyBackdrop(lens, source);
  await settle();
  const layer = lens.previousElementSibling as HTMLElement;
  return { lens, layer, frame: layer.firstElementChild as HTMLElement, stop };
}

function rowTree(rows: number) {
  const source = document.createElement("div");
  const texts: Text[] = [];
  for (let index = 0; index < rows; index++) {
    const row = document.createElement("div");
    const span = document.createElement("span");
    const text = document.createTextNode(`row ${index}`);
    span.append(text);
    row.append(span);
    source.append(row);
    texts.push(text);
  }
  return { source, texts };
}

test("content edits during decoding keep one candidate and install the latest content", async () => {
  const environment = schedulerEnvironment();
  const backlog = decodeBacklog();
  let stop: (() => void) | undefined;
  const source = document.createElement("div");
  const work = countDomWork(source);
  const row = document.createElement("div");
  const text = document.createTextNode("v0");
  row.append(text);
  const image = document.createElement("img");
  source.append(row, image);
  try {
    const mounted = await mount(source);
    stop = mounted.stop;
    expect(mounted.lens.hasAttribute("data-copy")).toBe(true);
    expect(backlog.started).toBe(0);
    const mountedCopies = work.counts.trees;

    for (let index = 1; index <= 20; index++) {
      row.replaceChildren(document.createTextNode(`v${index}`));
      await settle();
      expect(backlog.pending.length).toBeLessThanOrEqual(1);
    }
    // One in-flight candidate and one coalesced rebuild for the whole burst.
    expect(work.counts.trees - mountedCopies).toBeLessThanOrEqual(2);
    expect(backlog.started).toBeLessThanOrEqual(1);
    expect(backlog.pending.length).toBe(1);

    for (const resolve of backlog.pending.splice(0)) resolve();
    await settle();
    for (const resolve of backlog.pending.splice(0)) resolve();
    await settle();
    expect(backlog.started).toBeLessThanOrEqual(2);
    expect(work.counts.trees - mountedCopies).toBeLessThanOrEqual(2);
    expect(mounted.frame.textContent).toContain("v20");
    expect(mounted.frame.textContent).not.toContain("v19");
  } finally {
    stop?.();
    source.remove();
    work.restore();
    backlog.restore();
    environment.restore();
  }
});

test("a superseded decoding candidate is never presented", async () => {
  const environment = schedulerEnvironment();
  const backlog = decodeBacklog();
  let stop: (() => void) | undefined;
  const source = document.createElement("div");
  const row = document.createElement("div");
  const text = document.createTextNode("v0");
  row.append(text);
  source.append(row, document.createElement("img"));
  try {
    const mounted = await mount(source);
    stop = mounted.stop;
    row.replaceChildren(document.createTextNode("A"));
    await settle();
    expect(backlog.started).toBe(1);
    row.replaceChildren(document.createTextNode("B"));
    await settle();
    // A newer edit must not queue a second candidate behind the pending decode.
    expect(backlog.started).toBe(1);

    for (const resolve of backlog.pending.splice(0)) resolve();
    await settle();
    // The resolved candidate predates B, so it must be discarded, not presented.
    expect(mounted.frame.textContent).not.toContain("A");
    for (const resolve of backlog.pending.splice(0)) resolve();
    await settle();
    expect(mounted.frame.textContent).toContain("B");
    expect(mounted.frame.textContent).not.toContain("A");
  } finally {
    stop?.();
    source.remove();
    backlog.restore();
    environment.restore();
  }
});

test("removing the last image while decoding installs the latest structure immediately", async () => {
  const environment = schedulerEnvironment();
  const backlog = decodeBacklog();
  let stop: (() => void) | undefined;
  const source = document.createElement("div");
  const work = countDomWork(source);
  const row = document.createElement("div");
  const text = document.createTextNode("v0");
  row.append(text);
  const label = document.createElement("span");
  label.textContent = "A";
  const image = document.createElement("img");
  source.append(row, label, image);
  try {
    const mounted = await mount(source);
    stop = mounted.stop;
    // A structural edit starts decoding a copy that still contains the image.
    row.replaceChildren(document.createTextNode("v1"));
    await settle();
    expect(backlog.started).toBe(1);
    expect(backlog.pending.length).toBe(1);
    const copies = work.counts.trees;

    // The newest source has no image left, so it needs no decode at all. It must
    // land now instead of waiting for the superseded candidate's decode.
    image.remove();
    label.textContent = "B";
    label.style.setProperty("color", "rgb(90, 65, 20)", "important");
    await settle();
    expect(work.counts.trees - copies).toBe(1);
    expect(backlog.started).toBe(1);
    expect(mounted.frame.querySelector("img")).toBeNull();
    expect(mounted.frame.textContent).toContain("B");
    expect(mounted.frame.textContent).not.toContain("v0");
    expect((mounted.frame.querySelector("span") as HTMLElement).style.color).toBe(
      "rgb(90, 65, 20)",
    );

    // Releasing the obsolete decode must not restore the older image or text.
    for (const resolve of backlog.pending.splice(0)) resolve();
    await settle();
    await settle();
    expect(backlog.started).toBe(1);
    expect(work.counts.trees - copies).toBe(1);
    expect(mounted.frame.querySelector("img")).toBeNull();
    expect(mounted.frame.textContent).toContain("B");
  } finally {
    stop?.();
    source.remove();
    work.restore();
    backlog.restore();
    environment.restore();
  }
});

test("stopping during decoding derives no further copies or decodes", async () => {
  const environment = schedulerEnvironment();
  const backlog = decodeBacklog();
  let stop: (() => void) | undefined;
  const source = document.createElement("div");
  const work = countDomWork(source);
  const row = document.createElement("div");
  const text = document.createTextNode("v0");
  row.append(text);
  source.append(row, document.createElement("img"));
  try {
    const mounted = await mount(source);
    stop = mounted.stop;
    row.replaceChildren(document.createTextNode("A"));
    await settle();
    expect(backlog.started).toBe(1);

    const copies = work.counts.trees;
    const decodes = backlog.started;
    mounted.stop();
    stop = undefined;
    expect(document.body.contains(mounted.layer)).toBe(false);
    expect(mounted.lens.hasAttribute("data-copy")).toBe(false);

    row.replaceChildren(document.createTextNode("B"));
    await settle();
    for (const resolve of backlog.pending.splice(0)) resolve();
    await settle();
    await settle();
    expect(work.counts.trees).toBe(copies);
    expect(backlog.started).toBe(decodes);
    expect(document.body.contains(mounted.layer)).toBe(false);
    expect(mounted.lens.hasAttribute("data-copy")).toBe(false);
  } finally {
    stop?.();
    source.remove();
    work.restore();
    backlog.restore();
    environment.restore();
  }
});

test("a single text edit does not scale copy work with the tree size", async () => {
  const environment = schedulerEnvironment();
  const work = countDomWork();

  async function measure(rows: number) {
    const { source, texts } = rowTree(rows);
    let stop: (() => void) | undefined;
    try {
      const mounted = await mount(source);
      stop = mounted.stop;
      expect(mounted.lens.hasAttribute("data-copy")).toBe(true);
      work.counts.clone = work.counts.computed = work.counts.properties = 0;
      texts[0]!.data = "row 0 edited";
      await settle();
      return {
        counts: { ...work.counts },
        rows: [...mounted.frame.querySelectorAll("span")].map((span) => span.textContent ?? ""),
      };
    } finally {
      stop?.();
      source.remove();
    }
  }

  try {
    const small = await measure(100);
    const large = await measure(1000);
    // Text edits synchronize mapped text nodes instead of re-cloning the tree.
    expect(small.counts.clone).toBe(0);
    expect(large.counts.clone).toBe(0);
    expect(small.counts.computed).toBeLessThan(32);
    expect(large.counts.computed).toBeLessThan(32);
    expect(large.counts.computed).toBeLessThanOrEqual(small.counts.computed + 8);
    expect(large.counts.properties).toBeLessThanOrEqual(small.counts.properties + 8);
    expect(small.rows.length).toBe(100);
    expect(large.rows.length).toBe(1000);
    expect(small.rows[0]).toBe("row 0 edited");
    expect(large.rows[0]).toBe("row 0 edited");
    expect(small.rows[99]).toBe("row 99");
    expect(large.rows[999]).toBe("row 999");
  } finally {
    work.restore();
    environment.restore();
  }
});

test("images-free content and style updates install without decoding", async () => {
  const environment = schedulerEnvironment();
  const backlog = decodeBacklog();
  const work = countDomWork();
  let stop: (() => void) | undefined;
  const source = document.createElement("div");
  const row = document.createElement("div");
  const text = document.createTextNode("v0");
  row.append(text);
  source.append(row);
  let ready = 0;
  try {
    place(source, new DOMRect(0, 0, 300, 300), 300, 300);
    const lens = document.createElement("div");
    lens.style.cssText = "--lg-blur:3px;border-radius:12px;opacity:1;visibility:visible";
    place(lens, new DOMRect(20, 20, 72, 48), 72, 48);
    document.body.append(source, lens);
    stop = copyBackdrop(lens, source, false, () => ready++);
    await settle();
    const layer = lens.previousElementSibling as HTMLElement;
    const frame = layer.firstElementChild as HTMLElement;
    expect(lens.hasAttribute("data-copy")).toBe(true);
    expect(ready).toBe(1);
    expect(frame.textContent).toContain("v0");

    row.replaceChildren(document.createTextNode("v1"));
    await settle();
    expect(frame.textContent).toContain("v1");
    expect(backlog.started).toBe(0);

    const copies = work.counts.clone;
    source.style.backgroundColor = "rgb(255, 0, 0)";
    await settle();
    const root = frame.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toBe("rgb(255, 0, 0)");
    // Style updates inline the existing copy instead of deriving a new one.
    expect(work.counts.clone).toBe(copies);
    expect(backlog.started).toBe(0);
  } finally {
    stop?.();
    source.remove();
    work.restore();
    backlog.restore();
    environment.restore();
  }
});

test("shared sources keep both consumers styled from one batch", async () => {
  const environment = schedulerEnvironment();
  const source = document.createElement("div");
  const row = document.createElement("div");
  const text = document.createTextNode("v0");
  row.append(text);
  source.append(row);
  const lenses: HTMLElement[] = [];
  let stop: (() => void) | undefined;
  try {
    place(source, new DOMRect(0, 0, 300, 300), 300, 300);
    for (const left of [20, 120]) {
      const lens = document.createElement("div");
      lens.style.cssText = "--lg-blur:3px;border-radius:12px;opacity:1;visibility:visible";
      place(lens, new DOMRect(left, 20, 72, 48), 72, 48);
      lenses.push(lens);
    }
    document.body.append(source, ...lenses);
    stop = copyBackdrop(lenses[0]!, source);
    const second = copyBackdrop(lenses[1]!, source);
    await settle();
    const frames = lenses.map(
      (lens) => (lens.previousElementSibling as HTMLElement).firstElementChild as HTMLElement,
    );
    expect(frames.map((frame) => frame.textContent)).toEqual(["v0", "v0"]);
    row.replaceChildren(document.createTextNode("v1"));
    source.style.backgroundColor = "rgb(255, 0, 0)";
    await settle();
    for (const frame of frames) {
      expect(frame.textContent).toContain("v1");
      expect((frame.firstElementChild as HTMLElement).style.backgroundColor).toBe("rgb(255, 0, 0)");
    }
    const [first, other] = frames.map((frame) => frame.firstElementChild as HTMLElement);
    expect(first!.getAttribute("style")).toBe(other!.getAttribute("style"));
    (row.firstChild as Text).data = "v2";
    await settle();
    for (const frame of frames) expect(frame.textContent).toContain("v2");
    stop?.();
    second();
    stop = undefined;
  } finally {
    stop?.();
    source.remove();
    lenses.forEach((lens) => lens.remove());
    environment.restore();
  }
});
