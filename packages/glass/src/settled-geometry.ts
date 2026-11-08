/** Allow resize notifications to invalidate a fit before expensive maps are encoded. */
export function afterGeometrySettles(run: () => void) {
  let canceled = false;
  let frame = requestAnimationFrame(() => {
    if (canceled) return;
    frame = requestAnimationFrame(() => {
      if (!canceled) run();
    });
  });
  return () => {
    canceled = true;
    cancelAnimationFrame(frame);
  };
}
