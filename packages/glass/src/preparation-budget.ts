/** Cooperating source providers yield small preparation slices to the next frame. */
export function createPreparationCheckpoint(
  signal: AbortSignal,
  view: Pick<Window, "performance" | "requestAnimationFrame" | "cancelAnimationFrame">,
): () => Promise<boolean> {
  let started = view.performance.now();
  return async () => {
    if (signal.aborted) return false;
    if (view.performance.now() - started < 4) return true;
    return new Promise<boolean>((resolve) => {
      let frame: number;
      const finish = () => {
        view.cancelAnimationFrame(frame);
        signal.removeEventListener("abort", finish);
        started = view.performance.now();
        resolve(!signal.aborted);
      };
      frame = view.requestAnimationFrame(finish);
      signal.addEventListener("abort", finish, { once: true });
      if (signal.aborted) finish();
    });
  };
}
