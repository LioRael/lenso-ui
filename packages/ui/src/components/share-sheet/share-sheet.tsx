"use client";
import type { ComponentProps } from "react";
import { Sheet } from "../sheet/sheet.js";
import { List } from "../list/list.js";
import { Button } from "../button/button.js";
import { shareSheetStyles as s } from "@lenso/tokens/share-sheet";
import * as stylex from "@stylexjs/stylex";
import type { StyleXProps } from "../../utils/styled.js";
export type ShareSheetRootProps = ComponentProps<typeof Sheet.Root>;
const defaultSnapPoints = [1];
export function ShareSheetRoot({ snapPoints = defaultSnapPoints, ...props }: ShareSheetRootProps) {
  return <Sheet.Root {...props} snapPoints={snapPoints} />;
}
export type ShareSheetContentProps = ComponentProps<typeof Sheet.Content>;
export function ShareSheetContent({ xstyle, surfaceXstyle, ...props }: ShareSheetContentProps) {
  return (
    <Sheet.Content
      {...props}
      xstyle={[s.popup, xstyle]}
      surfaceXstyle={[s.surface, surfaceXstyle]}
      data-lenso-slot="share-sheet-popup"
    />
  );
}
export type ShareSheetBodyProps = ComponentProps<typeof Sheet.Body>;
export function ShareSheetBody({ xstyle, ...props }: ShareSheetBodyProps) {
  return <Sheet.Body {...props} xstyle={[s.body, xstyle]} />;
}
export type ShareSheetHeaderProps = StyleXProps<ComponentProps<"div">>;
export function ShareSheetHeader({ xstyle, style, ...props }: ShareSheetHeaderProps) {
  const compiled = stylex.props(s.header, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="share-sheet-header"
    />
  );
}
export type ShareSheetThumbnailProps = StyleXProps<ComponentProps<"span">>;
export function ShareSheetThumbnail({ xstyle, style, ...props }: ShareSheetThumbnailProps) {
  const compiled = stylex.props(s.thumbnail, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="share-sheet-thumbnail"
    />
  );
}
export type ShareSheetMetadataProps = StyleXProps<ComponentProps<"div">>;
export function ShareSheetMetadata({ xstyle, style, ...props }: ShareSheetMetadataProps) {
  const compiled = stylex.props(s.metadata, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="share-sheet-metadata"
    />
  );
}
export type ShareSheetTitleProps = ComponentProps<typeof Sheet.Title>;
export function ShareSheetTitle({ xstyle, ...props }: ShareSheetTitleProps) {
  return <Sheet.Title {...props} xstyle={[s.title, xstyle]} />;
}
export type ShareSheetDescriptionProps = ComponentProps<typeof Sheet.Description>;
export function ShareSheetDescription({ xstyle, ...props }: ShareSheetDescriptionProps) {
  return <Sheet.Description {...props} xstyle={[s.description, xstyle]} />;
}
export type ShareSheetTargetsProps = StyleXProps<ComponentProps<"fieldset">>;
export function ShareSheetTargets({ xstyle, style, ...props }: ShareSheetTargetsProps) {
  const compiled = stylex.props(s.targets, xstyle);
  return (
    <fieldset
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="share-sheet-targets"
    />
  );
}
export type ShareSheetTargetProps = ComponentProps<typeof Button>;
export function ShareSheetTarget({ xstyle, ...props }: ShareSheetTargetProps) {
  return (
    <Button
      variant="borderless"
      {...props}
      xstyle={[s.target, xstyle]}
      data-lenso-slot="share-sheet-target"
    />
  );
}
export type ShareSheetTargetIconProps = StyleXProps<ComponentProps<"span">> & { contact?: boolean };
export function ShareSheetTargetIcon({
  contact = false,
  xstyle,
  style,
  ...props
}: ShareSheetTargetIconProps) {
  const compiled = stylex.props(s.targetIcon, contact && s.contact, xstyle);
  return (
    <span
      aria-hidden="true"
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="share-sheet-target-icon"
      data-contact={contact || undefined}
    />
  );
}
export type ShareSheetActionGroupProps = ComponentProps<typeof List>;
export function ShareSheetActionGroup({ xstyle, ...props }: ShareSheetActionGroupProps) {
  return <List {...props} xstyle={[s.actionGroup, xstyle]} />;
}
export type ShareSheetActionProps = ComponentProps<typeof List.Action>;
export function ShareSheetAction({ xstyle, ...props }: ShareSheetActionProps) {
  return (
    <List.Item xstyle={s.actionRow}>
      <List.Action {...props} xstyle={[s.action, xstyle]} />
    </List.Item>
  );
}
export const ShareSheet = Object.assign(ShareSheetRoot, {
  Root: ShareSheetRoot,
  Trigger: Sheet.Trigger,
  Backdrop: Sheet.Backdrop,
  Content: ShareSheetContent,
  Handle: Sheet.Handle,
  Close: Sheet.Close,
  Body: ShareSheetBody,
  Header: ShareSheetHeader,
  Thumbnail: ShareSheetThumbnail,
  Metadata: ShareSheetMetadata,
  Title: ShareSheetTitle,
  Description: ShareSheetDescription,
  Targets: ShareSheetTargets,
  Target: ShareSheetTarget,
  TargetIcon: ShareSheetTargetIcon,
  ActionGroup: ShareSheetActionGroup,
  Action: ShareSheetAction,
});
export type ShareSheetProps = ShareSheetRootProps;
