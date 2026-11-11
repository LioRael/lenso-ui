// Native-element adaptation of Base UI 1.9.0 NumberField ScrubArea/Cursor.
// Copyright (c) 2019 Material-UI SAS; Floating UI contributors. MIT; see NOTICES.md.
interface ScrubHost {
  blocked(): boolean;
  focus(): void;
  increment(delta: number, event: PointerEvent): { next: number | null } | null;
  value(): number | null;
  commit(value: number | null): void;
}
const rootSelector = '[data-slot="number-field"],[data-slot="stepper"]';
const areaSelector = '[data-slot="number-scrub-area"]';
const hosts = new WeakMap<HTMLElement, ScrubHost>();
const areas = new WeakMap<HTMLElement, { sync(): void; cancel(): void; end(): void }>();
interface Session {
  root: HTMLElement;
  area: HTMLElement;
  requested: boolean;
  sync(): void;
  finish(commit: boolean): void;
  cursorEnded(node: HTMLElement): void;
}
const sessions = new WeakMap<Document, Session>();
const webkit = (view: Window) =>
  /AppleWebKit/.test(view.navigator.userAgent) &&
  !/(Chrome|Chromium|Edg|OPR)\//.test(view.navigator.userAgent);

function begin(area: HTMLElement, root: HTMLElement, host: ScrubHost, event: PointerEvent) {
  const doc = area.ownerDocument,
    view = doc.defaultView!;
  sessions.get(doc)?.finish(false);
  let ended = false,
    requested = false,
    locked = false,
    denied = false,
    moved = false,
    nativeClick = false,
    cumulative = 0;
  let lastX = event.clientX,
    lastY = event.clientY,
    x = 0,
    y = 0;
  let next: { value: number | null } | undefined;
  let cursor: HTMLElement | undefined;
  const downTarget = event.target instanceof Element ? event.target : area;
  const pointerId = event.pointerId,
    touch = event.pointerType === "touch";
  const attributes = new Map<Element, string | null>();
  const styles = new Map<HTMLElement, { value: string; priority: string }>();
  let clickAllowed = true;
  let clickTimer = 0,
    exitTimer = 0;
  const config = () => {
    const direction = area.dataset["lensoDirection"] ?? "horizontal";
    if (direction !== "horizontal" && direction !== "vertical")
      throw new RangeError("NumberField scrub direction must be horizontal or vertical");
    const sensitivity = Number(area.dataset["lensoPixelSensitivity"] ?? 2);
    const raw = area.dataset["lensoTeleport"];
    const teleport = raw === undefined || raw === "" ? undefined : Number(raw);
    if (!Number.isFinite(sensitivity) || (teleport !== undefined && !Number.isFinite(teleport)))
      throw new RangeError("NumberField scrub distances must be finite");
    return { direction, sensitivity, teleport };
  };
  let previousConfig = JSON.stringify(config());
  const mark = () => {
    for (const node of [root, ...root.querySelectorAll('[data-hatch="lenso-ui"]')]) {
      if (node.closest(rootSelector) !== root) continue;
      if (!attributes.has(node)) attributes.set(node, node.getAttribute("data-scrubbing"));
      node.setAttribute("data-scrubbing", "");
    }
  };
  const restoreCursor = (node: HTMLElement) => {
    if (node.matches(":popover-open")) node.hidePopover();
    const original = styles.get(node);
    if (original) {
      if (original.value) node.style.setProperty("transform", original.value, original.priority);
      else node.style.removeProperty("transform");
      styles.delete(node);
    }
  };
  const transform = () => {
    if (!cursor) return;
    const scale = view.visualViewport?.scale ?? 1;
    cursor.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 / scale})`;
  };
  const syncCursor = () => {
    const candidate = [
      ...area.querySelectorAll<HTMLElement>('[data-slot="number-scrub-cursor"]'),
    ].find((node) => node.closest(areaSelector) === area);
    if (cursor !== candidate) {
      if (cursor) restoreCursor(cursor);
      cursor = candidate;
      if (cursor) {
        styles.set(cursor, {
          value: cursor.style.getPropertyValue("transform"),
          priority: cursor.style.getPropertyPriority("transform"),
        });
        x = event.clientX - cursor.offsetWidth / 2;
        y = event.clientY - cursor.offsetHeight / 2;
      }
    }
    if (!cursor) return;
    if (!webkit(view) && !touch && !denied && locked) {
      if (!cursor.matches(":popover-open")) {
        cursor.showPopover();
        x = event.clientX - cursor.offsetWidth / 2;
        y = event.clientY - cursor.offsetHeight / 2;
      }
      transform();
    } else if (cursor.matches(":popover-open")) cursor.hidePopover();
  };
  const releaseLock = () => {
    if (doc.pointerLockElement === doc.body && locked) {
      try {
        doc.exitPointerLock();
      } catch {
        /* Native lock may already have been released. */
      }
    }
  };
  const finish = (commit: boolean) => {
    if (ended) return;
    ended = true;
    clearTimeout(exitTimer);
    view.removeEventListener("pointermove", move, true);
    view.removeEventListener("pointerup", up, true);
    view.removeEventListener("pointercancel", cancel, true);
    doc.removeEventListener("pointerlockchange", lockChanged);
    view.removeEventListener("keydown", keydown, true);
    area.removeEventListener("click", clicked, true);
    if (sessions.get(doc) === session) sessions.delete(doc);
    releaseLock();
    if (cursor) restoreCursor(cursor);
    for (const [node, value] of attributes) {
      if (value === null) node.removeAttribute("data-scrubbing");
      else node.setAttribute("data-scrubbing", value);
    }
    attributes.clear();
    if (commit && !host.blocked()) host.commit(next ? next.value : host.value());
    if (commit && !moved && clickAllowed && !host.blocked() && downTarget.isConnected) {
      // Locked clicks target body. With no lock, wait for the native click before synthesizing one.
      area.addEventListener("click", clicked, true);
      clickTimer = view.setTimeout(() => {
        area.removeEventListener("click", clicked, true);
        if (clickAllowed && !host.blocked() && !nativeClick && downTarget.isConnected)
          downTarget.dispatchEvent(
            new view.MouseEvent("click", { bubbles: true, cancelable: true }),
          );
      }, 0);
    }
  };
  const clicked = () => {
    nativeClick = true;
  };
  const move = (e: PointerEvent) => {
    if (ended || e.pointerId !== pointerId) return;
    if (host.blocked() || !area.isConnected) {
      finish(false);
      return;
    }
    e.preventDefault();
    let dx = e.movementX,
      dy = e.movementY;
    if (touch || (!dx && !dy && !locked)) {
      dx = e.clientX - lastX;
      dy = e.clientY - lastY;
    }
    lastX = e.clientX;
    lastY = e.clientY;
    syncCursor();
    const cfg = config();
    if (cursor && cursor.matches(":popover-open")) {
      const rect =
        cfg.teleport === undefined
          ? view.visualViewport
            ? {
                left: view.visualViewport.offsetLeft,
                top: view.visualViewport.offsetTop,
                right: view.visualViewport.offsetLeft + view.visualViewport.width,
                bottom: view.visualViewport.offsetTop + view.visualViewport.height,
              }
            : {
                left: 0,
                top: 0,
                right: doc.documentElement.clientWidth,
                bottom: doc.documentElement.clientHeight,
              }
          : (() => {
              const r = area.getBoundingClientRect();
              return {
                left: r.left - cfg.teleport / 2,
                top: r.top - cfg.teleport / 2,
                right: r.right + cfg.teleport / 2,
                bottom: r.bottom + cfg.teleport / 2,
              };
            })();
      const wrap = (coord: number, half: number, low: number, high: number) =>
        coord + half < low ? high - half : coord + half > high ? low - half : coord;
      x = wrap(Math.round(x + dx), cursor.offsetWidth / 2, rect.left, rect.right);
      y = wrap(Math.round(y + dy), cursor.offsetHeight / 2, rect.top, rect.bottom);
      transform();
    }
    cumulative += cfg.direction === "vertical" ? dy : dx;
    if (Math.abs(cumulative) >= cfg.sensitivity) {
      cumulative = 0;
      moved = true;
      const delta = cfg.direction === "vertical" ? -dy : dx;
      if (delta !== 0) {
        const changed = host.increment(delta, e);
        if (changed) next = { value: changed.next };
      }
    }
  };
  const up = (e: PointerEvent) => {
    if (e.pointerId !== pointerId || ended) return;
    if (/Firefox\//.test(view.navigator.userAgent))
      exitTimer = view.setTimeout(() => finish(true), 20);
    else finish(true);
  };
  const cancel = (e: PointerEvent) => {
    if (e.pointerId === pointerId) finish(false);
  };
  const lockChanged = () => {
    if (ended) return;
    if (doc.pointerLockElement === doc.body && requested) {
      locked = true;
      denied = false;
      syncCursor();
    } else if (locked) finish(false);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !event.isComposing) {
      event.preventDefault();
      event.stopImmediatePropagation();
      finish(false);
    }
  };
  const session: Session = {
    root,
    area,
    get requested() {
      return requested;
    },
    sync() {
      if (ended) return;
      if (host.blocked() || !area.isConnected) {
        finish(false);
        return;
      }
      const current = JSON.stringify(config());
      if (current !== previousConfig) {
        previousConfig = current;
        cumulative = 0;
      }
      mark();
      syncCursor();
    },
    finish,
    cursorEnded(node) {
      if (cursor === node) {
        restoreCursor(node);
        cursor = undefined;
        const value = attributes.get(node);
        if (attributes.has(node)) {
          if (value === null) node.removeAttribute("data-scrubbing");
          else node.setAttribute("data-scrubbing", value!);
          attributes.delete(node);
        }
      }
    },
  };
  sessions.set(doc, session);
  mark();
  view.addEventListener("pointermove", move, { capture: true, passive: false });
  view.addEventListener("pointerup", up, true);
  view.addEventListener("pointercancel", cancel, true);
  area.addEventListener("click", clicked, true);
  doc.addEventListener("pointerlockchange", lockChanged);
  view.addEventListener("keydown", keydown, true);
  if (!touch && !webkit(view) && typeof doc.body.requestPointerLock === "function") {
    requested = true;
    try {
      const result = doc.body.requestPointerLock();
      Promise.resolve(result).then(
        () => {
          if (ended) {
            const current = sessions.get(doc);
            if (doc.pointerLockElement === doc.body && !current?.requested) {
              try {
                doc.exitPointerLock();
              } catch {
                /* A pending request can resolve after removal. */
              }
            }
            return;
          }
          locked = doc.pointerLockElement === doc.body;
          denied = !locked;
          session.sync();
        },
        () => {
          if (!ended) {
            denied = true;
            locked = false;
            session.sync();
          }
        },
      );
    } catch {
      denied = true;
    }
  }
  session.sync();
  return {
    finish,
    clear() {
      clickAllowed = false;
      clearTimeout(clickTimer);
      clearTimeout(exitTimer);
      area.removeEventListener("click", clicked, true);
    },
  };
}

export function registerNumberScrub(root: HTMLElement, host: ScrubHost) {
  hosts.set(root, host);
  return {
    sync() {
      const session = sessions.get(root.ownerDocument);
      if (session?.root === root) session.sync();
    },
    end() {
      if (hosts.get(root) === host) hosts.delete(root);
      const session = sessions.get(root.ownerDocument);
      if (session?.root === root) session.finish(false);
      for (const area of root.querySelectorAll<HTMLElement>(areaSelector))
        if (area.closest(rootSelector) === root) areas.get(area)?.cancel();
    },
  };
}
export function updateNumberScrub(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] === "number-scrub-area") {
    if (!areas.has(node)) {
      let last: ReturnType<typeof begin> | undefined;
      const root = node.closest<HTMLElement>(rootSelector);
      if (!root) return;
      const down = (event: PointerEvent) => {
        const host = hosts.get(root);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          !host ||
          host.blocked() ||
          (event.target instanceof Element && event.target.closest(areaSelector) !== node)
        )
          return;
        last?.finish(false);
        last?.clear();
        if (event.pointerType === "mouse") {
          event.preventDefault();
          host.focus();
        }
        last = begin(node, root, host, event);
      };
      const touch = (event: TouchEvent) => {
        if (event.touches.length === 1 && hosts.get(root) && !hosts.get(root)!.blocked())
          event.preventDefault();
      };
      node.addEventListener("pointerdown", down);
      node.addEventListener("touchstart", touch, { passive: false });
      areas.set(node, {
        cancel() {
          last?.finish(false);
          last?.clear();
        },
        sync() {
          const s = sessions.get(node.ownerDocument);
          if (s?.area === node) s.sync();
        },
        end() {
          last?.finish(false);
          last?.clear();
          node.removeEventListener("pointerdown", down);
          node.removeEventListener("touchstart", touch);
        },
      });
    }
    areas.get(node)?.sync();
  } else if (areas.has(node)) {
    areas.get(node)?.end();
    areas.delete(node);
  }
  if (data["lensoKind"] === "number-scrub-cursor") sessions.get(node.ownerDocument)?.sync();
}
export function endNumberScrub(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  areas.get(node)?.end();
  areas.delete(node);
  sessions.get(node.ownerDocument)?.cursorEnded(node);
}
