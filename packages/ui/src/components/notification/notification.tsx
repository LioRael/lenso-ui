"use client";
import type { ComponentProps } from "react";
import * as Collapsible from "@ui-sdk/react/collapsible";
import { slotRender } from "../../utils/sdk-render.js";
import { notificationStyles as s } from "@lenso/tokens/notification";
import { materialStyles } from "@lenso/tokens/materials";
import * as stylex from "@stylexjs/stylex";
import { MaterialBackground } from "../../utils/materials/render.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type NotificationRootProps = StyleXProps<
  React.ComponentProps<typeof Collapsible.Collapsible>
> & {
  stackCount?: 1 | 2 | 3;
};
export function NotificationRoot({
  stackCount = 1,
  xstyle,
  style,
  children,
  ...props
}: NotificationRootProps) {
  const compiled = stylex.props(s.root, xstyle);
  return (
    <Collapsible.Collapsible
      {...props}
      {...compiled}
      style={mergeStyle<Collapsible.CollapsibleState>(compiled.style, style)}
      data-lenso-slot="notification"
      render={slotRender("div", "notification", props.render)}
    >
      {(state) => (
        <>
          {Array.from({ length: stackCount - 1 }, (_, index) => (
            <span
              key={index}
              aria-hidden="true"
              {...stylex.props(materialStyles.root, s.layer(index + 1), materialStyles.accessible)}
            >
              <MaterialBackground variant={presentationMaterials.notification} />
            </span>
          ))}
          <span
            aria-hidden="true"
            {...stylex.props(materialStyles.root, s.surface, materialStyles.accessible)}
          >
            <MaterialBackground variant={presentationMaterials.notification} />
          </span>
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </Collapsible.Collapsible>
  );
}
export type NotificationTriggerProps = StyleXProps<
  React.ComponentProps<typeof Collapsible.CollapsibleTrigger>
>;
export function NotificationTrigger({ xstyle, style, ...props }: NotificationTriggerProps) {
  const compiled = stylex.props(s.header, s.trigger, xstyle);
  return (
    <Collapsible.CollapsibleTrigger
      {...props}
      {...compiled}
      style={mergeStyle<Collapsible.CollapsibleTriggerState>(compiled.style, style)}
      data-lenso-slot="notification-trigger"
      render={slotRender("button", "notification-trigger", props.render)}
    />
  );
}
export type NotificationPanelProps = StyleXProps<
  React.ComponentProps<typeof Collapsible.CollapsiblePanel>
>;
export function NotificationPanel({ xstyle, style, ...props }: NotificationPanelProps) {
  const compiled = stylex.props(s.panel, xstyle);
  return (
    <Collapsible.CollapsiblePanel
      {...props}
      {...compiled}
      style={mergeStyle<Collapsible.CollapsiblePanelState>(compiled.style, style)}
      data-lenso-slot="notification-panel"
      render={slotRender("div", "notification-panel", props.render)}
    />
  );
}
export type NotificationHeaderProps = StyleXProps<ComponentProps<"div">>;
export function NotificationHeader({ xstyle, style, ...props }: NotificationHeaderProps) {
  const compiled = stylex.props(s.header, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-header"
    />
  );
}
export type NotificationIconProps = StyleXProps<ComponentProps<"span">>;
export function NotificationIcon({ xstyle, style, ...props }: NotificationIconProps) {
  const compiled = stylex.props(s.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-icon"
    />
  );
}
export type NotificationContentProps = StyleXProps<ComponentProps<"span">>;
export function NotificationContent({ xstyle, style, ...props }: NotificationContentProps) {
  const compiled = stylex.props(s.content, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-content"
    />
  );
}
export type NotificationTitleProps = StyleXProps<ComponentProps<"span">>;
export function NotificationTitle({ xstyle, style, ...props }: NotificationTitleProps) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-title"
    />
  );
}
export type NotificationDescriptionProps = StyleXProps<ComponentProps<"span">>;
export function NotificationDescription({ xstyle, style, ...props }: NotificationDescriptionProps) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-description"
    />
  );
}
export type NotificationTimeProps = StyleXProps<ComponentProps<"time">>;
export function NotificationTime({ xstyle, style, ...props }: NotificationTimeProps) {
  const compiled = stylex.props(s.time, xstyle);
  return (
    <time
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-time"
    />
  );
}
export type NotificationBodyProps = StyleXProps<ComponentProps<"div">>;
export function NotificationBody({ xstyle, style, ...props }: NotificationBodyProps) {
  const compiled = stylex.props(s.body, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-body"
    />
  );
}
export type NotificationActionsProps = StyleXProps<ComponentProps<"div">>;
export function NotificationActions({ xstyle, style, ...props }: NotificationActionsProps) {
  const compiled = stylex.props(s.actions, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-actions"
    />
  );
}
export type NotificationPreviewProps = StyleXProps<ComponentProps<"div">>;
export function NotificationPreview({ xstyle, style, ...props }: NotificationPreviewProps) {
  const compiled = stylex.props(s.preview, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="notification-preview"
    />
  );
}
export const Notification = Object.assign(NotificationRoot, {
  Root: NotificationRoot,
  Header: NotificationHeader,
  Trigger: NotificationTrigger,
  Panel: NotificationPanel,
  Icon: NotificationIcon,
  Content: NotificationContent,
  Title: NotificationTitle,
  Description: NotificationDescription,
  Time: NotificationTime,
  Body: NotificationBody,
  Preview: NotificationPreview,
  Actions: NotificationActions,
});
export type NotificationProps = NotificationRootProps;
