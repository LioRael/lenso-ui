import TypographyRoot from "./typography-root.svelte";
import TypographyHeading from "./typography-heading.svelte";
import TypographyParagraph from "./typography-paragraph.svelte";
import TypographyCode from "./typography-code.svelte";
import TypographyProse from "./typography-prose.svelte";

export { TypographyRoot, TypographyHeading, TypographyParagraph, TypographyCode, TypographyProse };
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
