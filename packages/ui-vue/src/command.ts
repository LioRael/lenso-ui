import { SearchFieldIcon as CommandSearchIconBase } from "./search-field.js";
import { ScrollShadow as CommandViewportBase } from "./scroll-shadow.js";
import { Kbd as CommandActionKeyBase } from "./kbd.js";
import { Kbd as CommandKeyBase } from "./kbd.js";
import { GlassButton as CommandActionBase } from "./glass-button.js";
import { commandStyles } from "@lenso/tokens/command";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Command as SdkRoot,
  CommandInput as SdkInput,
  CommandList as SdkList,
  CommandItem as SdkItem,
  CommandItemText as SdkItemText,
  CommandItemIcon as SdkItemIcon,
  CommandGroup as SdkGroup,
  CommandGroupLabel as SdkGroupLabel,
  CommandSeparator as SdkSeparator,
  CommandEmpty as SdkEmpty,
  CommandStatus as SdkStatus,
  CommandItems as SdkItems,
} from "@ui-sdk/vue/command";
import {
  Dialog as SdkDialog,
  DialogTrigger as SdkTrigger,
  DialogBackdrop as SdkBackdrop,
  DialogContent as SdkContent,
  DialogClose as SdkClose,
} from "@ui-sdk/vue/dialog";
import { defineComponent, h, type Component } from "vue";
import { forwardPart, htmlPart, sdkPart, type StyledPart, type StyleXArgument } from "./parts.js";

export const CommandRoot: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "command", () => [
  materialStyles.root,
  materialStyles.accessible,
  commandStyles.root,
]);
export const CommandInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "command-input",
  () => commandStyles.input,
);
export const CommandList: StyledPart<typeof SdkList> = sdkPart(
  SdkList,
  "command-list",
  () => commandStyles.list,
);
export const CommandItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "command-item",
  () => commandStyles.item,
);
export const CommandItemText: StyledPart<typeof SdkItemText> = sdkPart(
  SdkItemText,
  "command-item-text",
  () => commandStyles.itemText,
);
export const CommandItemIcon: StyledPart<typeof SdkItemIcon> = sdkPart(
  SdkItemIcon,
  "command-item-icon",
  () => commandStyles.icon,
);
export const CommandItemBody = htmlPart("span", "command-item-body", () => commandStyles.itemBody);
export const CommandItemContent = htmlPart(
  "span",
  "command-item-content",
  () => commandStyles.itemContent,
);
export const CommandItemDescription = htmlPart(
  "span",
  "command-item-description",
  () => commandStyles.itemDescription,
);
export const CommandItemMeta = htmlPart("span", "command-item-meta", () => commandStyles.itemMeta);
export const CommandGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "command-group",
  () => undefined,
);
export const CommandGroupLabel: StyledPart<typeof SdkGroupLabel> = sdkPart(
  SdkGroupLabel,
  "command-group-label",
  () => commandStyles.sectionLabel,
);
export const CommandSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "command-separator",
  () => commandStyles.separator,
);
export const CommandEmpty: StyledPart<typeof SdkEmpty> = sdkPart(
  SdkEmpty,
  "command-empty",
  () => commandStyles.empty,
);
export const CommandStatus: StyledPart<typeof SdkStatus> = sdkPart(
  SdkStatus,
  "command-status",
  () => commandStyles.status,
);
export const CommandItems: typeof SdkItems = forwardPart(SdkItems);
export const CommandDialog: typeof SdkDialog = forwardPart(SdkDialog);
export const CommandTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "command-trigger",
  () => undefined,
);
export const CommandBackdrop: StyledPart<typeof SdkBackdrop> = sdkPart(
  SdkBackdrop,
  "command-backdrop",
  () => commandStyles.backdrop,
);
export const CommandContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "command-content",
  () => [materialStyles.root, materialStyles.accessible, commandStyles.popup],
);
export const CommandClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "command-close",
  () => commandStyles.close,
);
export const CommandInputGroup = htmlPart(
  "div",
  "command-input-group",
  () => commandStyles.inputGroup,
);
export const CommandHeader = htmlPart("div", "command-header", () => commandStyles.header);
export const CommandFooter = htmlPart("div", "command-footer", () => commandStyles.footer);
export const CommandHint = htmlPart("span", "command-hint", () => commandStyles.hint);
export const CommandMessage = htmlPart("p", "command-message", () => commandStyles.message);

