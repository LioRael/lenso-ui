import { createPreparationCheckpoint } from "./preparation-budget.js";

/** Prepared at the original resolution, without taking ownership of the control. */
export interface BackdropSnapshot {
  surface: HTMLElement;
  /** A complete material paints above the native lens. Backdrop pixels go below its rim. */
  includesMaterial?: boolean;
  /** Runs after insertion, before the native filter is retired. */
  present?(): boolean;
  dispose(): void;
}

export interface BackdropSnapshotOptions {
  source: HTMLElement;
  foreground?: HTMLElement;
  /** Invalidate changes to owned input outside observable DOM (e.g. CSSOM or canvas). */
  subscribe?(invalidate: () => void): () => void;
  /** The owner must exclude unsupported or moving input and preserve native rendering. */
  ready(): boolean;
  /** Call checkpoint between preparation units; false means the request was cancelled. */
  prepare(
    signal: AbortSignal,
    checkpoint: () => Promise<boolean>,
  ): Promise<BackdropSnapshot | undefined>;
}

/** The owner must certify the complete input; an unknown source keeps its native lens. */
export type GlassBackdropSource = (lens: HTMLElement) => BackdropSnapshotOptions | undefined;

/** Present the source's prepared output only while geometry, input and ownership are stable. */
export function attachBackdropSnapshot(
  element: HTMLElement,
  { source, foreground, ready, prepare, subscribe }: BackdropSnapshotOptions,
  onMaterial?: (active: boolean) => void,
): () => void {
  const document = element.ownerDocument;
  const view = document.defaultView!;
  let stopped = false;
  let frame = 0;
  let generation = 0;
  let pending: AbortController | undefined;
  let current: BackdropSnapshot | undefined;
  let signature = "";
  let stableFrames = 0;
  let attempted = false;
  let backdrop = "";
  let backdropPriority = "";
  let previousWillChange = "";
  let appliedWillChange = "";
  const listeners: (() => void)[] = [];

  const restore = () => {
    if (!current) return;
    const snapshot = current;
    current = undefined;
    snapshot.surface.remove();
    if (element.style.getPropertyValue("backdrop-filter") === "none") {
      if (backdrop) element.style.setProperty("backdrop-filter", backdrop, backdropPriority);
      else element.style.removeProperty("backdrop-filter");
    }
    if (foreground && foreground.style.willChange === appliedWillChange)
      foreground.style.willChange = previousWillChange;
    snapshot.dispose();
    if (snapshot.includesMaterial) onMaterial?.(false);
  };

  const invalidate = () => {
    generation++;
    pending?.abort();
    pending = undefined;
    restore();
    stableFrames = 0;
    attempted = false;
  };

  const measure = () => {
    const box = element.getBoundingClientRect();
    const from = source.getBoundingClientRect();
    const style = view.getComputedStyle(element);
    return {
      box,
      style,
      key: [
        view.innerWidth,
        view.innerHeight,
        view.devicePixelRatio,
        view.scrollX,
        view.scrollY,
        box.x,
        box.y,
        box.width,
        box.height,
        from.x,
        from.y,
        from.width,
        from.height,
        style.borderRadius,
        style.zIndex,
        style.opacity,
        style.visibility,
        style.getPropertyValue("--lg-filter"),
        style.getPropertyValue("--lg-blur"),
        style.getPropertyValue("--lg-source-reach"),
      ].join("|"),
    };
  };

  const start = (key: string) => {
    const abort = new AbortController();
    pending = abort;
    attempted = true;
    const version = generation;
    const checkpoint = createPreparationCheckpoint(abort.signal, view);
    void Promise.resolve()
      .then(() => prepare(abort.signal, checkpoint))
      .then((snapshot) => {
        if (!snapshot) return;
        if (
          stopped ||
          abort.signal.aborted ||
          version !== generation ||
          !element.isConnected ||
          !source.isConnected ||
          !ready() ||
          measure().key !== key
        ) {
          snapshot.dispose();
          return;
        }
        const { box, style } = measure();
        const surface = snapshot.surface;
        if (surface === element || surface.ownerDocument !== document || surface.isConnected) {
          snapshot.dispose();
          return;
        }
        surface.setAttribute("data-glass-backdrop-snapshot", "");
        surface.setAttribute("aria-hidden", "true");
        surface.inert = true;
        surface.style.cssText = `position:absolute;inset:0;width:${box.width}px;height:${box.height}px;pointer-events:none;z-index:${style.zIndex}`;
        backdrop = element.style.getPropertyValue("backdrop-filter");
        backdropPriority = element.style.getPropertyPriority("backdrop-filter");
        if (foreground) {
          previousWillChange = foreground.style.willChange;
          appliedWillChange =
            !previousWillChange || previousWillChange === "auto"
              ? "transform"
              : previousWillChange.split(",").some((part) => part.trim() === "transform")
                ? previousWillChange
                : `${previousWillChange}, transform`;
          foreground.style.willChange = appliedWillChange;
        }
        current = snapshot;
        try {
          if (snapshot.includesMaterial) {
            surface.style.borderRadius = style.borderRadius;
            surface.style.overflow = "clip";
            surface.style.isolation = "isolate";
            surface.style.willChange = "opacity";
            element.after(surface);
          } else {
            element.before(surface);
          }
          if (snapshot.present && !snapshot.present()) return restore();
          if (current !== snapshot || abort.signal.aborted) return;
          element.style.setProperty("backdrop-filter", "none");
          if (snapshot.includesMaterial) onMaterial?.(true);
        } catch {
          if (current === snapshot) restore();
        }
      })
      .catch(() => {
        // A failed/unsupported capture leaves the complete native surface visible.
      })
      .finally(() => {
        if (pending === abort) pending = undefined;
      });
  };

  const listen = (target: EventTarget, type: string, capture = false) => {
    target.addEventListener(type, invalidate, capture);
    listeners.push(() => target.removeEventListener(type, invalidate, capture));
  };
  // Subscribe before allocating DOM observers; a rejected source leaves no observers behind.
  if (subscribe) listeners.push(subscribe(invalidate));
  const sourceObserver = new MutationObserver(invalidate);
  sourceObserver.observe(source, {
    subtree: true,
    attributes: true,
    childList: true,
    characterData: true,
  });
  const ancestorObserver = new MutationObserver(invalidate);
  for (let node = source.parentElement; node; node = node.parentElement)
    ancestorObserver.observe(node, { attributes: true });
  const sheets = () =>
    [...document.styleSheets]
      .filter((sheet) => {
        try {
          // Empty rules do not change paint, including transient browser inspection styles.
          for (const rule of sheet.cssRules)
            if (!(rule instanceof view.CSSStyleRule) || rule.style.length) return true;
          return false;
        } catch {
          return true;
        }
      })
      .map((sheet) => ({
        sheet,
        text: sheet.ownerNode?.textContent,
        media: sheet.media?.mediaText,
        disabled: sheet.disabled,
      }));
  let previousSheets = sheets();
  const sheetObserver = new MutationObserver(() => {
    const next = sheets();
    const changed =
      next.length !== previousSheets.length ||
      next.some((entry, index) => {
        const before = previousSheets[index];
        return (
          entry.sheet !== before?.sheet ||
          entry.text !== before.text ||
          entry.media !== before.media ||
          entry.disabled !== before.disabled
        );
      });
    previousSheets = next;
    if (changed) invalidate();
  });
  sheetObserver.observe(document.head, {
    subtree: true,
    attributes: true,
    childList: true,
    characterData: true,
  });
  const targetObserver = new MutationObserver(() => {
    if (!ready()) invalidate();
  });
  for (
    let node: HTMLElement | null = element;
    node && node !== document.body;
    node = node.parentElement
  )
    targetObserver.observe(node, { attributes: true });
  listen(view, "scroll", true);
  listen(view, "resize");
  listen(document, "selectionchange");
  listen(document, "visibilitychange");
  if (document.fonts) listen(document.fonts, "loadingdone");
  for (const type of [
    "pointerover",
    "pointerout",
    "focusin",
    "focusout",
    "input",
    "change",
    "load",
    "transitionrun",
    "animationstart",
  ])
    listen(source, type, true);

  const dispose = () => {
    if (stopped) return;
    stopped = true;
    invalidate();
    view.cancelAnimationFrame(frame);
    sourceObserver.disconnect();
    ancestorObserver.disconnect();
    sheetObserver.disconnect();
    targetObserver.disconnect();
    for (const remove of listeners) remove();
  };
  const tick = () => {
    if (stopped) return;
    if (!element.isConnected || !source.isConnected) return dispose();
    // Scroll timelines are stationary between scroll events, which already invalidate the snapshot.
    if (
      document.visibilityState !== "visible" ||
      !ready() ||
      source
        .getAnimations({ subtree: true })
        .some(
          (animation) =>
            animation.timeline instanceof DocumentTimeline &&
            (animation.pending || animation.playState === "running"),
        )
    ) {
      if (current || pending || stableFrames) invalidate();
      signature = "";
    } else {
      const { key } = measure();
      if (key !== signature) {
        invalidate();
        signature = key;
      }
      if (++stableFrames >= 2 && !attempted) start(key);
    }
    frame = view.requestAnimationFrame(tick);
  };
  frame = view.requestAnimationFrame(tick);
  return dispose;
}
