import { bindTabBarScroll } from "@lenso/glass/motion";
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
  minimized: () => boolean;
  expandLabel: () => string;
  changeMinimized: (next: boolean) => void;
}>({
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
      const enabled = '[data-tab-bar-item]:not([aria-disabled="true"]):not(:disabled)';
      const destination =
        list?.querySelector<HTMLElement>(enabled + "[data-current]") ??
        list?.querySelector<HTMLElement>(enabled);
      destination?.focus({ preventScroll: true });
    }
  });
  return (
    <Separate value={separate}>
      <Group
        {...omit(props, "separate", "xstyle", "children")}
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
          separate() && s.separate,
          props.xstyle,
        ]}
      >
        <Glass
          aria-hidden="true"
          data-material="glass-small"
          xstyle={[s.material, layout() !== "phone" && s.tabletMaterial]}
        />
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
              if (event.relatedTarget) restoreFocus = false;
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
export type TabBarLinkProps = ComponentProps<typeof Link> & ContentProps & { isCurrent?: boolean };
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
  const iconOnly = () => props.iconOnly ?? (layout() === "vertical" || separate());
  return (
    <Item
      xstyle={[
        layout() === "tablet" && s.tabletItemContainer,
        separate() && s.separateItemContainer,
      ]}
    >
      <Link
        aria-current={props.isCurrent ? "page" : undefined}
        {...omit(props, "icon", "iconOnly", "isCurrent", "xstyle", "children")}
        data-tab-bar-item=""
        data-current={props.isCurrent ? "" : undefined}
        xstyle={[
          layout() === "tablet" && s.tabletItem,
          layout() === "vertical" && s.verticalItem,
          iconOnly() && s.iconOnlyItem,
          props.isCurrent && s.current,
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
