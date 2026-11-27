import { paginationStyles } from "@lenso/tokens/pagination";
import { defineComponent, h, type Component } from "vue";
import { htmlPart } from "./parts.js";

export const PaginationRoot = htmlPart("nav", "pagination", () => paginationStyles.root);
export const PaginationContent = htmlPart(
  "ul",
  "pagination-content",
  () => paginationStyles.content,
);
export const PaginationItem = htmlPart("li", "pagination-item", () => paginationStyles.item);
export const PaginationLink = htmlPart("a", "pagination-link", () => paginationStyles.link);
export const PaginationPrevious = htmlPart("a", "pagination-previous", () => paginationStyles.link);
export const PaginationNext = htmlPart("a", "pagination-next", () => paginationStyles.link);
export const PaginationEllipsis = htmlPart(
  "span",
  "pagination-ellipsis",
  () => paginationStyles.ellipsis,
);
export const PaginationSummary = htmlPart(
  "div",
  "pagination-summary",
  () => paginationStyles.summary,
);

const PaginationNextIconBase = htmlPart(
  "span",
  "pagination-next-icon",
  () => paginationStyles.icon,
);
const PaginationPreviousIconBase = htmlPart(
  "span",
  "pagination-previous-icon",
  () => paginationStyles.icon,
);
function arrowPart<C extends Component>(part: C, path: string): C {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          part,
          { "aria-hidden": "true", ...attrs },
          {
            default:
              slots["default"] ??
              (() =>
                h(
                  "svg",
                  {
                    viewBox: "0 0 16 16",
                    width: "100%",
                    height: "100%",
                    fill: "none",
                  },
                  [
                    h("path", {
                      d: path,
                      stroke: "currentColor",
                      "stroke-width": "1.5",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                    }),
                  ],
                )),
          },
        );
    },
  }) as unknown as C;
}
export const PaginationNextIcon = arrowPart(PaginationNextIconBase, "m6 4 4 4-4 4");
export const PaginationPreviousIcon = arrowPart(PaginationPreviousIconBase, "m10 4-4 4 4 4");
export const Pagination = Object.assign(PaginationRoot, {
  NextIcon: PaginationNextIcon,
  PreviousIcon: PaginationPreviousIcon,
  Root: PaginationRoot,
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
  Summary: PaginationSummary,
});
