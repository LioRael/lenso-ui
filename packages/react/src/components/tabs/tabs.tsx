"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { createContext, useContext, useRef, type ComponentProps } from "react";
import { tabsStyles } from "@lenso/tokens/tabs";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { ScrollShadow } from "../scroll-shadow/scroll-shadow.js";
const Context = createContext({
  orientation: "horizontal" as "horizontal" | "vertical",
  variant: "primary" as "primary" | "secondary",
  align: "center" as "start" | "center" | "end",
});
const Root = styledPart(BaseTabs.Root, "tabs", tabsStyles.root);
const Container = styledPart("div", "tabs-list-container", tabsStyles.listContainer);
const List = styledPart(BaseTabs.List, "tabs-list", tabsStyles.list);
const Tab = styledPart(BaseTabs.Tab, "tabs-tab", tabsStyles.tab);
const Panel = styledPart(BaseTabs.Panel, "tabs-panel", tabsStyles.panel);
const Indicator = styledPart(BaseTabs.Indicator, "tabs-indicator", tabsStyles.indicator);
const Separator = styledPart("span", "tabs-separator", tabsStyles.separator);
const ScrollButton = styledPart("button", "tabs-scroll-button", tabsStyles.scrollButton);
export type TabsRootProps = StyleXProps<ComponentProps<typeof BaseTabs.Root>> & {
  variant?: "primary" | "secondary";
  align?: "start" | "center" | "end";
};
export function TabsRoot({
  orientation = "horizontal",
  variant = "primary",
  align = "center",
  xstyle,
  ...props
}: TabsRootProps) {
  return (
    <Context value={{ orientation, variant, align }}>
      <Root {...props} orientation={orientation} xstyle={[tabsStyles[orientation], xstyle]} />
    </Context>
  );
}
export type TabListContainerProps = ComponentProps<typeof Container>;
export function TabListContainer({ children, xstyle, ...props }: TabListContainerProps) {
  const { orientation, variant } = useContext(Context);
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => {
    const node = ref.current;
    if (!node) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
    const vertical = orientation === "vertical";
    const rtl = !vertical && getComputedStyle(node).direction === "rtl";
    const size = vertical ? node.clientHeight : node.clientWidth;
    const maximum = Math.max(0, (vertical ? node.scrollHeight : node.scrollWidth) - size);
    const current = vertical ? node.scrollTop : node.scrollLeft;
    const target = Math.min(
      rtl ? 0 : maximum,
      Math.max(rtl ? -maximum : 0, current + direction * size * 0.8 * (rtl ? -1 : 1)),
    );
    node.scrollTo(vertical ? { top: target, behavior } : { left: target, behavior });
  };
  return (
    <Container
      {...props}
      xstyle={[
        variant === "secondary" && tabsStyles.secondaryContainer,
        variant === "secondary" &&
          tabsStyles[orientation === "horizontal" ? "secondaryHorizontal" : "secondaryVertical"],
        xstyle,
      ]}
    >
      <ScrollShadow
        ref={ref}
        hideScrollBar
        orientation={orientation}
        size={64}
        xstyle={tabsStyles.scroller}
        data-slot="tabs-list-scroller"
      >
        {children}
      </ScrollShadow>
      <ScrollButton
        type="button"
        tabIndex={-1}
        aria-label="Scroll to previous tabs"
        onClick={() => scroll(-1)}
        xstyle={[
          tabsStyles.showPrevious,
          tabsStyles[orientation === "horizontal" ? "previousHorizontal" : "previousVertical"],
        ]}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
          <path d="m10 4-4 4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </ScrollButton>
      <ScrollButton
        type="button"
        tabIndex={-1}
        aria-label="Scroll to next tabs"
        onClick={() => scroll(1)}
        xstyle={[
          tabsStyles.showNext,
          tabsStyles[orientation === "horizontal" ? "nextHorizontal" : "nextVertical"],
        ]}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
          <path d="m6 4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </ScrollButton>
    </Container>
  );
}
export function TabList({ xstyle, ...props }: ComponentProps<typeof List>) {
  const { orientation, variant } = useContext(Context);
  return (
    <List
      {...props}
      xstyle={[
        tabsStyles[orientation === "horizontal" ? "listHorizontal" : "listVertical"],
        variant === "secondary" && tabsStyles.secondaryList,
        xstyle,
      ]}
    />
  );
}
export function TabRoot({ xstyle, ...props }: ComponentProps<typeof Tab>) {
  const { orientation, variant, align } = useContext(Context);
  return (
    <Tab
      {...props}
      xstyle={[
        orientation === "vertical" && tabsStyles.tabVertical,
        variant === "secondary" && tabsStyles.secondaryTab,
        align !== "center" && tabsStyles[align === "start" ? "alignStart" : "alignEnd"],
        xstyle,
      ]}
    />
  );
}
export function TabIndicator({ xstyle, ...props }: ComponentProps<typeof Indicator>) {
  const { orientation, variant } = useContext(Context);
  return (
    <Indicator
      {...props}
      xstyle={[
        variant === "secondary" && tabsStyles.secondaryIndicator,
        variant === "secondary" &&
          tabsStyles[
            orientation === "horizontal"
              ? "secondaryIndicatorHorizontal"
              : "secondaryIndicatorVertical"
          ],
        xstyle,
      ]}
    />
  );
}
export function TabPanel({ xstyle, ...props }: ComponentProps<typeof Panel>) {
  const { orientation } = useContext(Context);
  return (
    <Panel
      {...props}
      xstyle={[
        tabsStyles[orientation === "horizontal" ? "panelHorizontal" : "panelVertical"],
        xstyle,
      ]}
    />
  );
}
export function TabSeparator({ xstyle, ...props }: ComponentProps<typeof Separator>) {
  const { orientation, variant } = useContext(Context);
  return (
    <Separator
      aria-hidden="true"
      {...props}
      xstyle={[
        tabsStyles[orientation === "horizontal" ? "separatorHorizontal" : "separatorVertical"],
        variant === "secondary" && tabsStyles.hidden,
        xstyle,
      ]}
    />
  );
}
export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  ListContainer: TabListContainer,
  List: TabList,
  Tab: TabRoot,
  Indicator: TabIndicator,
  Panel: TabPanel,
  Separator: TabSeparator,
});
