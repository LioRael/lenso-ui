import type { TableKey } from "@lenso/primitives/table/core";
import { inject, type InjectionKey } from "vue";
import type { createTableState } from "./table-state.js";

export type TableVariant = "primary" | "secondary";
export type CollectionItem = { key: TableKey; disabled?: boolean };
export const TableModel: InjectionKey<ReturnType<typeof createTableState>> = Symbol("TableModel");
export const Variant: InjectionKey<() => TableVariant> = Symbol("TableVariant");
export const useTableVariant = () => inject(Variant, () => "primary");
export const WindowIndex: InjectionKey<() => number> = Symbol("TableWindowIndex");
export const TreeParent: InjectionKey<{ level: number; key: () => TableKey | undefined }> =
  Symbol("TableTreeParent");
export const RowState: InjectionKey<{
  key: () => TableKey | undefined;
  disabled: () => boolean;
  expanded: () => boolean;
}> = Symbol("TableRowState");
export const ColumnState: InjectionKey<{
  width: () => number;
  min: () => number;
  max: () => number;
  resize: (width: number) => void;
}> = Symbol("TableColumnState");

export const keyType = [String, Number, BigInt];

export function hasControl(target: EventTarget | null) {
  return (
    target instanceof Element && target.closest("button,input,a,select,textarea,[role=separator]")
  );
}
