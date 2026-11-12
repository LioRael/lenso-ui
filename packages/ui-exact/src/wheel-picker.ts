// Adapted from Lenso WheelPicker's measured projection and scroll settlement.
import { requestListBoxSelection } from "./list-box.js";
const selector = '[data-slot="wheel-picker"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>('[data-lenso-kind="wheel-picker-viewport"]');
  if (!viewport) return;
  const view = root.ownerDocument.defaultView!;
  const labels = new Map<HTMLElement, Array<[string, string, string]>>();
  let ended = false,
    frame = 0,
    reconcile = 0,
    timer = 0,
    previous = "",
    signature = "";
  const own = <T extends HTMLElement>(query: string) =>
    [...viewport.querySelectorAll<T>(query)].filter(
      (n) => n.closest('[data-slot="list-box"]') === viewport,
    );
  const rows = () => own<HTMLElement>('[data-slot="list-box-item"]');
  const enabled = () => rows().filter((n) => n.dataset["lensoDisabled"] !== "true");
  const selected = () => rows().find((n) => n.getAttribute("aria-selected") === "true");
  const stopped = () => root.dataset["lensoDisabled"] === "true";
  const restore = (node: HTMLElement) => {
    for (const [name, value, priority] of labels.get(node) ?? []) {
      if (value) node.style.setProperty(name, value, priority);
      else node.style.removeProperty(name);
    }
    labels.delete(node);
  };
  const paint = () => {
    view.cancelAnimationFrame(frame);
    frame = 0;
    if (ended) return;
    const options = rows(),
      height = options[0]?.offsetHeight;
    const liveLabels = new Set(
      options
        .map((row) => row.querySelector<HTMLElement>("[data-wheel-label]"))
        .filter((node): node is HTMLElement => Boolean(node)),
    );
    for (const node of labels.keys()) if (!liveLabels.has(node)) restore(node);
    if (!height) return;
    const radius = height * 2.8125,
      center = viewport.scrollTop + viewport.clientHeight / 2;
    const current = new Set<HTMLElement>();
    for (const row of options) {
      const label = row.querySelector<HTMLElement>("[data-wheel-label]");
      if (!label) continue;
      current.add(label);
      if (!labels.has(label))
        labels.set(
          label,
          ["transform", "opacity", "visibility"].map((name) => [
            name,
            label.style.getPropertyValue(name),
            label.style.getPropertyPriority(name),
          ]),
        );
      const distance = row.offsetTop + row.offsetHeight / 2 - center,
        angle = distance / radius,
        visible = Math.abs(angle) < Math.PI / 2;
      label.style.visibility = visible ? "visible" : "hidden";
      if (visible) {
        const emphasis = Math.max(0, 1 - Math.abs(distance) / height);
        label.style.transform = `translateY(${radius * Math.sin(angle) - distance}px) rotateX(${-angle}rad) scale(${1 + 0.15 * emphasis})`;
        label.style.opacity = String(0.4 + 0.6 * emphasis);
      }
    }
    for (const node of labels.keys()) if (!current.has(node)) restore(node);
  };
  const schedule = () => {
    if (!ended && !frame) frame = view.requestAnimationFrame(paint);
  };
  const align = () => {
    if (ended) return;
    const row = selected();
    if (row) {
      const top = row.offsetTop - (viewport.clientHeight - row.offsetHeight) / 2;
      if (Math.abs(viewport.scrollTop - top) > 0.5) viewport.scrollTop = top;
    }
    paint();
  };
  const later = () => {
    view.cancelAnimationFrame(reconcile);
    reconcile = view.requestAnimationFrame(() => {
      reconcile = 0;
      align();
    });
  };
  const settle = () => {
    view.clearTimeout(timer);
    timer = 0;
    if (ended) return;
    if (!stopped()) {
      const center = viewport.scrollTop + viewport.clientHeight / 2;
      const nearest = enabled().sort(
        (a, b) =>
          Math.abs(a.offsetTop + a.offsetHeight / 2 - center) -
          Math.abs(b.offsetTop + b.offsetHeight / 2 - center),
      )[0];
      if (nearest && nearest !== selected())
        requestListBoxSelection(viewport, [nearest.dataset["lensoValue"] ?? ""]);
    }
    later();
  };
  const scroll = () => {
    schedule();
    view.clearTimeout(timer);
    if (!("onscrollend" in viewport) && !stopped()) timer = view.setTimeout(settle, 150);
  };
  const inputIntent = (event: Event) => {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-slot="list-box"]') === viewport
    )
      later();
  };
  const forms = new Map<HTMLInputElement, string | null>();
  const restoreForm = (node: HTMLInputElement) => {
    const original = forms.get(node);
    if (original === null || original === undefined) node.removeAttribute("form");
    else node.setAttribute("form", original);
    forms.delete(node);
  };
  const sync = () => {
    if (ended) return;
    const formInput = root.querySelector<HTMLInputElement>('[data-slot="wheel-picker-form"]');
    for (const node of forms.keys()) if (node !== formInput) restoreForm(node);
    if (formInput) {
      if (!forms.has(formInput)) forms.set(formInput, formInput.getAttribute("form"));
      const id = formInput.dataset["lensoForm"];
      if (id) formInput.setAttribute("form", id);
      else formInput.removeAttribute("form");
    }
    const value = selected()?.dataset["lensoValue"] ?? "",
      next = rows()
        .map((n) => `${n.id}:${n.dataset["lensoDisabled"]}`)
        .join("|");
    if (previous !== value || signature !== next) {
      previous = value;
      signature = next;
      view.clearTimeout(timer);
      view.cancelAnimationFrame(reconcile);
      reconcile = 0;
      align();
    } else schedule();
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-selected", "data-lenso-disabled", "data-lenso-form"],
  });
  const resize = new ResizeObserver(align);
  resize.observe(viewport);
  viewport.addEventListener("scroll", scroll, { passive: true });
  viewport.addEventListener("scrollend", settle);
  viewport.addEventListener("click", inputIntent, true);
  viewport.addEventListener("keydown", inputIntent, true);
  sync();
  later();
  return {
    sync,
    end() {
      if (ended) return;
      ended = true;
      observer.disconnect();
      resize.disconnect();
      view.cancelAnimationFrame(frame);
      view.cancelAnimationFrame(reconcile);
      view.clearTimeout(timer);
      viewport.removeEventListener("scroll", scroll);
      viewport.removeEventListener("scrollend", settle);
      viewport.removeEventListener("click", inputIntent, true);
      viewport.removeEventListener("keydown", inputIntent, true);
      for (const n of labels.keys()) restore(n);
      for (const node of forms.keys()) restoreForm(node);
      owners.delete(root);
    },
  };
}
export function updateWheelPicker(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.closest<HTMLElement>(selector);
  if (!root) return;
  const existing = owners.get(root);
  if (existing) existing.sync();
  else {
    const owner = create(root);
    if (owner) owners.set(root, owner);
  }
}
export function endWheelPicker(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) owners.get(node)?.end();
}
