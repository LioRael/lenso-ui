export function selectionRange(
  initial: ReadonlySet<number>,
  ids: readonly number[],
  anchor: number,
  endpoint: number,
) {
  const next = new Set(initial);
  const remove = initial.has(ids[anchor]!);
  for (let i = Math.min(anchor, endpoint); i <= Math.max(anchor, endpoint); i++) {
    const id = ids[i];
    if (id === undefined) continue;
    if (remove) next.delete(id);
    else next.add(id);
  }
  return next;
}
