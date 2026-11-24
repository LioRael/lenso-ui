import { toolbarStyles } from "@lenso/tokens/toolbar";
import { linkStyles } from "@lenso/tokens/link";
import {
  Toolbar as SdkRoot,
  ToolbarButton as SdkButton,
  ToolbarLink as SdkLink,
  ToolbarInput as SdkInput,
  ToolbarGroup as SdkGroup,
  ToolbarSeparator as SdkSeparator,
} from "@ui-sdk/solid/toolbar";
import { sdkPart, type StyledPart } from "./parts.js";

export const ToolbarRoot: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "toolbar", (props) => [
  toolbarStyles.root,
  props.orientation === "vertical" && toolbarStyles.vertical,
]);
export const ToolbarButton: StyledPart<typeof SdkButton> = sdkPart(
  SdkButton,
  "toolbar-button",
  () => toolbarStyles.button,
);
export const ToolbarLink: StyledPart<typeof SdkLink> = sdkPart(
  SdkLink,
  "toolbar-link",
  () => linkStyles.root,
);
export const ToolbarInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "toolbar-input",
  () => undefined,
);
export const ToolbarGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "toolbar-group",
  () => toolbarStyles.group,
);
export const ToolbarSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "toolbar-separator",
  () => toolbarStyles.separator,
);

export const Toolbar: typeof ToolbarRoot & {
  Root: typeof ToolbarRoot;
  Button: typeof ToolbarButton;
  Link: typeof ToolbarLink;
  Input: typeof ToolbarInput;
  Group: typeof ToolbarGroup;
  Separator: typeof ToolbarSeparator;
} = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Input: ToolbarInput,
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
});
