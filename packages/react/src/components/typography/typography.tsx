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
import { styledPart, type StyleXProps } from "../../utils/styled.js";
function SemanticText({
  render,
  ref,
  tag,
  ...props
}: useRender.ComponentProps<"p"> & {
  tag: keyof React.JSX.IntrinsicElements;
}) {
  return useRender({ render, ref, props, defaultTagName: tag });
}
const Part = styledPart(SemanticText, "typography", typographyStyles.root);
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
  ...props
}: TypographyRootProps) {
  return (
    <Part
      data-type={type}
      {...props}
      tag={tags[type]}
      xstyle={[
        typographyTypes[type],
        typographyAligns[align],
        typographyColors[color],
        weight && typographyWeights[weight],
        truncate && typographyStyles.truncate,
        xstyle,
      ]}
    />
  );
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
const ProseRoot = styledPart("div", "prose", typographyStyles.root);
export type ProseProps = ComponentProps<typeof ProseRoot>;
export function Prose({ children, ...props }: ProseProps) {
  return (
    <>
      <style href="lenso-typography-prose" precedence="lenso-components">
        {proseCss}
      </style>
      <ProseRoot {...props} data-prose-root="">
        {children}
      </ProseRoot>
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
