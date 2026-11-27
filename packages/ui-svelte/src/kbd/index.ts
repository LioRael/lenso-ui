import KbdRoot from "./kbd-root.svelte";
import KbdAbbr from "./kbd-abbr.svelte";
import KbdContent from "./kbd-content.svelte";

export { KbdRoot, KbdAbbr, KbdContent };
export const Kbd: typeof KbdRoot & {
  Root: typeof KbdRoot;
  Abbr: typeof KbdAbbr;
  Content: typeof KbdContent;
} = Object.assign(KbdRoot, {
  Root: KbdRoot,
  Abbr: KbdAbbr,
  Content: KbdContent,
});
