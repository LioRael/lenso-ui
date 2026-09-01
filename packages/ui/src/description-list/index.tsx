"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { createStyledPart } from "../shared/styled-part.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./description-list.stylex.js";

export type DescriptionListLayout = "inline" | "stacked";

interface DescriptionListContextValue {
  layout: DescriptionListLayout;
}

const DescriptionListContext = React.createContext<DescriptionListContextValue>({
  layout: "inline",
});

export interface DescriptionListRootProps extends StyleXProps<
  React.ComponentPropsWithoutRef<"dl">
> {
  layout?: DescriptionListLayout;
}

export const DescriptionListRoot = React.forwardRef<HTMLDListElement, DescriptionListRootProps>(
  function DescriptionListRoot({ layout = "inline", xstyle, ...props }, ref) {
    const value = React.useMemo(() => ({ layout }), [layout]);
    return (
      <DescriptionListContext.Provider value={value}>
        <dl
          {...props}
          {...stylex.props(styles.root, xstyle)}
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
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function DescriptionListItem({ xstyle, ...props }, ref) {
  const { layout } = React.useContext(DescriptionListContext);
  return (
    <div
      {...props}
      {...stylex.props(styles.item, layout === "stacked" && styles.stackedItem, xstyle)}
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
