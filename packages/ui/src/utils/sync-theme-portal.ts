/** Keep a portal's complete inherited theme without invalidating an unchanged host. */
export function synchronizeThemePortal(scope: HTMLElement, host: HTMLElement) {
  const computed = getComputedStyle(scope);
  const next = new Map<string, string>();
  // Reading a live declaration between host writes repeatedly resolves style in
  // WebKit. Collect the full snapshot before touching the portal.
  for (const property of Array.from(computed)) {
    if (property.startsWith("--")) {
      next.set(property, computed.getPropertyValue(property));
    }
  }
  next.set("direction", computed.direction);
  next.set("font-family", computed.fontFamily);
  for (const property of Array.from(host.style)) {
    if (!next.has(property)) host.style.removeProperty(property);
  }
  for (const [property, value] of next) {
    if (
      host.style.getPropertyValue(property) !== value ||
      host.style.getPropertyPriority(property)
    ) {
      host.style.setProperty(property, value);
    }
  }

  for (const attribute of ["data-theme", "data-contrast", "data-level", "data-lenso-theme"]) {
    const value = scope.closest(`[${attribute}]`)?.getAttribute(attribute) || null;
    if (host.getAttribute(attribute) === value) continue;
    if (value) host.setAttribute(attribute, value);
    else host.removeAttribute(attribute);
  }
}
