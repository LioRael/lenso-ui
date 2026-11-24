import { shareSheetStyles } from "@lenso/tokens/share-sheet";
import { sheetStyles } from "@lenso/tokens/sheet";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Drawer as SdkRoot,
  DrawerTrigger as SdkTrigger,
  DrawerBackdrop as SdkBackdrop,
  DrawerContent as SdkContent,
  DrawerTitle as SdkTitle,
  DrawerDescription as SdkDescription,
} from "@ui-sdk/solid/drawer";
import { createComponent, type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const ShareSheetRoot = (props: ComponentProps<typeof SdkRoot>) =>
  createComponent(SdkRoot, props);
export const ShareSheetTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "share-sheet-trigger",
  () => undefined,
);
export const ShareSheetBackdrop: StyledPart<typeof SdkBackdrop> = sdkPart(
  SdkBackdrop,
  "share-sheet-backdrop",
  () => sheetStyles.backdrop,
);
export const ShareSheetContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "share-sheet-content",
  () => [sheetStyles.nativeContent, shareSheetStyles.popup],
);
export const ShareSheetSurface = htmlPart("div", "share-sheet-surface", () => [
  materialStyles.root,
  materialStyles.accessible,
  shareSheetStyles.surface,
]);
export const ShareSheetHeader = htmlPart(
  "div",
  "share-sheet-header",
  () => shareSheetStyles.header,
);
export const ShareSheetTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "share-sheet-title",
  () => shareSheetStyles.title,
);
export const ShareSheetDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "share-sheet-description",
  () => shareSheetStyles.description,
);
export const ShareSheetThumbnail = htmlPart(
  "div",
  "share-sheet-thumbnail",
  () => shareSheetStyles.thumbnail,
);
export const ShareSheetMetadata = htmlPart(
  "div",
  "share-sheet-metadata",
  () => shareSheetStyles.metadata,
);
export const ShareSheetBody = htmlPart("div", "share-sheet-body", () => shareSheetStyles.body);
export const ShareSheetTargets = htmlPart(
  "div",
  "share-sheet-targets",
  () => shareSheetStyles.targets,
);
export const ShareSheetTarget = htmlPart(
  "button",
  "share-sheet-target",
  () => shareSheetStyles.target,
);
export const ShareSheetTargetIcon = htmlPart(
  "span",
  "share-sheet-target-icon",
  () => shareSheetStyles.targetIcon,
);
export const ShareSheetContact = htmlPart(
  "div",
  "share-sheet-contact",
  () => shareSheetStyles.contact,
);
export const ShareSheetActionGroup = htmlPart(
  "div",
  "share-sheet-action-group",
  () => shareSheetStyles.actionGroup,
);
export const ShareSheetActionRow = htmlPart(
  "div",
  "share-sheet-action-row",
  () => shareSheetStyles.actionRow,
);
export const ShareSheetAction = htmlPart(
  "button",
  "share-sheet-action",
  () => shareSheetStyles.action,
);

export const ShareSheet: typeof ShareSheetRoot & {
  Root: typeof ShareSheetRoot;
  Trigger: typeof ShareSheetTrigger;
  Backdrop: typeof ShareSheetBackdrop;
  Content: typeof ShareSheetContent;
  Surface: typeof ShareSheetSurface;
  Header: typeof ShareSheetHeader;
  Title: typeof ShareSheetTitle;
  Description: typeof ShareSheetDescription;
  Thumbnail: typeof ShareSheetThumbnail;
  Metadata: typeof ShareSheetMetadata;
  Body: typeof ShareSheetBody;
  Targets: typeof ShareSheetTargets;
  Target: typeof ShareSheetTarget;
  TargetIcon: typeof ShareSheetTargetIcon;
  Contact: typeof ShareSheetContact;
  ActionGroup: typeof ShareSheetActionGroup;
  ActionRow: typeof ShareSheetActionRow;
  Action: typeof ShareSheetAction;
} = Object.assign(ShareSheetRoot, {
  Root: ShareSheetRoot,
  Trigger: ShareSheetTrigger,
  Backdrop: ShareSheetBackdrop,
  Content: ShareSheetContent,
  Surface: ShareSheetSurface,
  Header: ShareSheetHeader,
  Title: ShareSheetTitle,
  Description: ShareSheetDescription,
  Thumbnail: ShareSheetThumbnail,
  Metadata: ShareSheetMetadata,
  Body: ShareSheetBody,
  Targets: ShareSheetTargets,
  Target: ShareSheetTarget,
  TargetIcon: ShareSheetTargetIcon,
  Contact: ShareSheetContact,
  ActionGroup: ShareSheetActionGroup,
  ActionRow: ShareSheetActionRow,
  Action: ShareSheetAction,
});
