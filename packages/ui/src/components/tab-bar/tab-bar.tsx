"use client";

import { NativeButton as SdkButton } from "../../utils/native-button.js";
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { glassStyles } from "@lenso/tokens/glass";
import { tabBarStyles } from "@lenso/tokens/tab-bar";
import { tabsStyles } from "@lenso/tokens/tabs";
import * as stylex from "@stylexjs/stylex";
import {
  cloneElement,
  useCallback,
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { protectLoadingRender } from "../../utils/action-button.js";
import { useElasticRef } from "@lenso/glass/react";
import { assignRef } from "../../utils/interaction/ref.js";
import { prefersReducedMotion } from "@lenso/glass/motion";
import { KnobMaterial } from "../../utils/materials/knob.js";
import { Material } from "../../utils/materials/render.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { LinkRoot, type LinkRootProps } from "../link/link.js";
import { useTabBarMotionRef } from "./tab-bar-motion.js";
import { useTabBarMinimize } from "./tab-bar-minimize.js";
import { useTabBarScrollMinimize } from "./tab-bar-scroll.js";

export type TabBarLayout = "phone" | "tablet";
const LayoutContext = createContext<TabBarLayout>("phone");
const SeparateContext = createContext(false);
const MotionContext = createContext({
  elastic: true,
  minimized: false,
  expandLabel: "Expand navigation",
  setMinimized: (_value: boolean) => {},
});

export type TabBarRootProps = StyleXProps<PartProps<"nav">> & {
  layout?: TabBarLayout;
  /** Enable press enlargement, elastic dragging and spring return on each glass group. */
  elastic?: boolean;
  /** Extra indicator height in pixels while held; defaults to 20. Zero disables enlargement. */
  lift?: number;
  minimized?: boolean;
  defaultMinimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  /** Choose the scroll direction that minimizes; true means down. Defaults to false. */
  autoMinimize?: boolean | "up" | "down";
  /** Ref to the scrollable element to observe; defaults to the page. */
  scrollTarget?: RefObject<HTMLElement | null>;
  /** Accessible label for the minimized navigation's expand button. */
  expandLabel?: string;
};

export function TabBarRoot({
  layout = "phone",
  elastic = true,
  lift = 20,
  minimized: controlledMinimized,
  defaultMinimized = false,
  onMinimizedChange,
  autoMinimize = false,
  scrollTarget,
  expandLabel = "Expand navigation",
  render,
  ref,
  xstyle,
  style,
  ...props
}: TabBarRootProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      const own = assignRef(rootRef, node);
      const caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [ref],
  );
  const [uncontrolledMinimized, setUncontrolledMinimized] = useState(defaultMinimized);
  const minimized = controlledMinimized ?? uncontrolledMinimized;
  const setMinimized = useCallback(
    (next: boolean) => {
      if (next === minimized) return;
      if (controlledMinimized === undefined) setUncontrolledMinimized(next);
      onMinimizedChange?.(next);
    },
    [controlledMinimized, minimized, onMinimizedChange],
  );
  useTabBarScrollMinimize({
    enabled: Boolean(autoMinimize),
    minimizeDirection: autoMinimize === "up" ? "up" : "down",
    scrollTarget,
    root: rootRef,
    minimized,
    onChange: setMinimized,
  });
  const compiled = stylex.props(
    tabBarStyles.root,
    layout === "phone" && tabBarStyles.phoneRoot,
    tabBarStyles.lift(Number.isFinite(lift) ? Math.max(0, lift) : 20),
    xstyle,
  );
  const nav = renderElement(
    "nav",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs; it does not read them.
    {
      ...{
        ...props,
        ...compiled,
        style: mergeStyle(compiled.style, style),
        "data-lenso-slot": props["data-lenso-slot"] ?? "tab-bar",
        "data-layout": layout,
        "data-minimized": minimized ? "" : undefined,
      },
      ref: mergedRef,
    },
    render,
  );
  return (
    <LayoutContext value={layout}>
      <MotionContext value={{ elastic, minimized, expandLabel, setMinimized }}>{nav}</MotionContext>
    </LayoutContext>
  );
}

export type TabBarGroupProps = StyleXProps<React.ComponentPropsWithRef<"div">> & {
  /** A separate circular surface for a search destination or action. */
  separate?: boolean;
};

