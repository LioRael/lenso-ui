import type { TableKey } from "@lenso/primitives/table/core";
import { createOptionalContext } from "../context.js";
import type { createTableState } from "./state.svelte.js";

export const [getTable, setTable] = createOptionalContext<ReturnType<typeof createTableState>>();
export const [getVariant, setVariant] = createOptionalContext<() => "primary" | "secondary">();
export const [getRow, setRow] = createOptionalContext<{
  key: () => TableKey | undefined;
  disabled: () => boolean;
  expanded: () => boolean;
  depth: () => number;
  hasChildItems: () => boolean;
}>();
export const [getColumn, setColumn] = createOptionalContext<{
  width: () => number;
  min: () => number;
  max: () => number;
  resize: (width: number) => void;
}>();

export const [getDepth, setDepth] = createOptionalContext<() => number>();
export const [getWindowRow, setWindowRow] =
  createOptionalContext<() => { index: number; height: number } | undefined>();

export function hasControl(target: EventTarget | null) {
  return (
    target instanceof Element && target.closest("button,input,a,select,textarea,[role=separator]")
  );
}
