// Start the shared app for an internal document link before any interactive control has run.
export function bootstrapNavigation() {
  document.addEventListener(
    "click",
    (event) => {
      const exact = (globalThis.exact ??= {});
      if (
        exact.state ||
        event.defaultPrevented ||
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target.closest?.("#exact-root a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname + url.search === location.pathname + location.search
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      (exact.q ??= []).push({ type: "click", target: link });
      if (!exact.ready) {
        const checkpoint = document.querySelector(
          'script[type="application/vnd.exact.checkpoint"][data-src]',
        );
        if (checkpoint)
          exact.answers = fetch(checkpoint.dataset.src).then(
            (response) => (response.ok ? response.text() : null),
            () => null,
          );
        exact.ready = import(new URL("./app.js", document.baseURI).href);
      }
      Promise.resolve(exact.ready).catch(() => location.assign(url.href));
    },
    true,
  );
}
