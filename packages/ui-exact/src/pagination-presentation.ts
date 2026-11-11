import * as stylex from "@stylexjs/stylex";
import { paginationStyles, paginationSizes, paginationPress } from "@lenso/tokens/pagination";
import { linkStyles } from "@lenso/tokens/link";

const direction = stylex.create({
  icon: {
    transform: {
      default: "none",
      ':is([data-slot="pagination"][data-lenso-direction="rtl"] *)': "rotate(180deg)",
      ':is([data-slot="pagination"][data-lenso-direction="ltr"] *)': "none",
    },
  },
});

export const paginationKinds = [
  "pagination",
  "pagination-content",
  "pagination-item",
  "pagination-icon",
];

export function paginationPresentation(kind: string, data: DOMStringMap) {
  switch (kind) {
    case "pagination":
      return [paginationStyles.root];
    case "pagination-content":
      return [paginationStyles.content];
    case "pagination-item":
      return [paginationStyles.item];
    case "pagination-icon":
      return [paginationStyles.icon, direction.icon];
  }
  if (
    ![
      "pagination-link",
      "pagination-previous",
      "pagination-next",
      "pagination-summary",
      "pagination-ellipsis",
    ].includes(kind)
  )
    return undefined;
  const size = data["lensoSize"];
  if (size !== "sm" && size !== "md" && size !== "lg")
    throw new RangeError(`Lenso Pagination size must be sm, md or lg; received ${size}`);
  if (kind === "pagination-summary")
    return [
      paginationStyles.summary,
      size === "sm" && paginationStyles.summarySm,
      size === "lg" && paginationStyles.summaryLg,
    ];
  if (kind === "pagination-ellipsis") return [paginationStyles.ellipsis, paginationSizes[size]];
  const navigation = kind !== "pagination-link";
  return [
    linkStyles.root,
    paginationStyles.link,
    paginationSizes[size],
    paginationPress[size],
    data["lensoActive"] === "true" && paginationStyles.active,
    navigation && paginationStyles.nav,
    navigation && size === "sm" && paginationStyles.navSm,
    navigation && size === "lg" && paginationStyles.navLg,
  ];
}
