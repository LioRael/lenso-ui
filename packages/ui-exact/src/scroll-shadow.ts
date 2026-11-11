// Observed edge model adapted from Lenso's native HTML ScrollShadow.
interface Edges {
  before: boolean;
  after: boolean;
  overflow: boolean | undefined;
}
interface Owner {
  edges: Edges;
  update(data: DOMStringMap, refresh: (data: DOMStringMap) => void): void;
  end(): void;
}
const owners = new WeakMap<HTMLElement, Owner>();
const slot = '[data-slot="scroll-shadow"]';
function manual(data: DOMStringMap): Edges {
  const visibility = data["lensoVisibility"],
    vertical = data["orientation"] === "vertical";
  return {
    before: visibility === "both" || visibility === (vertical ? "top" : "left"),
    after: visibility === "both" || visibility === (vertical ? "bottom" : "right"),
    overflow: undefined,
  };
}
function metadata(edges: Edges): DOMStringMap {
  return {
    lensoScrollBefore: String(edges.before),
    lensoScrollAfter: String(edges.after),
    lensoScrollOverflow: edges.overflow === undefined ? "unknown" : String(edges.overflow),
  };
}
export function scrollShadowData(node: HTMLElement | SVGElement, data: DOMStringMap): DOMStringMap {
  if (!(node instanceof HTMLElement) || data["lensoKind"] !== "scroll-shadow") return data;
  const edges =
    data["lensoEnabled"] === "true" && data["lensoVisibility"] === "auto"
      ? (owners.get(node)?.edges ?? manual(data))
      : manual(data);
  return { ...data, ...metadata(edges) };
}
function connect(root: HTMLElement): Owner {
  let data: DOMStringMap = {},
    refresh: (data: DOMStringMap) => void = () => {},
    frame = 0,
    active = true,
    previous = "",
    configuration = "";
  const names = [
    "data-top-scroll",
    "data-bottom-scroll",
    "data-top-bottom-scroll",
    "data-left-scroll",
    "data-right-scroll",
    "data-left-right-scroll",
    "data-scroll-shadow-mode",
    "data-scroll-shadow-size",
  ];
  const original = new Map(names.map((name) => [name, root.getAttribute(name)]));
  const owner: Owner = { edges: { before: false, after: false, overflow: undefined }, update, end };
  const automatic = () => data["lensoEnabled"] === "true" && data["lensoVisibility"] === "auto";
  const present = (edges: Edges) => {
    owner.edges = edges;
    const vertical = data["orientation"] === "vertical";
    const attributes = new Map<string, string>([
      ["data-scroll-shadow-mode", automatic() ? "auto" : "manual"],
      ["data-scroll-shadow-size", data["lensoSize"] ?? "40"],
    ]);
    if (vertical) {
      if (!edges.after) attributes.set("data-top-scroll", String(edges.before));
      if (!edges.before) attributes.set("data-bottom-scroll", String(edges.after));
      if (edges.before && edges.after) attributes.set("data-top-bottom-scroll", "true");
    } else {
      if (!edges.after) attributes.set("data-left-scroll", String(edges.before));
      if (!edges.before) attributes.set("data-right-scroll", String(edges.after));
      if (edges.before && edges.after) attributes.set("data-left-right-scroll", "true");
    }
    for (const name of names) {
      const value = attributes.get(name);
      if (value === undefined) root.removeAttribute(name);
      else root.setAttribute(name, value);
    }
    refresh(metadata(edges));
  };
  const measure = () => {
    frame = 0;
    if (!active || !automatic()) return;
    const vertical = data["orientation"] === "vertical",
      start = vertical ? root.scrollTop : Math.abs(root.scrollLeft),
      length = vertical ? root.scrollHeight : root.scrollWidth,
      client = vertical ? root.clientHeight : root.clientWidth,
      offset = Number(data["lensoOffset"]);
    const edges = {
      before: start > offset,
      after: start + client + offset < length - 1,
      overflow: length > client,
    };
    const key = `${edges.before}:${edges.after}:${edges.overflow}`;
    if (key === previous) return;
    previous = key;
    present(edges);
    const input = Array.from(
      root.querySelectorAll<HTMLInputElement>('[data-slot="scroll-shadow-report"]'),
    ).find((input) => input.closest(slot) === root);
    if (input) {
      input.value =
        edges.before && edges.after
          ? "both"
          : edges.before
            ? vertical
              ? "top"
              : "left"
            : edges.after
              ? vertical
                ? "bottom"
                : "right"
              : "none";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };
  const schedule = () => {
    if (active && automatic() && !frame) frame = requestAnimationFrame(measure);
  };
  const resize = new ResizeObserver(schedule);
  const observe = () => {
    resize.disconnect();
    resize.observe(root);
    for (const child of root.children) resize.observe(child);
  };
  const mutations = new MutationObserver(() => {
    observe();
    schedule();
  });
  let observing = false;
  const start = () => {
    if (observing) return;
    observing = true;
    mutations.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "src"],
    });
    root.addEventListener("scroll", schedule, { passive: true });
    root.addEventListener("load", schedule, true);
    observe();
  };
  const stop = () => {
    observing = false;
    resize.disconnect();
    mutations.disconnect();
    root.removeEventListener("scroll", schedule);
    root.removeEventListener("load", schedule, true);
  };
  function update(next: DOMStringMap, callback: (data: DOMStringMap) => void) {
    data = next;
    refresh = callback;
    const key = [
      data["orientation"],
      data["lensoOffset"],
      data["lensoVisibility"],
      data["lensoEnabled"],
    ].join(":");
    if (key !== configuration) {
      configuration = key;
      previous = "";
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (automatic()) {
      start();
      schedule();
    } else {
      stop();
      present(manual(data));
    }
  }
  function end() {
    active = false;
    cancelAnimationFrame(frame);
    stop();
    for (const [name, value] of original) {
      if (value === null) root.removeAttribute(name);
      else root.setAttribute(name, value);
    }
  }
  return owner;
}
export function updateScrollShadow(
  node: HTMLElement | SVGElement,
  data: DOMStringMap,
  refresh: (data: DOMStringMap) => void,
) {
  if (!(node instanceof HTMLElement) || data["lensoKind"] !== "scroll-shadow") return;
  let owner = owners.get(node);
  if (!owner) {
    owner = connect(node);
    owners.set(node, owner);
  }
  owner.update(data, refresh);
}
export function endScrollShadow(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  owners.get(node)?.end();
  owners.delete(node);
}
