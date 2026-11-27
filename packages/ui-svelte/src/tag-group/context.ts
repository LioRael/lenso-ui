import type { ModelControlOptions, tagGroup } from "@lenso/primitives/model-control";
import type { TableKey } from "@lenso/primitives/table/core";
import type { PrimitiveHandle } from "@ui-sdk/svelte/primitive";
import { createOptionalContext } from "../context.js";

export type TagGroupItem = { key: TableKey; textValue: string; disabled?: boolean };
export type TagGroupSize = "sm" | "md" | "lg";
export type TagGroupVariant = "default" | "surface";
export const tagId = (key: TableKey) => `${typeof key}:${String(key)}`;
export const [getTagGroup, setTagGroup] = createOptionalContext<{
  handle: PrimitiveHandle<typeof tagGroup>;
  state: () => ReturnType<typeof tagGroup>["types"]["state"];
  items: () => readonly TagGroupItem[] | undefined;
  removable: () => boolean;
  mode: () => "none" | "single" | "multiple";
  size: () => TagGroupSize;
  variant: () => TagGroupVariant;
  disabled: () => boolean;
  isDisabled: (key: TableKey) => boolean;
  isSelected: (key: TableKey) => boolean;
  isRemoved: (key: TableKey) => boolean;
  register: (key: TableKey, element: HTMLElement, disabled: boolean) => () => void;
  select: (key: TableKey, event: Event, from?: string) => void;
  extend: (id: string, event: KeyboardEvent, from: string) => void;
  remove: (key: TableKey) => void;
}>();
export const [getTag, setTag] = createOptionalContext<{
  label: () => string;
  disabled: () => boolean;
  remove: (event: MouseEvent) => void;
}>();
export type TagGroupMode = "none" | "single" | "multiple";
export type TagGroupController = NonNullable<ModelControlOptions["controller"]>;

export const TagGroupContext = { get: getTagGroup, set: setTagGroup };
