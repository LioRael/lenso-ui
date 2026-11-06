// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: StyleX copy layers, bounded Apple input and shared observation/reads.
import * as stylex from "@stylexjs/stylex";
import { glassStyles } from "@lenso/tokens/glass";
import { BackdropReads, observeBackdrop } from "./backdrop-scheduler.js";
import type { SharedBackdropRegistration } from "./gpu-backdrop.js";

const MARK = "data-lenso-backdrop";

const copyVisibility = new Map<HTMLElement, (active: boolean) => void>();
let visibilityObserver: IntersectionObserver | undefined;
export function watchCopy(element: HTMLElement, update: (active: boolean) => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    update(true);
    return () => undefined;
  }
  visibilityObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        copyVisibility.get(entry.target as HTMLElement)?.(entry.isIntersecting);
    },
    { rootMargin: "128px" },
  );
  copyVisibility.set(element, update);
  visibilityObserver.observe(element);
  return () => {
    visibilityObserver?.unobserve(element);
    copyVisibility.delete(element);
    if (!copyVisibility.size) {
      visibilityObserver?.disconnect();
      visibilityObserver = undefined;
    }
  };
}

// The part of an element that can be seen, cut down by every ancestor that
// clips its overflow (a large image inside a small scroller shows only the scroller).
function visibleBox(element: HTMLElement): DOMRect {
  let { left, top, right, bottom } = element.getBoundingClientRect();
  for (
    let node = element.parentElement;
    node && node !== document.body;
    node = node.parentElement
  ) {
    const style = getComputedStyle(node);
    if (!/hidden|clip|auto|scroll/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`))
      continue;
    const clip = node.getBoundingClientRect();
    left = Math.max(left, clip.left);
    top = Math.max(top, clip.top);
    right = Math.min(right, clip.right);
    bottom = Math.min(bottom, clip.bottom);
  }
  return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

/** The marked content behind the glass: the closest one whose visible part it overlaps. */
export function findBackdrop(
  element: HTMLElement,
  from = element.parentElement,
): HTMLElement | null {
  const box = element.getBoundingClientRect();
  const behind = (candidate: HTMLElement) => {
    if (candidate.contains(element) || element.contains(candidate)) return false;
    const other = visibleBox(candidate);
    return (
      other.left < box.right &&
      other.right > box.left &&
      other.top < box.bottom &&
      other.bottom > box.top
    );
  };
  for (let node = from; node && node !== document.body; node = node.parentElement) {
    // Live page surfaces cannot be reconstructed by copying their translucent paint.
    if (node.getAttribute(MARK) === "live") return null;
    const found = [...node.querySelectorAll<HTMLElement>(`[${MARK}]`)].find(
      (candidate) => candidate.getAttribute(MARK) !== "live" && behind(candidate),
    );
    if (found) return found;
  }
  return null;
}

// A copy never animates on its own (it follows the original instead), and its
// root is placed by the layer rather than where the original sits.
const STILL = /^(transition|animation|view-transition)/;
const PLACED: Record<string, string> = {
  position: "absolute",
  top: "0px",
  left: "0px",
  right: "auto",
  bottom: "auto",
  "margin-top": "0px",
  "margin-right": "0px",
  "margin-bottom": "0px",
  "margin-left": "0px",
  transform: "none",
  translate: "none",
  scale: "none",
  rotate: "none",
};

interface Copy {
  root: HTMLElement;
  /** Each element of the original, with its copy. */
  pairs: Map<Element, HTMLElement>;
}

// Writes an element's computed style onto its copy: every property, or only
// the named ones.
function inline(
  original: Element,
  copy: HTMLElement,
  root: boolean,
  reads: BackdropReads,
  names?: Iterable<string>,
): () => void {
  const values = reads.values(original, names);
  const selected = names ? new Set(names) : undefined;
  const size = root ? reads.size(original as HTMLElement) : undefined;
  return () => {
    for (const [name, value] of values) {
      if (selected && !selected.has(name)) continue;
      if (STILL.test(name) || (root && (name in PLACED || name === "width" || name === "height")))
        continue;
      if (copy.style.getPropertyValue(name) !== value) copy.style.setProperty(name, value);
    }
    if (!size) return;
    for (const [name, value] of Object.entries(PLACED))
      if (copy.style.getPropertyValue(name) !== value) copy.style.setProperty(name, value);
    if (copy.style.width !== `${size.width}px`) copy.style.width = `${size.width}px`;
    if (copy.style.height !== `${size.height}px`) copy.style.height = `${size.height}px`;
  };
}

// A deep copy that renders like the original wherever it's placed: each
// element carries its computed style inline, minus anything that would animate
// it or tie it to the original.
function copyOf(source: HTMLElement, reads: BackdropReads): Copy {
  const root = source.cloneNode(true) as HTMLElement;
  const originals = [source, ...source.querySelectorAll("*")];
  const copies = [root, ...root.querySelectorAll<HTMLElement>("*")];
  const pairs = new Map<Element, HTMLElement>();
  originals.forEach((original, index) => {
    const copy = copies[index];
    if (!copy) return;
    pairs.set(original, copy);
    copy.removeAttribute("id");
    // Detached, a lazy image would never load.
    if (copy instanceof HTMLImageElement) copy.loading = "eager";
    copy.style.transition = copy.style.animation = "none";
    copy.style.setProperty("view-transition-name", "none");
    inline(original, copy, original === source, reads)();
  });
  root.removeAttribute(MARK);
  return { root, pairs };
}

// Where the live backdrop can't be filtered, a copy of the marked content is
// filtered instead, in a layer laid just behind the glass and matched to its
// box. The glass then paints its tint, rim and shadows over it, as it would
// over the live backdrop.
export function copyBackdrop(
  element: HTMLElement,
  source: HTMLElement,
  clipMask = false,
  onReady?: () => void,
  fadeIn = 0,
): () => void {
  const layer = document.createElement("div");
  const frame = document.createElement("div");
  frame.className = stylex.props(glassStyles.copyFrame).className ?? "";
  layer.setAttribute("aria-hidden", "true");
  layer.setAttribute("inert", "");
  const apple = getComputedStyle(element).getPropertyValue("--lg-material").trim() === "apple";
  const viewport = apple ? document.createElement("div") : undefined;
  const optics = viewport ? document.createElement("div") : layer;
  layer.className =
    stylex.props(viewport ? glassStyles.copyOutput : glassStyles.copyLayer).className ?? "";
  if (viewport) {
    // Composite the finished pixels, outside the SVG filter. Promoting an input
    // or the filtered element itself drops prominent faces in system Safari.
    optics.className = stylex.props(glassStyles.copyLayer, glassStyles.copySurface).className ?? "";
    viewport.className = stylex.props(glassStyles.copyViewport).className ?? "";
    viewport.append(frame);
    optics.append(viewport);
    layer.append(optics);
  } else layer.append(frame);
  element.before(layer);
  element.setAttribute("data-copy", "");

  let styled = "";
  let notified = false;
  let fusionHidden = false;
  let fade: ReturnType<typeof setTimeout> | undefined;
  let placed = "";
  let shift = { x: 0, y: 0 };
  let active = true;
  let copy: Copy | undefined;
  let ready: Copy | undefined;
  let stale = false;
  let stopped = false;
  let version = 0;
  let shared: SharedBackdropRegistration | undefined;
  let nativeStylesStale = false;

  const subscription = observeBackdrop({
    element,
    source,
    layer,
    prepare() {
      if (layer.style.display) layer.style.display = "";
    },
    read(change, reads, geometry) {
      if (!geometry && !change.content && !change.styles) {
        const updateSource = shared?.updateSource(change, reads);
        if (updateSource) {
          nativeStylesStale = true;
          return updateSource;
        }
      }
      const style = reads.style(element);
      if (style.getPropertyValue("--lenso-fusion-opacity").trim() === "0")
        return () => {
          clearTimeout(fade);
          fusionHidden = true;
          styled = "";
          layer.style.transition = "none";
          layer.style.opacity = "0";
        };
      const blur = style.getPropertyValue("--lg-blur").trim() || "3px";
      const filter =
        style.getPropertyValue("--lenso-fusion-filter").trim() ||
        style.getPropertyValue("--lg-filter").trim() ||
        "saturate(1.5)";
      const presentation = [
        `blur(${blur}) ${filter}`,
        style.borderRadius,
        String(
          Number(style.opacity) *
            Number(style.getPropertyValue("--lenso-glass-face-opacity").trim() || 1) *
            Number(style.getPropertyValue("--lenso-fusion-opacity").trim() || 1),
        ),
        style.visibility,
        style.zIndex,
        clipMask ? style.maskImage : "none",
        clipMask ? style.clipPath : "none",
      ];
      const material = style.getPropertyValue("--lg-material").trim() === "apple";
      const { width, height } = reads.size(element);
      const sourceSize = reads.size(source);
      if (!width || !height || !sourceSize.width || !sourceSize.height)
        return () => {
          layer.style.display = "none";
        };
      const box = reads.box(element);
      const from = reads.box(source);
      const at = reads.box(layer);
      const sx = box.width / width;
      const sy = box.height / height;
      // The output is a sibling of the lens, so its containing block may
      // already carry the menu morph. Convert viewport distances to that
      // block once; applying the total lens scale again shrinks the copy twice.
      const parent = layer.offsetParent as HTMLElement | null;
      const parentBox = parent ? reads.box(parent) : null;
      const parentSize = parent ? reads.size(parent) : null;
      const parentScaleX = parentBox && parentSize?.width ? parentBox.width / parentSize.width : 1;
      const parentScaleY =
        parentBox && parentSize?.height ? parentBox.height / parentSize.height : 1;
      const x = (box.left - at.left) / (parentScaleX || 1) + shift.x;
      const y = (box.top - at.top) / (parentScaleY || 1) + shift.y;
      const margin = viewport
        ? Math.ceil(
            (parseFloat(
              style.getPropertyValue("--lenso-fusion-source-reach") ||
                style.getPropertyValue("--lg-source-reach"),
            ) || 0) +
              (parseFloat(blur) || 3) * 3 +
              1,
          )
        : 0;
      const transform = `translate(${x}px, ${y}px) scale(${sx / (parentScaleX || 1)}, ${sy / (parentScaleY || 1)})`;
      const inputTransform = `translate(${(from.left - box.left) / sx + margin}px, ${(from.top - box.top) / sy + margin}px) scale(${from.width / sourceSize.width / sx}, ${from.height / sourceSize.height / sy})`;
      const position = [width, height, margin, transform, inputTransform].join("|");
      const updateShared = shared?.read(change, reads, margin);
      const updates: (() => void)[] = [];
      if (!updateShared || updateShared.native) {
        if (ready) {
          copy = ready;
          ready = undefined;
        }
        const install = copy && !copy.root.isConnected;
        if (!copy) copy = copyOf(source, reads);
        else if (change.content || stale) {
          stale = false;
          const next = copyOf(source, reads);
          const id = ++version;
          const images = [...next.root.querySelectorAll("img")];
          if (next.root instanceof HTMLImageElement) images.push(next.root);
          void Promise.all(images.map((image) => image.decode().catch(() => undefined))).then(
            () => {
              if (stopped || id !== version) return;
              ready = next;
              subscription.invalidate();
            },
          );
        }
        if (change.styles || install || nativeStylesStale) {
          nativeStylesStale = false;
          for (const [original, target] of copy.pairs)
            updates.push(inline(original, target, original === source, reads));
        } else {
          for (const [original, names] of change.animated) {
            const target = copy.pairs.get(original);
            if (target) updates.push(inline(original, target, original === source, reads, names));
          }
        }
      } else {
        nativeStylesStale = true;
        if (change.content) stale = true;
      }
      const currentCopy = copy;
      return () => {
        if (!active || stopped) return;
        if (currentCopy && currentCopy.root.parentElement !== frame)
          frame.replaceChildren(currentCopy.root);
        for (const update of updates) update();
        if (fusionHidden) {
          fusionHidden = false;
          layer.style.transition = fadeIn ? `opacity ${fadeIn}ms linear` : "";
          if (fadeIn)
            fade = setTimeout(() => {
              if (!stopped) layer.style.transition = "";
            }, fadeIn);
        }
        if (presentation.join("|") !== styled) {
          styled = presentation.join("|");
          if (material) optics.style.overflow = "visible";
          optics.style.filter = presentation[0]!;
          optics.style.borderRadius = presentation[1]!;
          optics.style.clipPath = `inset(0 round ${presentation[1]})`;
          layer.style.opacity = presentation[2]!;
          layer.style.visibility = presentation[3]!;
          layer.style.zIndex = presentation[4]!;
          layer.style.maskImage = presentation[5]!;
          layer.style.clipPath = presentation[6]!;
        }
        updateShared?.write();
        if (position !== placed) {
          placed = position;
          shift = { x, y };
          if (viewport) {
            viewport.style.left = viewport.style.top = `${-margin}px`;
            viewport.style.width = `${width + margin * 2}px`;
            viewport.style.height = `${height + margin * 2}px`;
          }
          layer.style.width = `${width}px`;
          layer.style.height = `${height}px`;
          layer.style.transform = transform;
          frame.style.transform = inputTransform;
        }
        if (!notified && (currentCopy || updateShared?.native === false)) {
          notified = true;
          onReady?.();
        }
      };
    },
  });
  if (
    viewport &&
    "gpu" in navigator &&
    /AppleWebKit/.test(navigator.userAgent) &&
    !/Chrom(?:e|ium)|CriOS|Edg|OPR/.test(navigator.userAgent)
  ) {
    void import("./gpu-backdrop.js")
      .then(({ registerSharedBackdrop }) => {
        if (stopped) return;
        shared = registerSharedBackdrop(element, source, layer, optics, subscription.invalidate);
        shared?.visible(active);
        subscription.invalidate();
      })
      .catch(() => {
        /* The complete native copy remains mounted if the optional backend cannot load. */
      });
  }
  const stopVisibility = viewport
    ? watchCopy(element, (visible) => {
        if (active === visible) return;
        active = visible;
        layer.style.display = visible ? "" : "none";
        // Content may have changed while this copy was not participating.
        if (visible && copy) stale = true;
        shared?.visible(visible);
        subscription.visible(visible);
      })
    : undefined;

  return () => {
    stopped = true;
    clearTimeout(fade);
    version++;
    stopVisibility?.();
    shared?.stop();
    subscription.stop();
    layer.remove();
    element.removeAttribute("data-copy");
  };
}