export const CommandIcon = htmlPart("span", "command-icon", () => commandStyles.icon);
export const CommandSectionLabel = htmlPart(
  "div",
  "command-section-label",
  () => commandStyles.sectionLabel,
);
function commandPart<C extends Component>(
  part: C,
  styles: StyleXArgument,
  defaults: Record<string, unknown>,
): C {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          part,
          { ...defaults, ...attrs, xstyle: [styles, attrs["xstyle"] as StyleXArgument] },
          slots,
        );
    },
  }) as unknown as C;
}
export const CommandAction: typeof CommandActionBase = commandPart(
  CommandActionBase,
  commandStyles.action,
  { size: "sm", "data-lenso-slot": "command-action" },
);
export const CommandKey: typeof CommandKeyBase = commandPart(CommandKeyBase, commandStyles.key, {
  variant: "light",
  "data-lenso-slot": "command-key",
});
export const CommandActionKey: typeof CommandActionKeyBase = commandPart(
  CommandActionKeyBase,
  commandStyles.actionKey,
  { variant: "light", "data-lenso-slot": "command-action-key" },
);
export const CommandViewport: typeof CommandViewportBase = commandPart(
  CommandViewportBase,
  commandStyles.viewport,
  { "data-lenso-slot": "command-viewport" },
);
export const CommandSearchIcon: typeof CommandSearchIconBase = commandPart(
  CommandSearchIconBase,
  commandStyles.searchIcon,
  { "data-lenso-slot": "command-search-icon" },
);
export const Command: typeof CommandRoot & {
  Icon: typeof CommandIcon;
  SectionLabel: typeof CommandSectionLabel;
  Action: typeof CommandAction;
  Key: typeof CommandKey;
  ActionKey: typeof CommandActionKey;
  Viewport: typeof CommandViewport;
  SearchIcon: typeof CommandSearchIcon;
  Root: typeof CommandRoot;
  Input: typeof CommandInput;
  List: typeof CommandList;
  Item: typeof CommandItem;
  ItemText: typeof CommandItemText;
  ItemIcon: typeof CommandItemIcon;
  ItemBody: typeof CommandItemBody;
  ItemContent: typeof CommandItemContent;
  ItemDescription: typeof CommandItemDescription;
  ItemMeta: typeof CommandItemMeta;
  Group: typeof CommandGroup;
  GroupLabel: typeof CommandGroupLabel;
  Separator: typeof CommandSeparator;
  Empty: typeof CommandEmpty;
  Status: typeof CommandStatus;
  Items: typeof CommandItems;
  Dialog: typeof CommandDialog;
  Trigger: typeof CommandTrigger;
  Backdrop: typeof CommandBackdrop;
  Content: typeof CommandContent;
  Close: typeof CommandClose;
  InputGroup: typeof CommandInputGroup;
  Header: typeof CommandHeader;
  Footer: typeof CommandFooter;
  Hint: typeof CommandHint;
  Message: typeof CommandMessage;
} = Object.assign(CommandRoot, {
  Icon: CommandIcon,
  SectionLabel: CommandSectionLabel,
  Action: CommandAction,
  Key: CommandKey,
  ActionKey: CommandActionKey,
  Viewport: CommandViewport,
  SearchIcon: CommandSearchIcon,
  Root: CommandRoot,
  Input: CommandInput,
  List: CommandList,
  Item: CommandItem,
  ItemText: CommandItemText,
  ItemIcon: CommandItemIcon,
  ItemBody: CommandItemBody,
  ItemContent: CommandItemContent,
  ItemDescription: CommandItemDescription,
  ItemMeta: CommandItemMeta,
  Group: CommandGroup,
  GroupLabel: CommandGroupLabel,
  Separator: CommandSeparator,
  Empty: CommandEmpty,
  Status: CommandStatus,
  Items: CommandItems,
  Dialog: CommandDialog,
  Trigger: CommandTrigger,
  Backdrop: CommandBackdrop,
  Content: CommandContent,
  Close: CommandClose,
  InputGroup: CommandInputGroup,
  Header: CommandHeader,
  Footer: CommandFooter,
  Hint: CommandHint,
  Message: CommandMessage,
});
