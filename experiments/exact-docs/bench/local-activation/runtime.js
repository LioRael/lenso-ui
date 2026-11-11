// Prototype DOM adapter only: all values/actions/resources belong to the compiled Exact root.
export function activateLocal({
  env,
  commit,
  effect,
  scope,
  end,
  P,
  onPress,
  onValue,
  text,
  counterAction,
  searchAction,
  view,
  replay = true,
}) {
  const exact = (globalThis.exact ??= {});
  exact.ready = true;
  exact.state = env.$state;
  exact.localState = env.$state;
  exact.activationPhase = "local";
  const counter = document.querySelector('[data-testid="comparison-counter"]');
  const search = document.querySelector('[data-docs-part="search"]');
  const input = search?.querySelector('input[type="search"]');
  if (!input) throw Error("Unsupported local activation surface");
  const originalSearch = search.cloneNode(true);
  const cleanup = [];
  const listen =
    (element) =>
    (type, handler, capture = false) => {
      element.addEventListener(type, handler, capture);
      cleanup.push(() => element.removeEventListener(type, handler, capture));
    };
  let promotion;
  const local = scope(() => {
    if (counter) {
      P(counter.querySelector("[data-exact-text]") ?? counter, "text", () => text(counter));
      onPress(counter, "press", counterAction, listen(counter));
    }
    onValue(input, "input", searchAction, listen(input));
    effect(() => {
      const query = env.s_1(),
        results = env.d_5(),
        pending = env.r_2.p(),
        failed = env.r_2.f();
      for (const node of [...search.children]) if (node !== input) node.remove();
      if (!query) return;
      if (pending || failed || results.length === 0) {
        const page = env.d_0(),
          labels = page?.[5]?.[8];
        const message = document.createElement("div");
        message.role = failed ? "alert" : "status";
        message.textContent = labels?.[failed ? 8 : pending ? 7 : 4] ?? "";
        search.append(message);
      } else
        for (const [title, href] of results) {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = title;
          search.append(link);
        }
    });
  });
  let sheet;
  function loadStyles() {
    if (sheet) return sheet;
    const critical = document.querySelector("style[data-exact-page]");
    if (!critical) return;
    sheet = new Promise((resolve, reject) => {
      const link = Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: "./style.css",
      });
      link.onload = () => {
        critical.remove();
        resolve();
      };
      link.onerror = () => {
        link.remove();
        reject(Error("Full view stylesheet unavailable"));
      };
      critical.before(link);
    });
    return sheet.catch((error) => {
      sheet = undefined;
      throw error;
    });
  }
  function promote() {
    return (promotion ??= Promise.all([view(), loadStyles()]).then(([module]) => {
      for (const stop of cleanup) stop();
      end(local);
      document.removeEventListener("click", navigate, true);
      // Restore only the locally edited search projection; let Exact adopt the remaining SSR tree.
      const query = env.s_1();
      searchAction("");
      search.replaceWith(originalSearch);
      module.default(env);
      searchAction(query);
      exact.activationPhase = "full";
      if (exact.state !== exact.localState || exact.state[0][2] !== exact.counterCell)
        throw Error("Root identity changed during promotion");
    }));
  }
  function navigate(event) {
    const link = event.target.closest?.("#exact-root a[href]");
    if (
      !link ||
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute("download")
    )
      return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    promote()
      .then(() => env.a_1(url.pathname + url.search + url.hash))
      .catch((error) => {
        exact.activationError = String(error);
        console.error(error);
      });
  }
  function copyPage() {
    return promote().then(() => document.querySelector('[data-testid="copy-markdown"]')?.click());
  }
  listen(document)(
    "click",
    (event) => {
      const button = event.target.closest?.('[data-testid="copy-markdown"]');
      if (!button || button.disabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      Promise.resolve(copyPage()).catch((error) => {
        exact.activationError = String(error);
        console.error(error);
      });
    },
    true,
  );
  document.addEventListener("click", navigate, true);
  exact.promote = promote;
  const early = replay ? (exact.taps?.() ?? []) : [];
  for (const event of early)
    if (event.target.isConnected) {
      if (event.type === "click") event.target.click();
      else event.target.dispatchEvent(new Event(event.type, { bubbles: true }));
    }
  // Complete the first empty-search settlement before the first result is requested.
  commit(() => {}, "local bindings ready");
  return {
    copy: copyPage,
    search: searchAction,
    follow: (url) => promote().then(() => env.a_1(url)),
  };
}
