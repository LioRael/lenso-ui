"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { mergeClassName } from "../shared/merge-class-name.js";
import { createStyledPart } from "../shared/styled-part.js";
import { styles } from "./description-list.stylex.js";

export type DescriptionListLayout = "inline" | "stacked";

interface DescriptionListContextValue {
  layout: DescriptionListLayout;
}

const DescriptionListContext = React.createContext<DescriptionListContextValue>({
  layout: "inline",
});

export interface DescriptionListRootProps extends React.ComponentPropsWithoutRef<"dl"> {
  layout?: DescriptionListLayout;
}

export const DescriptionListRoot = React.forwardRef<HTMLDListElement, DescriptionListRootProps>(
  function DescriptionListRoot({ className, layout = "inline", ...props }, ref) {
    const value = React.useMemo(() => ({ layout }), [layout]);
    return (
      <DescriptionListContext.Provider value={value}>
        <dl
          {...props}
          className={mergeClassName(stylex.props(styles.root).className, className) as string}
          data-layout={layout}
          data-slot="description-list"
          ref={ref}
        />
      </DescriptionListContext.Provider>
    );
  },
);

export const DescriptionListItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function DescriptionListItem({ className, ...props }, ref) {
  const { layout } = React.useContext(DescriptionListContext);
  return (
    <div
      {...props}
      className={
        mergeClassName(
          stylex.props(styles.item, layout === "stacked" && styles.stackedItem).className,
          className,
        ) as string
      }
      data-layout={layout}
      data-slot="description-list-item"
      ref={ref}
    />
  );
});

export const DescriptionListTerm = createStyledPart("dt", "description-list-term", styles.term);
export const DescriptionListDescription = createStyledPart(
  "dd",
  "description-list-description",
  styles.description,
);

export const DescriptionList = {
  Description: DescriptionListDescription,
  Item: DescriptionListItem,
  Root: DescriptionListRoot,
  Term: DescriptionListTerm,
} as const;
