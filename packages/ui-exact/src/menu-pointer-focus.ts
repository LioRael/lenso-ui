interface Point {
  x: number;
  y: number;
  type: string;
}
interface PointerDocument {
  count: number;
  point?: Point;
  remember(event: PointerEvent): void;
}
const documents = new WeakMap<Document, PointerDocument>();
const guards = new WeakMap<HTMLElement, { armed: boolean }>();
const rowSelector = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
const pointer = (event: PointerEvent) =>
  event.pointerType === "mouse" || event.pointerType === "pen" || event.pointerType === "";
export function isMenuPointerFocusGuarded(node: HTMLElement) {
  for (
    let root = node.closest<HTMLElement>('[popover][role="menu"]');
    root;
    root = root.parentElement?.closest<HTMLElement>('[popover][role="menu"]') ?? null
  )
    if (guards.get(root)?.armed) return true;
  return false;
}

/** Layout-driven pointer retargeting must not undo keyboard opening or submenu return focus. */
export function menuPointerFocus(root: HTMLElement) {
  const doc = root.ownerDocument;
  let tracked = documents.get(doc);
  if (!tracked) {
    tracked = {
      count: 0,
      remember(event) {
        if (pointer(event))
          this.point = { x: event.clientX, y: event.clientY, type: event.pointerType };
      },
    };
    tracked.remember = tracked.remember.bind(tracked);
    documents.set(doc, tracked);
    doc.addEventListener("pointermove", tracked.remember, true);
    doc.addEventListener("pointerdown", tracked.remember, true);
  }
  tracked.count++;
  const state = { armed: false };
  guards.set(root, state);
  let point: Point | undefined;
  const clear = () => {
    state.armed = false;
    for (const type of ["pointerover", "pointerout", "pointermove"] as const)
      doc.removeEventListener(type, guard, true);
    doc.removeEventListener("pointerdown", down, true);
  };
  const moved = (event: PointerEvent) =>
    !point ||
    point.type !== event.pointerType ||
    Math.abs(event.clientX - point.x) >= 1 ||
    Math.abs(event.clientY - point.y) >= 1;
  const guard = (event: PointerEvent) => {
    if (!state.armed || !pointer(event)) return;
    const target = event.target;
    if (moved(event)) {
      clear();
      if (event.type === "pointermove" && target instanceof Element && root.contains(target)) {
        const row = target.closest<HTMLElement>(rowSelector);
        if (
          row &&
          !row.matches(':disabled,[aria-disabled="true"]') &&
          !row.closest("[inert]") &&
          !isMenuPointerFocusGuarded(row)
        )
          row.focus({ preventScroll: true });
      }
      return;
    }
    if (target instanceof Node && root.contains(target)) event.stopPropagation();
  };
  const down = (event: PointerEvent) => {
    if (pointer(event)) clear();
  };
  return {
    arm() {
      clear();
      point = tracked!.point ? { ...tracked!.point } : undefined;
      state.armed = true;
      for (const type of ["pointerover", "pointerout", "pointermove"] as const)
        doc.addEventListener(type, guard, true);
      doc.addEventListener("pointerdown", down, true);
    },
    clear,
    end() {
      clear();
      guards.delete(root);
      tracked!.count--;
      if (!tracked!.count) {
        doc.removeEventListener("pointermove", tracked!.remember, true);
        doc.removeEventListener("pointerdown", tracked!.remember, true);
        documents.delete(doc);
      }
    },
  };
}
