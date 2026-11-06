const waiting = new Map<HTMLElement, Set<() => void>>();
let observer: IntersectionObserver | undefined;

/** Prepare nearby lenses once; keep their existing cache and refit lifecycle thereafter. */
export function whenNearViewport(element: HTMLElement, ready: () => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    ready();
    return () => undefined;
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const callbacks = waiting.get(element);
        waiting.delete(element);
        observer?.unobserve(element);
        for (const callback of callbacks ?? []) callback();
      }
      if (!waiting.size) {
        observer?.disconnect();
        observer = undefined;
      }
    },
    { rootMargin: "128px" },
  );
  let callbacks = waiting.get(element);
  if (!callbacks) {
    callbacks = new Set();
    waiting.set(element, callbacks);
    observer.observe(element);
  }
  callbacks.add(ready);
  return () => {
    callbacks.delete(ready);
    if (callbacks.size || waiting.get(element) !== callbacks) return;
    waiting.delete(element);
    observer?.unobserve(element);
    if (!waiting.size) {
      observer?.disconnect();
      observer = undefined;
    }
  };
}
