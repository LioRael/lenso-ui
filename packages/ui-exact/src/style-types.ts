import type { CompiledStyles, InlineStyles } from "@stylexjs/stylex";
import type { StyleXArray } from "@stylexjs/stylex/lib/types/StyleXTypes";

/** The compiled maps, arrays and conditions accepted by StyleX composition. */
export type StyleInput = StyleXArray<
  CompiledStyles | boolean | null | undefined | Readonly<[CompiledStyles, InlineStyles]>
>;
