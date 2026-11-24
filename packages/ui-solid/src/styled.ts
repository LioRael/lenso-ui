import type { JSX } from "@solidjs/web";
import type * as stylex from "@stylexjs/stylex";

export type StyleXArgument = stylex.StyleXArray<
  | stylex.CompiledStyles
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
  | false
  | null
  | undefined
>;
export type StyleXProps = { xstyle?: StyleXArgument };

type InlineStyle = JSX.CSSProperties | string | undefined;

export function styled<State>(
  compiled: () => ReturnType<typeof stylex.props>,
  props: {
    class?: JSX.ClassValue | ((state: State) => JSX.ClassValue);
    style?: InlineStyle | false | ((state: State) => InlineStyle);
  },
) {
  return {
    get "data-style-src"() {
      return compiled()["data-style-src"];
    },
    class: (state: State): JSX.ClassValue => [
      compiled().className,
      typeof props.class === "function" ? props.class(state) : props.class,
    ],
    style: (state: State): InlineStyle => {
      const base = compiled().style;
      const style = typeof props.style === "function" ? props.style(state) : props.style;
      if (!base) return style || undefined;
      if (typeof style === "string") {
        const vars = Object.entries(base).map(([name, value]) => `${name}:${value};`);
        return vars.join("") + style;
      }
      return { ...base, ...style };
    },
  };
}
