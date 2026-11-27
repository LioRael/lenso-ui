import * as stylex from "@stylexjs/stylex";
import {
  camelize,
  defineComponent,
  h,
  type Component,
  type IntrinsicElementAttributes,
  type PublicProps,
} from "vue";

export type StyleXArgument = stylex.StyleXArray<
  | stylex.CompiledStyles
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
  | false
  | null
  | undefined
>;

export type SlotProps = {
  xstyle?: StyleXArgument;
  "data-lenso-slot"?: string;
  [attribute: `data${Capitalize<string>}`]: unknown;
};

type VuePart = Component & (new (...args: never[]) => { $props: object });
export type ComponentProps<C extends VuePart> = InstanceType<C>["$props"];
export type StyledPart<C extends VuePart, Own extends object = Record<never, never>> = Pick<
  C,
  keyof C
> &
  (new () => Omit<InstanceType<C>, "$props"> & { $props: ComponentProps<C> & Own & SlotProps });

export function partAttributes(
  slot: string,
  styles: StyleXArgument,
  { xstyle, class: className, style, ...attrs }: Record<string, unknown>,
) {
  const compiled = stylex.attrs(styles, xstyle as StyleXArgument);
  return {
    "data-lenso-slot": slot,
    ...attrs,
    ...compiled,
    class: [compiled.class, className],
    style: [compiled.style, style],
  };
}

function styledPart<Props extends object>(
  part: Component | string,
  slot: string,
  styles: (props: Props) => StyleXArgument,
  presentationProps: readonly (keyof Props)[],
) {
  return defineComponent({
    name: "Lenso-" + slot,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const forwarded = { ...attrs };
        const presentation = Object.fromEntries(
          Object.entries(attrs).map(([name, value]) => [camelize(name), value]),
        );
        for (const key of presentationProps) {
          const name = String(key);
          const kebab = name.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
          const value = attrs[name] ?? attrs[kebab];
          presentation[name] = value === "" ? true : value;
          delete forwarded[name];
          delete forwarded[kebab];
        }
        const attributes = partAttributes(slot, styles(presentation as Props), forwarded);
        return typeof part === "string"
          ? h(part, attributes, slots["default"]?.())
          : h(part, attributes, slots);
      };
    },
  });
}

export function sdkPart<C extends VuePart, Own extends object = Record<never, never>>(
  part: C,
  slot: string,
  styles: (props: ComponentProps<C> & Own) => StyleXArgument,
  ...keys: (keyof Own)[]
): StyledPart<C, Own> {
  return styledPart(part, slot, styles, keys) as unknown as StyledPart<C, Own>;
}

type HtmlProps<
  Tag extends keyof IntrinsicElementAttributes,
  Own,
> = IntrinsicElementAttributes[Tag] & Own & PublicProps & SlotProps;

export type HtmlPart<
  Tag extends keyof IntrinsicElementAttributes,
  Own = Record<never, never>,
> = new () => {
  $props: HtmlProps<Tag, Own>;
};

export function htmlPart<
  Tag extends keyof IntrinsicElementAttributes,
  Own extends object = Record<never, never>,
>(
  tag: Tag,
  slot: string,
  styles: (props: HtmlProps<Tag, Own>) => StyleXArgument,
  ...keys: (keyof Own)[]
): HtmlPart<Tag, Own> {
  return styledPart(tag, slot, styles, keys) as unknown as HtmlPart<Tag, Own>;
}

export function forwardPart<C extends VuePart>(part: C): C {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h(part, attrs, slots);
    },
  }) as unknown as C;
}