export function TabBarGroup({
  separate = false,
  children,
  ref,
  xstyle,
  style,
  ...props
}: TabBarGroupProps) {
  const layout = useContext(LayoutContext);
  const { elastic, minimized, expandLabel, setMinimized } = useContext(MotionContext);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const expandRef = useRef<HTMLButtonElement | null>(null);
  const focusAfterExpand = useRef(false);
  const listId = useId();
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      const own = assignRef(groupRef, node);
      const caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [ref],
  );
  useTabBarMinimize(groupRef, minimized, separate, layout);
  const motionRef = useTabBarMotionRef(mergedRef, !separate);
  const shouldStart = useCallback((event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    return (
      !prefersReducedMotion() &&
      !event.defaultPrevented &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      Boolean(target?.closest("[data-tab-bar-item], [data-tab-bar-expand]")) &&
      !target?.closest(':disabled, [data-disabled], [aria-disabled="true"]')
    );
  }, []);
  const elasticRef = useElasticRef(motionRef, {
    enabled: elastic,
    shouldStart,
    propertyPrefix: "--tab-bar-press",
  });
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || separate) return;
    if (
      minimized &&
      group.querySelector("[data-tab-bar-list]")?.contains(group.ownerDocument.activeElement)
    ) {
      expandRef.current?.focus({ preventScroll: true });
    } else if (!minimized && focusAfterExpand.current) {
      focusAfterExpand.current = false;
      const target =
        group.querySelector<HTMLElement>(
          '[data-tab-bar-item][data-current]:not([aria-disabled="true"]):not(:disabled)',
        ) ??
        group.querySelector<HTMLElement>(
          '[data-tab-bar-item]:not([aria-disabled="true"]):not(:disabled)',
        );
      target?.focus({ preventScroll: true });
    }
  }, [minimized, separate]);
  const compiled = stylex.props(
    tabBarStyles.group,
    layout === "phone" ? tabBarStyles.phoneGroup : tabBarStyles.tabletGroup,
    separate && tabBarStyles.separate,
    separate && (layout === "phone" ? tabBarStyles.phoneSeparate : tabBarStyles.tabletSeparate),
    elastic && tabBarStyles.elastic,
    xstyle,
  );
  return (
    <div
      {...props}
      {...compiled}
      ref={elasticRef}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "tab-bar-group"}
      data-tab-bar-group=""
      data-layout={layout}
      data-separate={separate ? "" : undefined}
      data-minimized={minimized ? "" : undefined}
    >
      <Material
        aria-hidden="true"
        variant="glass-small"
        liveGeometry
        data-material-resting=""
        xstyle={[tabBarStyles.material, layout === "tablet" && tabBarStyles.tabletMaterial]}
      />
      {!separate && (
        <span
          data-lenso-slot="tab-bar-indicator"
          aria-hidden="true"
          inert
          {...stylex.props(glassStyles.hotspot, tabBarStyles.indicator)}
        >
          <span
            data-lenso-slot="tab-bar-refraction"
            {...stylex.props(tabsStyles.refraction, tabBarStyles.indicatorRefraction)}
          >
            <KnobMaterial kind="toggle" controlEdge />
          </span>
        </span>
      )}
      {!separate && (
        <span
          data-lenso-slot="tab-bar-highlight"
          aria-hidden="true"
          inert
          {...stylex.props(tabBarStyles.highlight)}
        >
          <span
            data-lenso-slot="tab-bar-highlight-ring"
            {...stylex.props(tabBarStyles.highlightClip)}
          >
            <span
              data-lenso-slot="tab-bar-highlight-optics"
              {...stylex.props(tabBarStyles.highlightOptics)}
            >
              <span
                data-lenso-slot="tab-bar-highlight-row"
                {...stylex.props(tabBarStyles.highlightRow)}
              />
            </span>
          </span>
          <span
            data-lenso-slot="tab-bar-highlight-centre"
            {...stylex.props(tabBarStyles.highlightClip)}
          >
            <span
              data-lenso-slot="tab-bar-highlight-centre-row"
              {...stylex.props(tabBarStyles.highlightRow)}
            />
          </span>
        </span>
      )}
      <ul
        id={listId}
        data-tab-bar-list=""
        aria-hidden={minimized && !separate ? true : undefined}
        inert={minimized && !separate ? true : undefined}
        {...stylex.props(
          tabBarStyles.list,
          layout === "tablet" && tabBarStyles.tabletList,
          layout === "tablet" && separate && tabBarStyles.tabletSeparateList,
        )}
      >
        <SeparateContext value={separate}>{children}</SeparateContext>
      </ul>
      {!separate && minimized && (
        <SdkButton
          ref={expandRef}
          aria-label={expandLabel}
          aria-expanded={false}
          aria-controls={listId}
          data-tab-bar-expand=""
          {...stylex.props(tabBarStyles.expand)}
          onFocus={() => {
            focusAfterExpand.current = true;
          }}
          onBlur={() => {
            focusAfterExpand.current = false;
          }}
          onClick={() => {
            focusAfterExpand.current = true;
            setMinimized(false);
          }}
        >
          <span aria-hidden="true" {...stylex.props(tabBarStyles.expandFallback)}>
            ⋯
          </span>
        </SdkButton>
      )}
    </div>
  );
}

