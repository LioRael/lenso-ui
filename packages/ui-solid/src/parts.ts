import { Dynamic, type DynamicProps, type JSX } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { createComponent, createMemo, merge, omit, type Component } from "solid-js";
import { styled, type StyleXArgument, type StyleXProps } from "./styled.js";

export type SlotProps = StyleXProps & { "data-lenso-slot"?: string };
export type StyledPart<
  C extends (props: never) => JSX.Element,
  Own extends object = Record<never, never>,
> = Component<Parameters<C>[0] & Own & SlotProps>;
type StyledProps = Parameters<typeof styled<never>>[1];
type NativeTag = keyof JSX.IntrinsicElements;

export function sdkPart<Props extends object, Own extends object = Record<never, never>>(
  part: Component<Props>,
  slot: string,
  styles: (props: Props & Own) => StyleXArgument,
  ...keys: (keyof Own)[]
) {
  return (props: Props & Own & SlotProps) => {
    const compiled = createMemo(() => {
      const base = styles(props);
      return stylex.props(base, props.xstyle);
    });
    const rest = omit(props as typeof props & StyledProps, ...keys, "xstyle", "class", "style");
    return createComponent(
      part,
      merge({ "data-lenso-slot": slot }, rest, styled(compiled, props as StyledProps)) as Props,
    );
  };
}

export function htmlPart<Tag extends NativeTag, Own extends object = Record<never, never>>(
  tag: Tag,
  slot: string,
  styles: (props: JSX.IntrinsicElements[Tag] & Own) => StyleXArgument,
  ...keys: (keyof Own)[]
) {
  return (props: JSX.IntrinsicElements[Tag] & Own & SlotProps) => {
    const compiled = createMemo(() => {
      const base = styles(props);
      return stylex.props(base, props.xstyle);
    });
    const presentation = styled<undefined>(compiled, props);
    const rest = omit(props, ...keys, "xstyle", "class", "style");
    return createComponent(
      Dynamic<Tag>,
      merge({ "data-lenso-slot": slot }, rest, {
        component: tag,
        get "data-style-src"() {
          return presentation["data-style-src"];
        },
        get class() {
          return presentation.class(undefined);
        },
        get style() {
          return presentation.style(undefined);
        },
      }) as DynamicProps<Tag>,
    );
  };
}

export function attributes(...styles: StyleXArgument[]) {
  return stylex.attrs(...styles);
}
