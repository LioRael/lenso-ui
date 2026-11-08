export async function probe(
  route: "both" | "reference" | "shared",
  paint: (time: number, route: "both" | "reference" | "shared") => void,
  referenceBackend: string,
  sharedBackend: "ts" | "wasm",
) {
  document.querySelector<HTMLElement>("#baseline")!.hidden = route === "shared";
  document.querySelector<HTMLElement>("#candidate")!.hidden = route === "reference";
  const status = document.querySelector<HTMLElement>("#status")!;
  status.textContent = `Checking ${route} animation for six seconds…`;
  const intervals: number[] = [],
    callbacks: number[] = [];
  const next = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
  let previous = await next();
  const start = previous;
  while (previous - start < 6000) {
    const now = await next();
    if (document.hidden) throw new Error("Probe interrupted: hidden document");
    intervals.push(now - previous);
    previous = now;
    const cpu = performance.now();
    paint(now - start, route);
    callbacks.push(performance.now() - cpu);
  }
  const sorted = [...intervals].sort((a, b) => a - b);
  const record = {
    implementation: "ios27-analytic-v4-ts-default-production-gpu-reference",
    referenceBackend,
    sharedBackend,
    probe: route,
    query: location.search,
    userAgent: navigator.userAgent,
    intervals,
    callbacks,
    frames: intervals.length,
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    max: Math.max(...intervals),
    pass: Math.max(...intervals) <= 100,
  };
  document.querySelector<HTMLElement>("#results")!.textContent = JSON.stringify(record, null, 2);
  status.textContent = `${record.pass ? "No stalls >100 ms" : "Stalls >100 ms detected"}: ${route}, p95 ${record.p95?.toFixed(1)} ms, max ${record.max.toFixed(1)} ms`;
  await fetch("/receipt", { method: "POST", body: JSON.stringify(record) });
}
