import { attachGlass } from "@lenso/glass";
import { glassStyles } from "@lenso/tokens/glass";
import { knobMaterialStyles as knob } from "@lenso/tokens/materials";
import { tabsStyles } from "@lenso/tokens/tabs";
import {
  bindTabBarMotion,
  bindTabBarPress,
  bindTabBarMinimize,
  restoreTabBarFocus,
  bindTabBarScroll,
} from "@lenso/glass/motion";
import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
import type { JSX } from "@solidjs/web";
import { Button } from "@ui-sdk/solid/button";
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  omit,
  Show,
  useContext,
  type ComponentProps,
} from "solid-js";
import { Glass } from "./glass.jsx";
import { attributes, htmlPart, sdkPart, type SlotProps, type StyledPart } from "./parts.js";

export type TabBarLayout = "phone" | "tablet" | "vertical";
const Context = createContext<() => TabBarLayout>(() => "phone");
const Visibility = createContext<{
  elastic: () => boolean;
  minimized: () => boolean;
  expandLabel: () => string;
  changeMinimized: (next: boolean) => void;
}>({
  elastic: () => true,
  minimized: () => false,
  expandLabel: () => "Expand navigation",
  changeMinimized: (_next: boolean) => {},
});
const Separate = createContext<() => boolean>(() => false);
const Nav = htmlPart("nav", "tab-bar", () => s.root);
const Group = htmlPart("div", "tab-bar-group", () => s.group);
const Collection = htmlPart("ul", "tab-bar-list", () => s.list);
const Item = htmlPart("li", "tab-bar-item-container", () => s.itemContainer);
const Link = htmlPart("a", "tab-bar-link", () => s.item);
const Action: StyledPart<typeof Button> = sdkPart(Button, "tab-bar-button", () => s.item);

export type TabBarRootProps = ComponentProps<typeof Nav> & {
  layout?: TabBarLayout;
  elastic?: boolean;
  minimized?: boolean;
  defaultMinimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  autoMinimize?: boolean | "up" | "down";
  scrollTarget?: HTMLElement | (() => HTMLElement | null | undefined);
  expandLabel?: string;
};
export function TabBarRoot(props: TabBarRootProps) {
  const layout = () => props.layout ?? "phone";
  const [element, setElement] = createSignal<HTMLElement>();
  const [localMinimized, setLocalMinimized] = createSignal(props.defaultMinimized ?? false);
  const minimized = () => props.minimized ?? localMinimized();
  const changeMinimized = (next: boolean) => {
    if (next === minimized()) return;
    if (props.minimized === undefined) setLocalMinimized(next);
    props.onMinimizedChange?.(next);
  };
  const target = () =>
    typeof props.scrollTarget === "function" ? props.scrollTarget() : props.scrollTarget;
  createEffect(
    () =>
      [
        element(),
        props.autoMinimize,
        props.scrollTarget !== undefined,
        target(),
        minimized(),
      ] as const,
    ([node, direction, customTarget, scroller, current]) => {
      if (node && direction && (!customTarget || scroller)) {
        return bindTabBarScroll(
          node,
          scroller ?? undefined,
          direction === "up" ? "up" : "down",
          current,
          changeMinimized,
        );
      }
    },
  );

  return (
    <Context value={layout}>
      <Visibility
        value={{
          elastic: () => props.elastic ?? true,
          minimized,
          expandLabel: () => props.expandLabel ?? "Expand navigation",
          changeMinimized,
        }}
      >
        <Nav
          {...omit(
            props,
            "xstyle",
            "layout",
            "elastic",
            "ref",
            "minimized",
            "defaultMinimized",
            "onMinimizedChange",
            "autoMinimize",
            "scrollTarget",
            "expandLabel",
          )}
          ref={[setElement, props.ref]}
          data-minimized={minimized() ? "" : undefined}
          data-layout={layout()}
          xstyle={[
            layout() === "phone" && s.phoneRoot,
            layout() === "vertical" && s.verticalRoot,
            props.xstyle,
          ]}
        />
      </Visibility>
    </Context>
  );
}

