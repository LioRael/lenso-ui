export interface WindowOptions {
  rowHeight: number;
  height: number;
  overscan?: number;
}

export function collectionWindow(
  count: number,
  start: number,
  options?: WindowOptions,
  focused?: number | null,
) {
  if (
    !options ||
    options.rowHeight <= 0 ||
    options.height <= 0 ||
    !Number.isFinite(options.height / options.rowHeight)
  )
    return Array.from({ length: count }, (_, index) => index);
  const rows = Math.max(1, Math.ceil(options.height / options.rowHeight));
  const overscan = Number.isFinite(options.overscan)
    ? Math.max(0, Math.trunc(options.overscan!))
    : 3;
  const offset = Math.min(Math.max(0, start), Math.max(0, count - rows));
  const first = Math.max(0, offset - overscan);
  const last = Math.min(count, offset + rows + overscan);
  const indices = Array.from({ length: last - first }, (_, index) => first + index);
  if (focused != null && focused >= 0 && focused < count && !indices.includes(focused)) {
    indices.push(focused);
    indices.sort((a, b) => a - b);
  }
  return indices;
}

export function revealWindowRow(viewport: HTMLElement, index: number, options: WindowOptions) {
  const top = index * options.rowHeight;
  if (top < viewport.scrollTop) viewport.scrollTop = top;
  else if (top + options.rowHeight > viewport.scrollTop + options.height)
    viewport.scrollTop = top + options.rowHeight - options.height;
}
