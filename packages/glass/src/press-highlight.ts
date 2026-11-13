export function lightStrength(distance: number, radius: number) {
  const t = distance / radius;
  return t <= 0.5 ? 1 - t * (4 / 7) : Math.max(0, (1 - t) * (10 / 7));
}

export function lightLabel(member: HTMLElement, strength?: number) {
  const name = "--lg-light-label";
  if (strength === undefined || member.getAttribute("data-variant") === "prominent") {
    member.style.removeProperty(name);
    return;
  }
  const color =
    strength >= 0.4
      ? getComputedStyle(member).getPropertyValue("--lenso-material-action-mode").trim() === "dark"
        ? "rgb(255 255 255)"
        : "rgb(26 26 26)"
      : "var(--lenso-control-tint, var(--lenso-material-action-label))";
  if (member.style.getPropertyValue(name) !== color) member.style.setProperty(name, color);
}

/** Track light independently of elastic movement, including stationary controls. */
export function trackPressHighlight(element: HTMLElement) {
  let heldKey: string | undefined;
  let pointerId: number | undefined;
  let point: { x: number; y: number } | undefined;
  let frame = 0;
  const labels = new Set<HTMLElement>();
  const blocked = (target: EventTarget | null) =>
    element.matches(':disabled, [aria-disabled="true"], [data-disabled], [data-pending]') ||
    (target instanceof Element &&
      Boolean(
        target.closest(':disabled, [aria-disabled="true"], [data-disabled], [data-pending]'),
      ));
  const write = (name: string, value: string) => {
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
  };
  const position = (x: number, y: number) => {
    const box = element.getBoundingClientRect();
    if (!box.width || !box.height) return;
    write("--lg-light-x", `${((x - box.left) / box.width) * 100}%`);
    write("--lg-light-y", `${((y - box.top) / box.height) * 100}%`);
    write("--lg-light-radius", "240px");
  };
  const paintLabels = (x: number, y: number) => {
    if (
      element.hasAttribute("data-lenso-glass-fused") ||
      !element.querySelector(':scope > [data-lenso-slot="glass-press-highlight"]')
    )
      return;
    const radius = 240;
    const members = element.matches("button")
      ? [element]
      : [...element.querySelectorAll<HTMLElement>("[data-toolbar-item]")];
    for (const member of members) {
      if (member.matches(':disabled, [aria-disabled="true"], [data-disabled], [data-pending]'))
        continue;
      const rect = member.getBoundingClientRect();
      lightLabel(
        member,
        lightStrength(
          Math.hypot(rect.x + rect.width / 2 - x, rect.y + rect.height / 2 - y),
          radius,
        ),
      );
      labels.add(member);
    }
  };
  const clearLabels = () => {
    for (const member of labels) lightLabel(member);
    labels.clear();
  };
  const follow = () => {
    frame = 0;
    if (!point) return;
    position(point.x, point.y);
    paintLabels(point.x, point.y);
    frame = requestAnimationFrame(follow);
  };
  const move = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    point = { x: event.clientX, y: event.clientY };
    position(point.x, point.y);
  };
  const end = (event?: Event) => {
    if (event instanceof PointerEvent && event.pointerId !== pointerId) return;
    pointerId = undefined;
    point = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    element.removeAttribute("data-lenso-light-pressed");
    clearLabels();
    window.removeEventListener("pointermove", move, true);
    window.removeEventListener("pointerup", end, true);
    window.removeEventListener("pointercancel", end, true);
    window.removeEventListener("blur", end);
  };
  // A nested optical surface owns its light; an enclosing bar must not add another.
  const nestedLight = (target: EventTarget | null) => {
    const owner =
      target instanceof Element
        ? target.closest('[data-glass="true"], [data-toolbar-detachable]')
        : null;
    return Boolean(
      owner &&
      owner !== element &&
      element.contains(owner) &&
      owner.querySelector(':scope > [data-lenso-slot="glass-press-highlight"]'),
    );
  };
  const pointer = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || pointerId !== undefined || blocked(event.target))
      return;
    if (nestedLight(event.target)) return;
    pointerId = event.pointerId;
    point = { x: event.clientX, y: event.clientY };
    position(point.x, point.y);
    paintLabels(point.x, point.y);
    frame = requestAnimationFrame(follow);
    element.setAttribute("data-lenso-light-pressed", "");
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
    window.addEventListener("blur", end);
  };
  const keyboard = (event: KeyboardEvent) => {
    if (
      (event.key !== " " && event.key !== "Enter") ||
      blocked(event.target) ||
      nestedLight(event.target)
    )
      return;
    const box =
      event.target instanceof Element
        ? event.target.getBoundingClientRect()
        : element.getBoundingClientRect();
    position(box.left + box.width / 2, box.top + box.height / 2);
    paintLabels(box.left + box.width / 2, box.top + box.height / 2);
    heldKey = event.key;
    element.setAttribute("data-lenso-key-pressed", "");
    window.addEventListener("keyup", release, true);
    window.addEventListener("blur", release);
  };
  const release = (event?: Event) => {
    if (event instanceof KeyboardEvent && event.key !== heldKey) return;
    heldKey = undefined;
    element.removeAttribute("data-lenso-key-pressed");
    clearLabels();
    window.removeEventListener("keyup", release, true);
    window.removeEventListener("blur", release);
  };
  element.addEventListener("pointerdown", pointer);
  element.addEventListener("keydown", keyboard);
  element.addEventListener("blur", release);
  return () => {
    end();
    release();
    element.removeEventListener("pointerdown", pointer);
    element.removeEventListener("keydown", keyboard);
    element.removeEventListener("blur", release);
    for (const name of ["--lg-light-x", "--lg-light-y", "--lg-light-radius"])
      element.style.removeProperty(name);
  };
}
