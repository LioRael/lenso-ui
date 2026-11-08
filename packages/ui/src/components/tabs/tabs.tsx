"use client";

import { useElasticRef } from "@lenso/glass/react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { createContext, useCallback, useContext, useRef, type ComponentProps } from "react";
import { tabsStyles } from "@lenso/tokens/tabs";
import {
  SelectionTrack,
  SelectionHighlight,
  SelectionLensPaint,
  SelectionFallback,
} from "../../utils/segmented-presentation.js";
import { glassStyles } from "@lenso/tokens/glass";
import { useTabsListRef } from "../../utils/interaction/tabs.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { ScrollShadow } from "../scroll-shadow/scroll-shadow.js";
import { Menu } from "../menu/index.js";
import { useTabsOverflow } from "../../utils/interaction/tabs-overflow.js";
import { assignRef } from "../../utils/interaction/ref.js";
const Context = createContext({
  orientation: "horizontal" as "horizontal" | "vertical",
  align: "center" as "start" | "center" | "end",
  lift: 20,
  elastic: true,
  glass: false,
  size: "sm" as "sm" | "lg",
});
function Container({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(tabsStyles.listContainer, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "tabs-list-container"}
    />
  );
}
function TabGlass() {
  const { glass } = useContext(Context);
  return <SelectionTrack kind="tabs" glass={glass} />;
}
function List({
  xstyle,
  style,
  activateOnFocus = true,
  ref,
  children,
  ...props
}: StyleXProps<
  Omit<BaseTabs.List.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseTabs.List>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const { lift, size, elastic, glass } = useContext(Context);
  const presentationRef = useTabsListRef(ref, true);
  const shouldStart = useCallback((event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target.closest("[role=tab]") : null;
    return Boolean(target && !target.matches(":disabled, [data-disabled], [aria-disabled=true]"));
  }, []);
  const elasticRef = useElasticRef(presentationRef, { enabled: elastic, shouldStart });
  const compiled = stylex.props(
    tabsStyles.list,
    glass && tabsStyles.glassList,
    elastic && tabsStyles.elastic,
    tabsStyles.lift(lift),
    size === "lg" && tabsStyles.large,
    xstyle,
  );
  return (
    <BaseTabs.List
      {...props}
      {...compiled}
      activateOnFocus={activateOnFocus}
      ref={elasticRef}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "tabs-list"}
    >
      <TabGlass />
      {children}
    </BaseTabs.List>
  );
}
function Tab({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseTabs.Tab.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseTabs.Tab>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(tabsStyles.tab, tabsStyles.initialTab, xstyle);
  return (
    <BaseTabs.Tab
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "tabs-tab"}
    />
  );
}
function Panel({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseTabs.Panel.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseTabs.Panel>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(tabsStyles.panel, xstyle);
  return (
    <BaseTabs.Panel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "tabs-panel"}
    />
  );
}
function Indicator({
  xstyle,
  style,
  children,
  ref,
  renderBeforeHydration = true,
  ...props
}: StyleXProps<
  Omit<BaseTabs.Indicator.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseTabs.Indicator>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const { orientation } = useContext(Context);
  const compiled = stylex.props(
    tabsStyles.indicator,
    glassStyles.hotspot,
    tabsStyles.lens,
    tabsStyles.initialIndicator,
    xstyle,
  );
  return (
    <>
      <SelectionHighlight kind="tabs" vertical={orientation === "vertical"} />
      <BaseTabs.Indicator
        {...props}
        {...compiled}
        ref={ref}
        renderBeforeHydration={renderBeforeHydration}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "tabs-indicator"}
        data-lg-tabs-lens="native"
      >
        <SelectionLensPaint kind="tabs" />
        {children}
      </BaseTabs.Indicator>
      <SelectionFallback kind="tabs" />
    </>
  );
}
function Separator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(tabsStyles.separator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "tabs-separator"}
    />
  );
}
function ScrollButton({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"button">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(tabsStyles.scrollButton, xstyle);
  return (
    <button
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "tabs-scroll-button"}
    />
  );
}
export type TabsRootProps = StyleXProps<ComponentProps<typeof BaseTabs.Root>> & {
  "data-slot"?: unknown;
  align?: "start" | "center" | "end";
  lift?: number;
  /** Elastic press and drag feedback on the primary tab list, independent of indicator lift. */
  elastic?: boolean;
  /** Use a Liquid Glass wrapper instead of the standard segmented-control fill. */
  glass?: boolean;
  size?: "sm" | "lg";
};
export function TabsRoot({
  orientation = "horizontal",
  align = "center",
  lift = 20,
  elastic = true,
  glass = false,
  size = "sm",
  xstyle,
  style,
  ...props
}: TabsRootProps) {
  const compiled = stylex.props(tabsStyles.root, tabsStyles[orientation], xstyle);
  return (
    <Context value={{ orientation, align, lift, elastic, glass, size }}>
      <BaseTabs.Root
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "tabs"}
        orientation={orientation}
      />
    </Context>
  );
}
export type TabListContainerProps = ComponentProps<typeof Container> & {
  /** Accessible label for the menu containing tabs that do not fit. */
  overflowLabel?: string;
};
export function TabListContainer({
  children,
  xstyle,
  ref,
  overflowLabel = "More tabs",
  ...props
}: TabListContainerProps) {
  const { orientation, lift } = useContext(Context);
  const host = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const overflow = useTabsOverflow(host, orientation === "horizontal");
  const selectedFromMenu = useRef(false);
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      host.current = node;
      return assignRef(ref, node);
    },
    [ref],
  );
  const scroll = (direction: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
    const target = Math.min(
      Math.max(0, node.scrollHeight - node.clientHeight),
      Math.max(0, node.scrollTop + direction * node.clientHeight * 0.8),
    );
    node.scrollTo({ top: target, behavior });
  };
  return (
    <Container
      {...props}
      ref={mergedRef}
      xstyle={[
        orientation === "vertical" ? tabsStyles.verticalContainer : tabsStyles.overflowContainer,
        xstyle,
      ]}
    >
      {orientation === "horizontal" ? (
        <div {...stylex.props(tabsStyles.overflowRow)} data-slot="tabs-overflow-row">
          {children}
          {overflow.length > 0 && (
            <Menu
              onOpenChange={(open) => {
                if (open) selectedFromMenu.current = false;
              }}
            >
              <Menu.ExpandTrigger aria-label={overflowLabel} xstyle={tabsStyles.overflowTrigger} />
              <Menu.Portal>
                <Menu.Positioner align="end" sideOffset={8}>
                  <Menu.Popup
                    aria-label={overflowLabel}
                    finalFocus={() =>
                      selectedFromMenu.current
                        ? host.current?.querySelector<HTMLElement>(
                            '[data-slot="tabs-tab"][aria-selected="true"]',
                          )
                        : true
                    }
                  >
                    {overflow.map(({ node, label, disabled }) => (
                      <Menu.Item
                        key={node.id}
                        disabled={disabled}
                        onClick={() => {
                          selectedFromMenu.current = true;
                          node.click();
                        }}
                      >
                        {label}
                      </Menu.Item>
                    ))}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu>
          )}
        </div>
      ) : (
        <>
          <ScrollShadow
            ref={scroller}
            hideScrollBar
            orientation={orientation}
            size={64}
            xstyle={[
              tabsStyles.scroller,
              tabsStyles.bleed(Math.ceil((Math.max(0, lift) * 2) / 3) + 10),
            ]}
            data-slot="tabs-list-scroller"
          >
            {children}
          </ScrollShadow>
          <ScrollButton
            type="button"
            tabIndex={-1}
            aria-label="Scroll to previous tabs"
            onClick={() => scroll(-1)}
            xstyle={[tabsStyles.showPrevious, tabsStyles.previousVertical]}
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
            xstyle={[tabsStyles.showNext, tabsStyles.nextVertical]}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
              <path d="m6 4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </ScrollButton>
        </>
      )}
    </Container>
  );
}
export function TabList({ xstyle, ...props }: ComponentProps<typeof List>) {
  const { orientation } = useContext(Context);
  return (
    <List
      {...props}
      xstyle={[
        tabsStyles[orientation === "horizontal" ? "listHorizontal" : "listVertical"],
        xstyle,
      ]}
    />
  );
}
export function TabRoot({ xstyle, ...props }: ComponentProps<typeof Tab>) {
  const { orientation, align } = useContext(Context);
  return (
    <Tab
      {...props}
      xstyle={[
        orientation === "vertical" && tabsStyles.tabVertical,
        align !== "center" && tabsStyles[align === "start" ? "alignStart" : "alignEnd"],
        xstyle,
      ]}
    />
  );
}
export function TabIndicator(props: ComponentProps<typeof Indicator>) {
  return <Indicator {...props} />;
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
  const { orientation } = useContext(Context);
  return (
    <Separator
      aria-hidden="true"
      {...props}
      xstyle={[
        tabsStyles[orientation === "horizontal" ? "separatorHorizontal" : "separatorVertical"],
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
