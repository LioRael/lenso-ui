import { kbdStyles } from "@lenso/tokens/kbd";
import { htmlPart } from "./parts.js";

export const KbdRoot = htmlPart<"kbd", { variant?: "default" | "light" }>(
  "kbd",
  "kbd",
  (props) => [kbdStyles.root, props.variant === "light" && kbdStyles.light],
  "variant",
);
export const KbdAbbr = htmlPart("abbr", "kbd-abbr", () => kbdStyles.abbr);
export const KbdContent = htmlPart("span", "kbd-content", () => kbdStyles.content);

export const Kbd: typeof KbdRoot & {
  Root: typeof KbdRoot;
  Abbr: typeof KbdAbbr;
  Content: typeof KbdContent;
} = Object.assign(KbdRoot, {
  Root: KbdRoot,
  Abbr: KbdAbbr,
  Content: KbdContent,
});