export type TabBarGroupProps = ComponentProps<typeof Group> & { separate?: boolean };
export function TabBarGroup(props: TabBarGroupProps) {
  const layout = useContext(Context);
  const separate = () => Boolean(props.separate);
  const visibility = useContext(Visibility);
  const minimized = () => visibility.minimized() && !separate();
  const [group, setGroup] = createSignal<HTMLDivElement>();
  const [lens, setLens] = createSignal<HTMLSpanElement>();
  const [animation, setAnimation] = createSignal<ReturnType<typeof bindTabBarMinimize>>();
  createEffect(
    () => [group(), visibility.elastic()] as const,
    ([node, elastic]) => (node && elastic ? bindTabBarPress(node) : undefined),
  );
  createEffect(lens, (node) => node && attachGlass(node, { liveGeometry: true }));
  createEffect(
    () => [group(), separate(), layout()] as const,
    ([node, detached, orientation]) => {
      if (!node) return;
      const minimize = bindTabBarMinimize(node, detached, orientation);
      const stop = detached ? undefined : bindTabBarMotion(node, orientation === "vertical");
      setAnimation(minimize);
      return () => {
        stop?.();
        minimize?.destroy();
      };
    },
  );
  createEffect(
    () => [animation(), minimized()] as const,
    ([binding, collapsed]) => {
      binding?.setMinimized(collapsed);
    },
  );
  const listId = createUniqueId();
  let list: HTMLUListElement | undefined;
  let expand: HTMLButtonElement | undefined;
  let restoreFocus = false;
  let listHadFocus = false;
  createEffect(minimized, (collapsed) => {
    if (collapsed) {
      if (listHadFocus || list?.contains(list.ownerDocument.activeElement))
        expand?.focus({ preventScroll: true });
      listHadFocus = false;
    } else if (restoreFocus) {
      restoreFocus = false;
      if (list) return restoreTabBarFocus(list);
    }
  });
  return (
    <Separate value={separate}>
      <Group
        {...omit(props, "separate", "xstyle", "children", "ref")}
        ref={[setGroup, props.ref]}
        data-tab-bar-group=""
        data-minimized={minimized() ? "" : undefined}
        data-layout={layout()}
        data-separate={separate() ? "" : undefined}
        xstyle={[
          layout() === "phone"
            ? s.phoneGroup
            : layout() === "vertical"
              ? s.verticalGroup
              : s.tabletGroup,
          visibility.elastic() && s.elastic,
          separate() && s.separate,
          props.xstyle,
        ]}
      >
        <Glass
          aria-hidden="true"
          data-material="glass-small"
          data-material-resting=""
          xstyle={[s.material, layout() !== "phone" && s.tabletMaterial]}
        />
        <Show when={!separate()}>
          <span
            data-lenso-slot="tab-bar-indicator"
            aria-hidden="true"
            inert
            {...attributes(glassStyles.hotspot, s.indicator)}
          >
            <span
              data-lenso-slot="tab-bar-refraction"
              {...attributes(tabsStyles.refraction, s.indicatorRefraction)}
            >
              <span
                aria-hidden="true"
                data-knob-material="toggle"
                {...attributes(knob.layer, knob.toggle, knob.controlEdge)}
                ref={setLens}
              ></span>
              <span aria-hidden="true" {...attributes(knob.face)}></span>
            </span>
          </span>
          <span
            data-lenso-slot="tab-bar-highlight"
            aria-hidden="true"
            inert
            {...attributes(s.highlight)}
          >
            <span data-lenso-slot="tab-bar-highlight-ring" {...attributes(s.highlightClip)}>
              <span data-lenso-slot="tab-bar-highlight-optics" {...attributes(s.highlightOptics)}>
                <span
                  data-lenso-slot="tab-bar-highlight-row"
                  {...attributes(s.highlightRow)}
                ></span>
              </span>
            </span>
            <span data-lenso-slot="tab-bar-highlight-centre" {...attributes(s.highlightClip)}>
              <span
                data-lenso-slot="tab-bar-highlight-centre-row"
                {...attributes(s.highlightRow)}
              ></span>
            </span>
          </span>
        </Show>
        <Collection
          data-tab-bar-list=""
          id={listId}
          ref={(node) => {
            list = node;
          }}
          aria-hidden={minimized() ? "true" : undefined}
          inert={minimized()}
          onFocusIn={() => {
            listHadFocus = true;
          }}
          onFocusOut={(event) => {
            if (event.relatedTarget && !list?.contains(event.relatedTarget as Node))
              listHadFocus = false;
          }}
          xstyle={[
            layout() === "vertical" && s.verticalList,
            layout() === "tablet" && s.tabletList,
            layout() === "tablet" && separate() && s.tabletSeparateList,
          ]}
        >
          {props.children}
        </Collection>
        <Show when={minimized()}>
          <Action
            ref={(node) => {
              expand = node;
            }}
            data-tab-bar-expand=""
            aria-label={visibility.expandLabel()}
            aria-expanded="false"
            aria-controls={listId}
            xstyle={s.expand}
            onFocus={() => {
              restoreFocus = true;
            }}
            onBlur={(event) => {
              if (
                event.relatedTarget &&
                event.relatedTarget !== event.currentTarget.ownerDocument.body
              )
                restoreFocus = false;
            }}
            onClick={() => {
              restoreFocus = true;
              visibility.changeMinimized(false);
            }}
          >
            <span aria-hidden="true">⋯</span>
          </Action>
        </Show>
      </Group>
    </Separate>
  );
}

