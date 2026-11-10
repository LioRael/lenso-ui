import { search } from "./search-scopes";

let count = 0,
  query = "",
  revision = 0;
function bind() {
  const counter = document.querySelector<HTMLButtonElement>('[data-testid="comparison-counter"]');
  if (counter && !counter.dataset.bound) {
    counter.dataset.bound = "true";
    counter.textContent = `Count: ${count}`;
    counter.addEventListener("click", () => {
      counter.textContent = `Count: ${++count}`;
    });
  }
  const input = document.querySelector<HTMLInputElement>('input[type="search"]');
  const results = document.querySelector<HTMLElement>("[data-search-results]");
  const feedback = document.querySelector<HTMLElement>("[data-search-feedback]");
  if (!input || !results || !feedback || input.dataset.bound) return;
  input.dataset.bound = "true";
  input.value = query;
  const scope = document.body.dataset.benchmarkScope!;
  async function run() {
    const current = ++revision,
      value = query.trim().toLowerCase();
    results!.replaceChildren();
    feedback!.textContent = value ? "Searching documentation" : "";
    if (!value) return;
    try {
      const items = await search(scope, value);
      if (current !== revision || !input!.isConnected) return;
      feedback!.textContent = items.length ? "" : "No pages found";
      results!.replaceChildren(
        ...items.map((item) => {
          const link = document.createElement("a");
          link.href = item.href;
          link.textContent = item.title;
          link.dataset.astroPrefetch = "false";
          return link;
        }),
      );
    } catch {
      if (current === revision)
        feedback!.textContent = "Search could not be loaded. Reload the page to try again.";
    }
  }
  input.addEventListener("input", () => {
    query = input.value;
    void run();
  });
  document.querySelector<HTMLButtonElement>("[data-copy]")?.addEventListener("click", () => {
    const raw = document.getElementById("comparison-markdown")?.textContent;
    if (raw) void navigator.clipboard.writeText(JSON.parse(raw));
  });
  void run();
}
bind();
document.addEventListener("astro:page-load", bind);
