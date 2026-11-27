import {
  typographyStyles,
  typographyTypes,
  typographyAligns,
  typographyColors,
  typographyWeights,
} from "@lenso/tokens/typography";
import { htmlPart } from "./parts.js";

export const TypographyRoot = htmlPart<
  "span",
  {
    type?: keyof typeof typographyTypes;
    align?: keyof typeof typographyAligns;
    color?: keyof typeof typographyColors;
    weight?: keyof typeof typographyWeights;
    truncate?: boolean;
  }
>(
  "span",
  "typography",
  (props) => [
    typographyStyles.root,
    typographyTypes[props.type ?? "body"],
    typographyAligns[props.align ?? "start"],
    typographyColors[props.color ?? "default"],
    props.weight && typographyWeights[props.weight],
    props.truncate && typographyStyles.truncate,
  ],
  "type",
  "align",
  "color",
  "weight",
  "truncate",
);
export const TypographyHeading = htmlPart("h2", "typography-heading", () => typographyStyles.root);
export const TypographyParagraph = htmlPart(
  "p",
  "typography-paragraph",
  () => typographyStyles.root,
);
export const TypographyCode = htmlPart("code", "typography-code", () => [
  typographyStyles.root,
  typographyTypes.code,
]);
export const TypographyProse = htmlPart("div", "typography-prose", () => typographyStyles.root);

export const Typography: typeof TypographyRoot & {
  Root: typeof TypographyRoot;
  Heading: typeof TypographyHeading;
  Paragraph: typeof TypographyParagraph;
  Code: typeof TypographyCode;
  Prose: typeof TypographyProse;
} = Object.assign(TypographyRoot, {
  Root: TypographyRoot,
  Heading: TypographyHeading,
  Paragraph: TypographyParagraph,
  Code: TypographyCode,
  Prose: TypographyProse,
});

export const Code: typeof Typography.Code = Typography.Code;

export const Heading: typeof Typography.Heading = Typography.Heading;

export const Paragraph: typeof Typography.Paragraph = Typography.Paragraph;

export const Prose: typeof Typography.Prose = Typography.Prose;