type ContentProps = { icon?: JSX.Element; iconOnly?: boolean; children?: JSX.Element };
export type TabBarLinkProps = ComponentProps<typeof Link> &
  ContentProps & { isCurrent?: boolean; disabled?: boolean };
export type TabBarButtonProps = Omit<ComponentProps<typeof Action>, "children"> &
  SlotProps &
  ContentProps;

function Label(props: ContentProps) {
  const layout = useContext(Context);
  return (
    <>
      {props.icon && (
        <span
          aria-hidden="true"
          data-tab-bar-content=""
          {...attributes(
            s.icon,
            layout() === "tablet" && s.tabletIcon,
            layout() === "vertical" && s.verticalIcon,
          )}
        >
          {props.icon}
        </span>
      )}
      <span data-tab-bar-content="" {...attributes(s.label, props.iconOnly && s.visuallyHidden)}>
        {props.children}
      </span>
    </>
  );
}

export function TabBarLink(props: TabBarLinkProps) {
  const layout = useContext(Context);
  const separate = useContext(Separate);
  const current = () =>
    props["aria-current"] == null
      ? !!props.isCurrent
      : props["aria-current"] !== false && props["aria-current"] !== "false";
  const iconOnly = () => props.iconOnly ?? (layout() === "vertical" || separate());
  return (
    <Item
      xstyle={[
        layout() === "tablet" && s.tabletItemContainer,
        separate() && s.separateItemContainer,
      ]}
    >
      <Link
        {...omit(props, "icon", "iconOnly", "isCurrent", "disabled", "xstyle", "children")}
        href={props.disabled ? undefined : props.href}
        aria-current={props["aria-current"] ?? (current() ? "page" : undefined)}
        role={props.role ?? (props.disabled ? "link" : undefined)}
        aria-disabled={props.disabled ? "true" : props["aria-disabled"]}
        tabindex={props.disabled ? -1 : props.tabindex}
        data-tab-bar-destination=""
        data-tab-bar-has-icon={props.icon ? "" : undefined}
        data-tab-bar-item=""
        data-current={current() ? "" : undefined}
        xstyle={[
          layout() === "tablet" && s.tabletItem,
          layout() === "vertical" && s.verticalItem,
          iconOnly() && s.iconOnlyItem,
          current() && s.current,
          props.xstyle,
        ]}
      >
        <Label icon={props.icon} iconOnly={iconOnly()}>
          {props.children}
        </Label>
      </Link>
    </Item>
  );
}

export function TabBarButton(props: TabBarButtonProps) {
  const layout = useContext(Context);
  const separate = useContext(Separate);
  const iconOnly = () => props.iconOnly ?? (layout() === "vertical" || separate());
  return (
    <Item
      xstyle={[
        layout() === "tablet" && s.tabletItemContainer,
        separate() && s.separateItemContainer,
      ]}
    >
      <Action
        {...omit(props, "icon", "iconOnly", "xstyle", "children")}
        data-tab-bar-item=""
        xstyle={[
          layout() === "tablet" && s.tabletItem,
          layout() === "vertical" && s.verticalItem,
          iconOnly() && s.iconOnlyItem,
          props.xstyle,
        ]}
      >
        <Label icon={props.icon} iconOnly={iconOnly()}>
          {props.children}
        </Label>
      </Action>
    </Item>
  );
}

export const TabBar = Object.assign(TabBarRoot, {
  Root: TabBarRoot,
  Group: TabBarGroup,
  Link: TabBarLink,
  Button: TabBarButton,
});