type ContentProps = { icon?: ReactNode; iconOnly?: boolean; children?: ReactNode };

function ItemContent({ icon, iconOnly, children }: ContentProps) {
  const layout = useContext(LayoutContext);
  return (
    <>
      {icon != null && (
        <span
          aria-hidden="true"
          data-tab-bar-content=""
          {...stylex.props(
            tabBarStyles.icon,
            layout === "tablet" && !iconOnly && tabBarStyles.tabletIcon,
          )}
        >
          {icon}
        </span>
      )}
      <span
        data-tab-bar-content=""
        {...stylex.props(tabBarStyles.label, iconOnly && tabBarStyles.visuallyHidden)}
      >
        {children}
      </span>
    </>
  );
}

export type TabBarLinkProps = Omit<LinkRootProps, "children"> &
  ContentProps & {
    /** Marks the current destination and supplies aria-current="page" by default. */
    isCurrent?: boolean;
  };

function disableLinkRender(element: ReactElement) {
  const guarded = protectLoadingRender(element);
  // Router components may require an href to render; their activation is guarded instead.
  if (typeof element.type !== "string") return guarded;
  return cloneElement(guarded as ReactElement<{ href?: string }>, {
    href: undefined,
  });
}

export function TabBarLink({
  icon,
  iconOnly: ownIconOnly,
  children,
  isCurrent: ownCurrent,
  disabled,
  render,
  xstyle,
  ...props
}: TabBarLinkProps) {
  const layout = useContext(LayoutContext);
  const separate = useContext(SeparateContext);
  const iconOnly = ownIconOnly ?? separate;
  const ariaCurrent = props["aria-current"];
  const current =
    ariaCurrent == null ? (ownCurrent ?? false) : ariaCurrent !== false && ariaCurrent !== "false";
  const protectedRender =
    !disabled || !render
      ? render
      : typeof render === "function"
        ? (((renderProps, state) => disableLinkRender(render(renderProps, state))) as typeof render)
        : disableLinkRender(render);
  return (
    <li
      {...stylex.props(
        tabBarStyles.itemContainer,
        layout === "tablet" && tabBarStyles.tabletItemContainer,
        separate && tabBarStyles.separateItemContainer,
      )}
    >
      <LinkRoot
        {...props}
        disabled={disabled}
        render={protectedRender}
        role={props.role ?? (disabled ? "link" : undefined)}
        aria-current={ariaCurrent ?? (current ? "page" : undefined)}
        data-lenso-slot={props["data-lenso-slot"] ?? "tab-bar-link"}
        data-tab-bar-item=""
        data-tab-bar-destination=""
        data-current={current || undefined}
        data-tab-bar-has-icon={icon != null ? "" : undefined}
        xstyle={[
          tabBarStyles.item,
          layout === "tablet" && tabBarStyles.tabletItem,
          iconOnly && tabBarStyles.iconOnlyItem,
          current && tabBarStyles.current,
          xstyle,
        ]}
      >
        {current && (
          <span
            aria-hidden="true"
            data-tab-bar-fallback=""
            {...stylex.props(
              tabBarStyles.fallback,
              layout === "tablet" && tabBarStyles.tabletFallback,
            )}
          />
        )}
        <ItemContent icon={icon} iconOnly={iconOnly}>
          {children}
        </ItemContent>
      </LinkRoot>
    </li>
  );
}

export type TabBarButtonProps = Omit<StyleXProps<ComponentProps<typeof SdkButton>>, "children"> &
  ContentProps;

export function TabBarButton({
  icon,
  iconOnly: ownIconOnly,
  children,
  xstyle,
  style,
  ...props
}: TabBarButtonProps) {
  const layout = useContext(LayoutContext);
  const separate = useContext(SeparateContext);
  const iconOnly = ownIconOnly ?? separate;
  const compiled = stylex.props(
    tabBarStyles.item,
    layout === "tablet" && tabBarStyles.tabletItem,
    iconOnly && tabBarStyles.iconOnlyItem,
    xstyle,
  );
  return (
    <li
      {...stylex.props(
        tabBarStyles.itemContainer,
        layout === "tablet" && tabBarStyles.tabletItemContainer,
        separate && tabBarStyles.separateItemContainer,
      )}
    >
      <SdkButton
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-lenso-slot={props["data-lenso-slot"] ?? "tab-bar-button"}
        data-tab-bar-item=""
      >
        <ItemContent icon={icon} iconOnly={iconOnly}>
          {children}
        </ItemContent>
      </SdkButton>
    </li>
  );
}

export const TabBar = Object.assign(TabBarRoot, {
  Root: TabBarRoot,
  Group: TabBarGroup,
  Link: TabBarLink,
  Button: TabBarButton,
});
