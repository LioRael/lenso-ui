export type SelectionMode = "none" | "single" | "multiple";
export function selectionMode(mode: string): SelectionMode {
  if (mode !== "none" && mode !== "single" && mode !== "multiple")
    throw new RangeError(`Unknown selection mode: ${mode}`);
  return mode;
}
export function selectCollection(
  keys: readonly string[],
  selected: readonly string[],
  target: string,
  mode: SelectionMode,
  anchor?: string,
  previousRange: readonly string[] = [],
) {
  if (!keys.includes(target) || mode === "none")
    return { value: [...selected], range: [] as string[] };
  if (mode === "single") return { value: [target], range: [] as string[] };
  if (anchor !== undefined && keys.includes(anchor)) {
    const start = keys.indexOf(anchor),
      end = keys.indexOf(target);
    const range = keys.slice(Math.min(start, end), Math.max(start, end) + 1);
    return {
      value: [...new Set([...selected.filter((k) => !previousRange.includes(k)), ...range])],
      range,
    };
  }
  return {
    value: selected.includes(target) ? selected.filter((k) => k !== target) : [...selected, target],
    range: [target],
  };
}
