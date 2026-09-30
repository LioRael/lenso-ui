import type { Key } from "react";

export type ColumnWidth = number | `${number}%` | `${number}fr`;
export interface ColumnSize {
  key: Key;
  width?: ColumnWidth;
  min: number;
  max: number;
}

/** Freeze bounded columns before redistributing the remaining flexible space. */
export function resolveColumnWidths(
  columns: readonly ColumnSize[],
  available: number,
  resized: ReadonlyMap<Key, number>,
) {
  const result = new Map<Key, number>();
  let remaining = available;
  const flexible: { column: ColumnSize; weight: number }[] = [];
  for (const column of columns) {
    const width = resized.get(column.key) ?? column.width;
    if (typeof width === "number" || width?.endsWith("%")) {
      const pixels = typeof width === "number" ? width : (available * parseFloat(width!)) / 100;
      const bounded = Math.min(column.max, Math.max(column.min, pixels));
      result.set(column.key, bounded);
      remaining -= bounded;
    } else {
      flexible.push({ column, weight: width ? Math.max(0.001, parseFloat(width)) : 1 });
    }
  }
  while (flexible.length) {
    const total = flexible.reduce((sum, entry) => sum + entry.weight, 0);
    const bounded = flexible.find(({ column, weight }) => {
      const proposed = (remaining * weight) / total;
      return proposed < column.min || proposed > column.max;
    });
    if (!bounded) {
      for (const { column, weight } of flexible)
        result.set(column.key, (remaining * weight) / total);
      break;
    }
    const width = Math.min(
      bounded.column.max,
      Math.max(bounded.column.min, (remaining * bounded.weight) / total),
    );
    result.set(bounded.column.key, width);
    remaining -= width;
    flexible.splice(flexible.indexOf(bounded), 1);
  }
  return result;
}
