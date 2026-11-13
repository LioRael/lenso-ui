"use client";

import {
  Toolbar as SdkToolbar,
  ToolbarButton as SdkToolbarButton,
  ToolbarSeparator as SdkToolbarSeparator,
  ToolbarLink as SdkToolbarLink,
  ToolbarGroup as SdkToolbarGroup,
} from "@ui-sdk/react/toolbar";
import { renderElement } from "@ui-sdk/react/primitive";
import { slotRender } from "../../utils/sdk-render.js";
import { toolbarStyles } from "@lenso/tokens/toolbar";
import { glassButtonStyles, glassButtonVariants } from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { linkStyles } from "@lenso/tokens/link";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  createContext,
  useContext,
  useCallback,
  useLayoutEffect,
  useState,
  type ComponentProps,
} from "react";
import { ButtonSizeContext, LegacyButtonIconContext, type ButtonSize } from "../button/button.js";
import { useGlassRef, useElasticRef } from "@lenso/glass/react";
import { ScrollEdge } from "../../utils/materials/render.js";
import { GlassContainer } from "../glass-container/glass-container.js";
import { glassButtonRelease } from "../glass-button/glass-button.js";
const ElasticContext = createContext(true);
const SurfaceContext = createContext(false);
const GroupContext = createContext(false);
const DetachableContext = createContext<{ detached: boolean } | null>(null);
function useToolbarMotion<T extends HTMLElement>(
  ref: React.Ref<T> | undefined,
  glass: boolean,
  elastic: boolean,
  surface = true,
  enabled = true,
  detachable = false,
  grow?: number,
) {
  const shouldStart = useCallback(
    (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const group = target?.closest("[data-toolbar-detachable]");
      if (
        surface &&
        group &&
        group !== event.currentTarget &&
        (group.hasAttribute("data-toolbar-elastic-surface") ||
          group.getAttribute("data-toolbar-detached") === "true")
      )
        return false;
      if (!elastic && !target?.closest('[data-toolbar-elastic="true"]')) return false;
      return !target?.closest('[data-pending], [data-toolbar-elastic="false"]');
    },
    [elastic, surface],
  );
  return useElasticRef(useGlassRef(ref, glass, false, undefined, undefined, false, detachable), {
    enabled,
    // Disabled SDK members stop bubbling; surface motion still follows the press.
    capture: surface,
    shouldStart,
    propertyPrefix: surface ? "--toolbar-press" : "--lg-press",
    grow: detachable ? grow : undefined,
    release: detachable ? glassButtonRelease : undefined,
  });
}
const Context = createContext<"horizontal" | "vertical">("horizontal");
function Button({
  xstyle,
  style,
  render,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof SdkToolbarButton>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkToolbarButton>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(glassButtonStyles.root, toolbarStyles.button, xstyle);
  return (
    <SdkToolbarButton
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", props["data-lenso-slot"] ?? "toolbar-button", render)}
    />
  );
}
function Separator({
  xstyle,
  style,
  render,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof SdkToolbarSeparator>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkToolbarSeparator>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(toolbarStyles.separator, xstyle);
  return (
    <SdkToolbarSeparator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "toolbar-separator", render)}
    />
  );
}
export function ToolbarLink({
  xstyle,
  style,
  render,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof SdkToolbarLink>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkToolbarLink>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(linkStyles.root, xstyle);
  return (
    <SdkToolbarLink
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("a", props["data-lenso-slot"] ?? "toolbar-link", render)}
    />
  );
}
export function ToolbarGroup({
  xstyle,
  style,
  glass = true,
  isDetached,
  disabled,
  render,
  ref,
  children,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof SdkToolbarGroup>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkToolbarGroup>["ref"];
  }
> & {
  "data-lenso-slot"?: unknown;
  glass?: boolean;
  /**
   * Animate a shared glass group into separate controls.
   * Keep this prop present in both states; omit to retain the standard group.
   */
  isDetached?: boolean;
}) {
  const orientation = useContext(Context);
  const elastic = useContext(ElasticContext);
  const parentSurface = useContext(SurfaceContext);
  const detachable = glass && isDetached !== undefined;
  const glassRef = useToolbarMotion(
    ref,
    glass && !parentSurface && !detachable,
    elastic,
    true,
    !parentSurface && (!detachable || !isDetached),
  );
  const [element, setElement] = useState<HTMLElement | null>(null);
  const detachableRef = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      return glassRef(node);
    },
    [glassRef],
  );
  useLayoutEffect(() => {
    if (!detachable || !element) return;
    let members: HTMLElement[] = [];
    const place = () => {
      members = [...element.querySelectorAll<HTMLElement>("[data-toolbar-item]")].filter(
        (member) => member.closest("[data-toolbar-detachable]") === element,
      );
      members.forEach((member, index) =>
        member.style.setProperty(
          "--toolbar-joined-offset",
          `${((members.length - 1) / 2 - index) * 40}px`,
        ),
      );
    };
    place();
    // Establish the initial arrangement before enabling interruptible transitions.
    element.getBoundingClientRect();
    element.setAttribute("data-toolbar-morph-ready", "");
    const observer = new MutationObserver(place);
    observer.observe(element, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      element.removeAttribute("data-toolbar-morph-ready");
      members.forEach((member) => member.style.removeProperty("--toolbar-joined-offset"));
    };
  }, [detachable, element]);
  const compiled = stylex.props(
    toolbarStyles.group,
    !parentSurface && !detachable && toolbarStyles.motion,
    orientation === "vertical" && toolbarStyles.groupVertical,
    parentSurface && toolbarStyles.attachedGroup,
    glass && !parentSurface && !detachable && liquidMaterialStyles.small,
    xstyle,
  );
  if (detachable)
    return (
      <GroupContext value>
        <SurfaceContext value={false}>
          <DetachableContext value={{ detached: isDetached }}>
            <SdkToolbarGroup
              {...props}
              disabled={disabled}
              ref={detachableRef}
              render={(nativeProps, state) => (
                <GlassContainer
                  {...nativeProps}
                  render={(containerProps) =>
                    renderElement(
                      "div",
                      containerProps,
                      slotRender("div", props["data-lenso-slot"] ?? "toolbar-group", render),
                      state,
                    )
                  }
                  style={mergeStyle(
                    nativeProps["style"],
                    typeof style === "function" ? style(state) : style,
                  )}
                  spacing={18}
                  xstyle={[
                    toolbarStyles.group,
                    orientation === "vertical" && toolbarStyles.groupVertical,
                    toolbarStyles.detachableGroup,
                    !parentSurface && toolbarStyles.motion,
                    xstyle,
                  ]}
                  data-lenso-slot={props["data-lenso-slot"] ?? "toolbar-group"}
                  data-menu-source={!isDetached ? "" : undefined}
                  data-toolbar-detachable=""
                  data-toolbar-elastic-surface={!parentSurface && !isDetached ? "" : undefined}
                  data-lenso-glass-group=""
                  data-lenso-glass-state={isDetached ? "detached" : "joined"}
                  data-toolbar-detached={isDetached ? "true" : "false"}
                  data-toolbar-direction={orientation}
                />
              )}
            >
              {children}
            </SdkToolbarGroup>
          </DetachableContext>
        </SurfaceContext>
      </GroupContext>
    );
  return (
    <GroupContext value>
      <DetachableContext value={null}>
        <SurfaceContext value>
          <SdkToolbarGroup
            {...props}
            disabled={disabled}
            render={slotRender("div", props["data-lenso-slot"] ?? "toolbar-group", render)}
            {...compiled}
            style={mergeStyle(compiled.style, style)}
            ref={glassRef}
            data-lenso-slot={props["data-lenso-slot"] ?? "toolbar-group"}
            data-menu-source={glass && !parentSurface ? "" : undefined}
          >
            {(state) => (
              <>
                {glass && !parentSurface && (
                  <span
                    aria-hidden="true"
                    data-lenso-slot="glass-press-highlight"
                    {...stylex.props(liquidMaterialStyles.pressHighlight)}
                  />
                )}
                {typeof children === "function" ? children(state) : children}
              </>
            )}
          </SdkToolbarGroup>
        </SurfaceContext>
      </DetachableContext>
    </GroupContext>
  );
}
export type ToolbarRootProps = StyleXProps<ComponentProps<typeof SdkToolbar>> & {
  "data-lenso-slot"?: unknown;
  isAttached?: boolean;
  /** Opt into a sticky bar with a scroll-bound background band. */
  edge?: "uniform" | "soft" | "none";
  scrollRef?: React.RefObject<HTMLElement | null>;
  /** Enable surface press, elastic drag and spring return. Individual buttons can override this. */
  elastic?: boolean;
};
export function ToolbarRoot({
  isAttached = false,
  edge = "none",
  scrollRef,
  elastic = true,
  orientation = "horizontal",
  xstyle,
  style,
  ref,
  children,
  render,
  ...props
}: ToolbarRootProps) {
  const glassRef = useToolbarMotion(ref, isAttached, elastic, true, isAttached);
  const compiled = stylex.props(
    toolbarStyles.root,
    edge !== "none" && toolbarStyles.sticky,
    orientation === "vertical" && toolbarStyles.vertical,
    isAttached && liquidMaterialStyles.small,
    isAttached && toolbarStyles.attached,
    isAttached && toolbarStyles.motion,
    xstyle,
  );
  return (
    <ElasticContext value={elastic}>
      <SurfaceContext value={isAttached}>
        <Context value={orientation}>
          <SdkToolbar
            {...props}
            {...compiled}
            style={mergeStyle(compiled.style, style)}
            ref={glassRef}
            render={slotRender("div", props["data-lenso-slot"] ?? "toolbar", render)}
            data-attached={isAttached ? "" : undefined}
            data-menu-source={isAttached ? "" : undefined}
            orientation={orientation}
          >
            {(state) => (
              <>
                {edge !== "none" && (
                  <ScrollEdge
                    scrollRef={scrollRef}
                    variant={edge === "soft" ? "soft" : "hard"}
                    xstyle={[toolbarStyles.edge, edge === "uniform" && toolbarStyles.uniformEdge]}
                  />
                )}
                {isAttached && (
                  <span
                    aria-hidden="true"
                    data-lenso-slot="glass-press-highlight"
                    {...stylex.props(liquidMaterialStyles.pressHighlight)}
                  />
                )}
                {typeof children === "function" ? children(state) : children}
              </>
            )}
          </SdkToolbar>
        </Context>
      </SurfaceContext>
    </ElasticContext>
  );
}
export type ToolbarButtonProps = ComponentProps<typeof Button> & {
  size?: ButtonSize;
  /** Defaults to plain inside Toolbar.Group and glass elsewhere; explicit variants take priority. */
  variant?: "glass" | "filled" | "plain";
  isIconOnly?: boolean;
  glass?: boolean;
  destructive?: boolean;
  tint?: string;
  /** Override the toolbar’s elastic pointer animation independently of glass. */
  elastic?: boolean;
};
export function ToolbarButton({
  elastic: ownElastic,
  size = "md",
  variant: ownVariant,
  isIconOnly = false,
  glass = true,
  destructive = false,
  tint,
  render,
  ref,
  xstyle,
  children,
  ...props
}: ToolbarButtonProps) {
  const orientation = useContext(Context);
  const inheritedElastic = useContext(ElasticContext);
  const elastic = ownElastic ?? inheritedElastic;
  const surface = useContext(SurfaceContext);
  const grouped = useContext(GroupContext);
  const detachable = useContext(DetachableContext);
  const detachableHeight = size === "sm" ? 36 : size === "lg" ? 48 : 44;
  const variant = ownVariant ?? (grouped && !detachable ? "plain" : "glass");
  const motionRef = useToolbarMotion(
    ref,
    glass && variant !== "plain",
    elastic,
    false,
    !surface && (!detachable || detachable.detached),
    Boolean(detachable),
    Math.round(detachableHeight * 0.4),
  );
  return (
    <LegacyButtonIconContext value>
      <ButtonSizeContext value={size}>
        <Button
          {...props}
          ref={motionRef}
          render={render}
          data-toolbar-elastic={elastic ? "true" : "false"}
          data-glass={glass && variant !== "plain" ? "true" : "false"}
          data-variant={variant === "filled" ? "prominent" : "default"}
          data-toolbar-item=""
          data-destructive={destructive ? "" : undefined}
          xstyle={[
            glass && variant !== "plain" && liquidMaterialStyles.small,
            variant !== "plain" &&
              glassButtonVariants[variant === "filled" ? "prominent" : "default"],
            glassButtonStyles.interaction,
            surface && toolbarStyles.surfaceChild,
            (!glass || variant === "plain") && toolbarStyles.plain,
            destructive && glassButtonStyles.destructive,
            Boolean(tint) && glassButtonStyles.tint(tint!),
            orientation === "vertical" && toolbarStyles.verticalButton,
            isIconOnly && toolbarStyles.iconButton,
            size === "sm" && toolbarStyles.smallButton,
            size === "lg" && toolbarStyles.largeButton,
            isIconOnly && size === "sm" && toolbarStyles.smallIcon,
            isIconOnly && size === "lg" && toolbarStyles.largeIcon,
            detachable && toolbarStyles.detachableButton,
            detachable && toolbarStyles.detachableSize(detachableHeight),
            xstyle,
          ]}
        >
          {(state) => (
            <>
              {glass && variant !== "plain" && !surface && (
                <span
                  aria-hidden="true"
                  data-lenso-slot="glass-press-highlight"
                  {...stylex.props(liquidMaterialStyles.pressHighlight)}
                />
              )}
              {typeof children === "function" ? children(state) : children}
            </>
          )}
        </Button>
      </ButtonSizeContext>
    </LegacyButtonIconContext>
  );
}
export function ToolbarSeparator({ xstyle, ...props }: ComponentProps<typeof Separator>) {
  const toolbarOrientation = useContext(Context);
  const orientation = toolbarOrientation === "horizontal" ? "vertical" : "horizontal";
  return (
    <Separator
      {...props}
      xstyle={[
        toolbarStyles[orientation === "horizontal" ? "horizontalLine" : "verticalLine"],
        xstyle,
      ]}
    />
  );
}
export const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
});
