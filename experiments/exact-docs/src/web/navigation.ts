/** Hold a declared document link until the native shared app has installed its router. */
export function captureNavigation(routes: string[]) {
  const paths = new Set(routes.map((route) => new URL(route, location.href).pathname));
  let intent = 0;
  document.addEventListener(
    "click",
    (event) => {
      const exact = (
        globalThis as typeof globalThis & {
          exact?: { state?: unknown; answers?: Promise<string | null>; ready?: unknown };
        }
      ).exact;
      if (
        exact?.state ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("#exact-root a[href]")
          : null;
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self") ||
        link.matches('[data-exact-on~="press"]')
      )
        return;
      const target = new URL(link.href, location.href);
      if (
        target.origin !== location.origin ||
        !paths.has(target.pathname) ||
        target.pathname + target.search === location.pathname + location.search
      )
        return;
      const checkpoint = document.querySelector<HTMLScriptElement>(
        'script[type="application/vnd.exact.checkpoint"]',
      );
      if (!exact || !checkpoint) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const turn = ++intent;
      if (!exact.ready) {
        if (checkpoint.dataset["src"] && !exact.answers)
          exact.answers = fetch(checkpoint.dataset["src"]).then(
            (response) => (response.ok ? response.text() : null),
            () => null,
          );
        exact.ready = import(/* @vite-ignore */ new URL("./app.js", document.baseURI).href);
      }
      // The module may replace its import promise with a checkpoint/style startup promise.
      // Native mount replays control input before installing the router, so links wait separately.
      Promise.resolve(exact.ready)
        .then(() => Promise.resolve(exact.ready))
        .then(() => {
          if (turn !== intent) return;
          if (!exact.state) throw Error("Shared application did not initialize");
          const live = link.isConnected
            ? link
            : [...document.querySelectorAll<HTMLAnchorElement>("#exact-root a[href]")].find(
                (candidate) => candidate.href === target.href,
              );
          if (!live) throw Error("Navigation link disappeared during activation");
          live.click();
        })
        .catch(() => {
          if (turn === intent) location.assign(target.href);
        });
    },
    true,
  );
}
