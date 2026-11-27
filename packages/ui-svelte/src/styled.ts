import * as stylex from "@stylexjs/stylex";
import type { ClassValue } from "svelte/elements";

export type StyleXArgument = stylex.StyleXArray<
  | stylex.CompiledStyles
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
  | false
  | null
  | undefined
>;

export type StyleXProps = {
  xstyle?: StyleXArgument;
  "data-lenso-slot"?: string;
};

export function attributes(...styles: StyleXArgument[]) {
  return stylex.attrs(...styles);
}

export function styled(
  base: StyleXArgument,
  override: StyleXArgument,
  className: ClassValue | null | undefined,
  style: string | null | undefined,
) {
  const attributes = stylex.attrs(base, override);
  return {
    ...attributes,
    class: [attributes.class, className],
    style: [attributes.style, style].filter(Boolean).join(";") || undefined,
  };
}
