// A documentation projection host. Native Exact continues to own all root cells and resources.
export function destinationHost({ env, commit, W, effect, scope, end, loads, full, styles }) {
  let epoch = 0,
    disposed = false,
    cancel;
  const key = "exactDocsDestination";
  const entryKey = key + "Entry";
  let serial = 0;
  const scrolls = new Map();
  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = "manual";
  const root = document.getElementById("exact-root");
  const persistent = ['[data-testid="comparison-counter"]', '[data-docs-part="search"]'].map(
    (selector) => [selector, root.querySelector(selector)],
  );
  function syncAttributes(live, next) {
    for (const a of [...live.attributes])
      if (!next.hasAttribute(a.name)) live.removeAttribute(a.name);
    for (const a of next.attributes)
      if (live.getAttribute(a.name) !== a.value) live.setAttribute(a.name, a.value);
  }
  function preserve(live, next) {
    syncAttributes(live, next);
    const input = live.querySelector("input"),
      nextInput = next.querySelector("input");
    if (input && nextInput) {
      const value = input.value;
      syncAttributes(input, nextInput);
      input.value = value;
    }
    return live;
  }
  const clone = (node) => {
    const out = node.cloneNode(true);
    if (out.nodeType === 1)
      for (const [selector, live] of persistent) {
        if (out.matches(selector)) return preserve(live, out);
        const target = out.querySelector(selector);
        if (target) target.replaceWith(preserve(live, target));
      }
    return out;
  };
  const initialHead = {};
  for (const selector of [
    'meta[name="description"]',
    'link[rel="canonical"]',
    'meta[name="robots"]',
  ])
    initialHead[selector] = document.head.querySelector(selector)?.outerHTML ?? null;
  const initialProjection = {
    html: root.outerHTML,
    title: document.title,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    head: initialHead,
  };
  loads.set(location.pathname, () => Promise.resolve(initialProjection));
  let committed = env.s_0();
  let displayedPath = location.pathname;
  let displayedMarkdown = env.r_1()[1];
  const state = (fresh = false) => ({
    ...history.state,
    [key]: committed,
    [entryKey]:
      fresh || !history.state?.[entryKey]
        ? String(performance.timeOrigin) + "-" + ++serial
        : history.state[entryKey],
  });
  const saveScroll = () => {
    if (displayedPath === location.pathname)
      scrolls.set(history.state?.[entryKey], [scrollX, scrollY]);
  };
  addEventListener("scroll", saveScroll, { passive: true });
  history.replaceState(state(), "", location.href);
  function morph(old, next) {
    if (next.nodeType === 1)
      for (const [selector, live] of persistent)
        if (next.matches(selector)) {
          preserve(live, next);
          if (old !== live) old.replaceWith(live);
          return;
        }
    if (old.nodeType !== next.nodeType || old.nodeName !== next.nodeName) {
      old.replaceWith(clone(next));
      return;
    }
    if (old.nodeType !== 1) {
      if (old.nodeValue !== next.nodeValue) old.nodeValue = next.nodeValue;
      return;
    }
    if (old.matches('[data-testid="comparison-counter"]')) return;
    for (const a of [...old.attributes])
      if (!next.hasAttribute(a.name)) old.removeAttribute(a.name);
    for (const a of next.attributes)
      if (old.getAttribute(a.name) !== a.value) old.setAttribute(a.name, a.value);
    if (old.matches('[data-docs-part="search"]')) return;
    let at = 0;
    while (at < next.childNodes.length) {
      const n = next.childNodes[at],
        o = old.childNodes[at];
      if (o) morph(o, n);
      else old.append(clone(n));
      at++;
    }
    while (old.childNodes.length > next.childNodes.length) old.lastChild.remove();
  }
  function settled(path, signal) {
    return new Promise((resolve, reject) => {
      let binding;
      let finished = false;
      const finish = (error) => {
        if (finished) return;
        finished = true;
        queueMicrotask(() => end(binding));
        signal.removeEventListener("abort", abort);
        if (error) reject(error);
        else resolve();
      };
      const abort = () => finish(new DOMException("Superseded", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      binding = scope(() =>
        effect(() => {
          if (env.r_1.p()) return;
          if (env.r_1.f()) finish(Error(env.r_1.r?.error ?? "Document resource failed"));
          else if (env.r_1()[0] === path) finish();
        }),
      );
    });
  }
  async function follow(url, { pop = false, snapshot } = {}) {
    if (disposed) return;
    if (!pop) {
      saveScroll();
      history.replaceState(state(), "", location.href);
    }
    const turn = ++epoch;
    cancel?.abort();
    cancel = new AbortController();
    const signal = cancel.signal;
    const target = new URL(url, location.href),
      current = location.pathname;
    delete globalThis.exact.activationError;
    if (pop && snapshot) {
      committed = snapshot;
      commit(() => W(env.s_0, snapshot));
    } else {
      if (env.s_0() !== committed) commit(() => W(env.s_0, committed));
      env.a_1(target.pathname + target.search + target.hash);
    }
    if (target.pathname === current && target.pathname === displayedPath) {
      committed = env.s_0();
      if (!pop) history.pushState(state(true), "", target);
      if (target.hash)
        document.getElementById(decodeURIComponent(target.hash.slice(1)))?.scrollIntoView();
      else scrollTo(...(pop ? (scrolls.get(history.state?.[entryKey]) ?? [0, 0]) : [0, 0]));
      return;
    }
    if (env.d_0()?.[4] || !loads.has(target.pathname)) {
      committed = env.s_0();
      if (!pop) history.pushState(state(true), "", target);
      await full();
      return;
    }

    try {
      const [projection] = await Promise.all([
        loads.get(target.pathname)(),
        settled(target.pathname, signal),
        styles(),
      ]);
      if (disposed || turn !== epoch) return;
      const template = document.createElement("template");
      template.innerHTML = projection.html;
      committed = env.s_0();
      if (!pop) history.pushState(state(true), "", target);
      morph(root, template.content.firstElementChild);
      displayedPath = target.pathname;
      displayedMarkdown = env.r_1()[1];
      document.title = projection.title;
      document.documentElement.lang = projection.lang;
      document.documentElement.dir = projection.dir;
      for (const selector of [
        'meta[name="description"]',
        'link[rel="canonical"]',
        'meta[name="robots"]',
      ]) {
        const old = document.head.querySelector(selector),
          serialized = projection.head[selector];
        if (serialized) {
          const t = document.createElement("template");
          t.innerHTML = serialized;
          if (old) old.replaceWith(t.content.firstChild);
          else document.head.append(t.content.firstChild);
        } else old?.remove();
      }
      const main = root.querySelector("main");
      if (main) {
        main.tabIndex = -1;
        main.focus({ preventScroll: true });
      }
      if (target.hash)
        document.getElementById(decodeURIComponent(target.hash.slice(1)))?.scrollIntoView();
      else scrollTo(...(pop ? (scrolls.get(history.state?.[entryKey]) ?? [0, 0]) : [0, 0]));
      globalThis.exact.activationPhase = "destination";
    } catch (error) {
      if (error.name === "AbortError" || turn !== epoch) return;
      globalThis.exact.activationError = String(error);
      globalThis.exact.lastNavigationError = String(error);
      commit(() => W(env.s_0, committed));
      const main = root.querySelector("main");
      if (main) {
        const alert = document.createElement("div");
        main.querySelector('[data-docs-part="navigation-error"]')?.remove();
        alert.dataset.docsPart = "navigation-error";
        alert.role = "alert";
        alert.textContent = env.d_0()?.[5]?.[8]?.[6] ?? "Unable to load document";
        main.prepend(alert);
      }
    }
  }
  const pop = (event) => {
    follow(location.href, { pop: true, snapshot: event.state?.[key] }).catch((error) => {
      globalThis.exact.activationError = String(error);
      globalThis.exact.lastNavigationError = String(error);
      commit(() => W(env.s_0, committed));
      console.error(error);
    });
  };
  addEventListener("popstate", pop);
  return {
    follow,
    copy: () => navigator.clipboard?.writeText(displayedMarkdown),
    dispose() {
      disposed = true;
      epoch++;
      cancel?.abort();
      removeEventListener("popstate", pop);
      removeEventListener("scroll", saveScroll);
      history.scrollRestoration = previousRestoration;
    },
  };
}
