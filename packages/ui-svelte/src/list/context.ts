import type { list } from "@lenso/primitives/list/core";
import type { StateOf } from "@ui-sdk/core";
import type { PrimitiveHandle } from "@ui-sdk/svelte/primitive";
import { createOptionalContext } from "../context.js";

export const [getList, setList] = createOptionalContext<{
  handle: PrimitiveHandle<typeof list>;
  state: () => StateOf<typeof list, "root">;
}>();
export const [getSection, setSection] = createOptionalContext<() => string | undefined>();
