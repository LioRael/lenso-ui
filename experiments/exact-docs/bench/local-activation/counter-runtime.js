export function activateCounter({ shared, effect, scope, end, action, text, search }) {
  const exact = (globalThis.exact ??= {});
  exact.ready = true;
  exact.state = shared.state;
  exact.localState = shared.state;
  exact.counterCell = shared.s_2;
  exact.activationPhase = "counter";
  const counter = document.querySelector('[data-testid="comparison-counter"]');
  const input = document.querySelector('[data-docs-part="search"] input');
  exact.activationPhase = counter ? "counter" : "bootstrap";
  if (!input) throw Error("Unsupported counter surface");
  const label = counter?.querySelector("[data-exact-text]") ?? counter;
  const bindings = counter
    ? scope(() =>
        effect(() => {
          label.textContent = text(label);
        }),
      )
    : null;
  const click = () => action();
  counter?.addEventListener("click", click);
  let promise;
  function activate() {
    return (promise ??= search().then((module) => {
      const local = module.default({ replay: false });
      if (bindings) end(bindings);
      counter?.removeEventListener("click", click);
      input.removeEventListener("input", edit);
      document.removeEventListener("click", navigate, true);
      document.removeEventListener("click", copy, true);
      return local;
    }));
  }
  let editEpoch = 0;
  async function edit() {
    const epoch = ++editEpoch;
    try {
      const local = await activate();
      if (epoch === editEpoch) local.search(input.value);
    } catch (error) {
      exact.activationError = String(error);
      console.error(error);
    }
  }
  function navigate(event) {
    const link = event.target.closest?.("#exact-root a[href]");
    if (
      !link ||
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey ||
      link.target ||
      link.hasAttribute("download")
    )
      return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    exact.prepareDestination?.(url.href);
    activate()
      .then((local) => local.follow(url.pathname + url.search + url.hash))
      .catch((error) => {
        exact.activationError = String(error);
        console.error(error);
      });
  }
  function copy(event) {
    const button = event.target.closest?.('[data-testid="copy-markdown"]');
    if (!button || button.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activate()
      .then((local) => local.copy())
      .catch((error) => {
        exact.activationError = String(error);
        console.error(error);
      });
  }
  document.addEventListener("click", copy, true);
  input.addEventListener("input", edit);
  document.addEventListener("click", navigate, true);
  const early = exact.taps?.() ?? [];
  exact.taps = () => [];
  for (const event of early)
    if (event.target.isConnected) {
      if (event.type === "click") event.target.click();
      else event.target.dispatchEvent(new Event(event.type, { bubbles: true }));
    }
}
