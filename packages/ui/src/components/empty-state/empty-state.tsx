"use client";
// Apple anatomy from the owner-supplied kit.
import { emptyStateStyles } from "@lenso/tokens/empty-state";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
import type { ComponentProps } from "react";
export function EmptyStateRoot({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(emptyStateStyles.root, xstyle);
  return (
    <div {...props} data-slot="empty-state" {...compiled} style={{ ...compiled.style, ...style }} />
  );
}
export function EmptyStateContent({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(emptyStateStyles.content, xstyle);
  return (
    <div
      {...props}
      data-slot="empty-state-content"
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function EmptyStateMessage({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(emptyStateStyles.message, xstyle);
  return (
    <div
      {...props}
      data-slot="empty-state-message"
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function EmptyStateTitle({
  xstyle,
  style,
  children,
  ...props
}: StyleXProps<ComponentProps<"h3">>) {
  const compiled = stylex.props(emptyStateStyles.title, xstyle);
  return (
    <h3
      {...props}
      data-slot="empty-state-title"
      {...compiled}
      style={{ ...compiled.style, ...style }}
    >
      {children}
    </h3>
  );
}
export function EmptyStateDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<"p">>) {
  const compiled = stylex.props(emptyStateStyles.description, xstyle);
  return (
    <p
      {...props}
      data-slot="empty-state-description"
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function EmptyStateActions({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(emptyStateStyles.actions, xstyle);
  return (
    <div
      {...props}
      data-slot="empty-state-actions"
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export type EmptyStateIconProps = StyleXProps<ComponentProps<"div">> & {
  variant?: "symbol" | "circle";
};
export function EmptyStateIcon({
  variant = "symbol",
  xstyle,
  style,
  ...props
}: EmptyStateIconProps) {
  const compiled = stylex.props(
    emptyStateStyles.icon,
    variant === "circle" && emptyStateStyles.circle,
    xstyle,
  );
  return (
    <div
      aria-hidden="true"
      {...props}
      data-slot="empty-state-icon"
      data-variant={variant}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const EmptyState = Object.assign(EmptyStateRoot, {
  Root: EmptyStateRoot,
  Content: EmptyStateContent,
  Icon: EmptyStateIcon,
  Message: EmptyStateMessage,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});
export type EmptyStateRootProps = ComponentProps<typeof EmptyStateRoot>;
export type EmptyStateProps = EmptyStateRootProps;
export type EmptyStateContentProps = ComponentProps<typeof EmptyStateContent>;
export type EmptyStateMessageProps = ComponentProps<typeof EmptyStateMessage>;
export type EmptyStateTitleProps = ComponentProps<typeof EmptyStateTitle>;
export type EmptyStateDescriptionProps = ComponentProps<typeof EmptyStateDescription>;
export type EmptyStateActionsProps = ComponentProps<typeof EmptyStateActions>;
export type EmptyState = {
  Props: EmptyStateProps;
  RootProps: EmptyStateRootProps;
  ContentProps: EmptyStateContentProps;
  IconProps: EmptyStateIconProps;
  MessageProps: EmptyStateMessageProps;
  TitleProps: EmptyStateTitleProps;
  DescriptionProps: EmptyStateDescriptionProps;
  ActionsProps: EmptyStateActionsProps;
};
