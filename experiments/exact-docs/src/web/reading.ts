/** Move keyboard reading to the new page; Exact owns routing, fragments and history scroll. */
export function prepareReading() {
  let destination: string | undefined;
  document.addEventListener(
    "click",
    (event) => {
      if (
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.detail !== 0
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("#exact-root a[href]")
          : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self"))
        return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        url.pathname + url.search === location.pathname + location.search
      )
        return;
      destination = url.pathname + url.search;
    },
    true,
  );
  addEventListener("popstate", () => {
    destination = undefined;
  });
  return {
    sync(context: Element | null) {
      if (!destination || destination !== location.pathname + location.search || !context) return;
      destination = undefined;
      const content =
        context instanceof HTMLElement && context.matches('[data-docs-part="content"]')
          ? context
          : context.querySelector<HTMLElement>('[data-docs-part="content"]');
      if (!content) return;
      if (!content.hasAttribute("tabindex")) content.tabIndex = -1;
      content.focus({ preventScroll: true });
    },
  };
}
