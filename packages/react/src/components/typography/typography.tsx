"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { type ComponentProps } from "react";
import { useRender } from "@base-ui/react/use-render";
import {
  typographyStyles,
  typographyTypes,
  typographyAligns,
  typographyColors,
  typographyWeights,
  proseCss,
} from "@lenso/tokens/typography";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
const tags = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  "body-sm": "p",
  "body-xs": "p",
  code: "code",
} as const;
export type TypographyRootProps = StyleXProps<useRender.ComponentProps<"p">> & {
  type?: keyof typeof typographyTypes;
  align?: keyof typeof typographyAligns;
  color?: keyof typeof typographyColors;
  weight?: keyof typeof typographyWeights;
  truncate?: boolean;
};
export function TypographyRoot({
  type = "body",
  align = "start",
  color = "default",
  weight,
  truncate = false,
  xstyle,
  style,
  render,
  ref,
  ...props
}: TypographyRootProps) {
  const compiled = stylex.props(
    typographyStyles.root,
    typographyTypes[type],
    typographyAligns[align],
    typographyColors[color],
    weight && typographyWeights[weight],
    truncate && typographyStyles.truncate,
    xstyle,
  );
  return useRender({
    render,
    ref,
    defaultTagName: tags[type],
    props: {
      "data-type": type,
      ...props,
      "data-slot": (props as { "data-slot"?: string })["data-slot"] ?? "typography",
      ...compiled,
      style: { ...compiled.style, ...style },
    },
  });
}
export type HeadingProps = Omit<TypographyRootProps, "type"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 };
export function Heading({ level = 1, ...props }: HeadingProps) {
  return <TypographyRoot type={`h${level}`} {...props} />;
}
export type ParagraphProps = Omit<TypographyRootProps, "type"> & { size?: "base" | "sm" | "xs" };
export function Paragraph({ size = "base", ...props }: ParagraphProps) {
  return <TypographyRoot type={size === "base" ? "body" : `body-${size}`} {...props} />;
}
export type CodeProps = Omit<TypographyRootProps, "type">;
export function Code(props: CodeProps) {
  return <TypographyRoot type="code" {...props} />;
}
export type ProseProps = StyleXProps<ComponentProps<"div">>;
export function Prose({ children, xstyle, style, ...props }: ProseProps) {
  const compiled = stylex.props(typographyStyles.root, xstyle);
  return (
    <>
      <style href="lenso-typography-prose" precedence="lenso-components">
        {proseCss}
      </style>
      <div
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "prose"}
        {...compiled}
        style={{ ...compiled.style, ...style }}
        data-prose-root=""
      >
        {children}
      </div>
    </>
  );
}
export const Typography = Object.assign(TypographyRoot, {
  Root: TypographyRoot,
  Heading,
  Paragraph,
  Code,
  Prose,
});
export type TypographyProps = TypographyRootProps;
export type Typography = {
  Props: TypographyProps;
  RootProps: TypographyRootProps;
  HeadingProps: HeadingProps;
  ParagraphProps: ParagraphProps;
  CodeProps: CodeProps;
  ProseProps: ProseProps;
};
