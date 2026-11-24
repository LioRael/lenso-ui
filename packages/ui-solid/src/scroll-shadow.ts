import { scrollShadowStyles } from "@lenso/tokens/scroll-shadow";
import { htmlPart } from "./parts.js";

export const ScrollShadowRoot = htmlPart<
  "div",
  { orientation?: "horizontal" | "vertical"; hideScrollBar?: boolean }
>(
  "div",
  "scroll-shadow",
  (props) => [
    scrollShadowStyles.root,
    scrollShadowStyles[props.orientation ?? "vertical"],
    props.orientation === "horizontal"
      ? scrollShadowStyles.horizontalTimeline
      : scrollShadowStyles.verticalTimeline,
    props.hideScrollBar && scrollShadowStyles.hideScrollBar,
    scrollShadowStyles.automatic,
    props.orientation === "horizontal"
      ? scrollShadowStyles.horizontalMask
      : scrollShadowStyles.verticalMask,
  ],
  "orientation",
  "hideScrollBar",
);

export const ScrollShadow = Object.assign(ScrollShadowRoot, {
  Root: ScrollShadowRoot,
});
