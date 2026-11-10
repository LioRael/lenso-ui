import type { SegmentedControlItem } from "./types";

export function stepperValue(value: number, min: number, max: number, step: number) {
  if (![value, min, max, step].every(Number.isFinite) || max < min || !(step > 0)) {
    throw new Error("Stepper requires finite values, min <= max and a positive step.");
  }
  return Math.max(min, Math.min(max, value));
}
export function validateSegments(items: readonly SegmentedControlItem[]) {
  const keys = new Set<string>();
  for (const item of items) {
    if (!item.value || keys.has(item.value))
      throw new Error("Segment values must be nonempty and unique.");
    keys.add(item.value);
  }
}
export function toggleSelection(values: readonly string[], value: string, selected: boolean) {
  return selected
    ? Array.from(new Set([...values, value]))
    : values.filter((item) => item !== value);
}
