import CommandSearchIcon from "./command-search-icon.svelte";
export { CommandSearchIcon };
import CommandViewport from "./command-viewport.svelte";
export { CommandViewport };
import CommandActionKey from "./command-action-key.svelte";
export { CommandActionKey };
import CommandKey from "./command-key.svelte";
export { CommandKey };
import CommandAction from "./command-action.svelte";
export { CommandAction };
import CommandIcon from "./command-icon.svelte";
export { CommandIcon };
import CommandSectionLabel from "./command-section-label.svelte";
export { CommandSectionLabel };
import { CommandItems } from "@ui-sdk/svelte/command";
import { Dialog as CommandDialog } from "@ui-sdk/svelte/dialog";
import CommandRoot from "./command-root.svelte";
import CommandInput from "./command-input.svelte";
import CommandList from "./command-list.svelte";
import CommandItem from "./command-item.svelte";
import CommandItemText from "./command-item-text.svelte";
import CommandItemIcon from "./command-item-icon.svelte";
import CommandItemBody from "./command-item-body.svelte";
import CommandItemContent from "./command-item-content.svelte";
import CommandItemDescription from "./command-item-description.svelte";
import CommandItemMeta from "./command-item-meta.svelte";
import CommandGroup from "./command-group.svelte";
import CommandGroupLabel from "./command-group-label.svelte";
import CommandSeparator from "./command-separator.svelte";
import CommandEmpty from "./command-empty.svelte";
import CommandStatus from "./command-status.svelte";
import CommandTrigger from "./command-trigger.svelte";
import CommandBackdrop from "./command-backdrop.svelte";
import CommandContent from "./command-content.svelte";
import CommandClose from "./command-close.svelte";
import CommandInputGroup from "./command-input-group.svelte";
import CommandHeader from "./command-header.svelte";
import CommandFooter from "./command-footer.svelte";
import CommandHint from "./command-hint.svelte";
import CommandMessage from "./command-message.svelte";

export {
  CommandRoot,
  CommandInput,
  CommandList,
  CommandItem,
  CommandItemText,
  CommandItemIcon,
  CommandItemBody,
  CommandItemContent,
  CommandItemDescription,
  CommandItemMeta,
  CommandGroup,
  CommandGroupLabel,
  CommandSeparator,
  CommandEmpty,
  CommandStatus,
  CommandTrigger,
  CommandBackdrop,
  CommandContent,
  CommandClose,
  CommandInputGroup,
  CommandHeader,
  CommandFooter,
  CommandHint,
  CommandMessage,
  CommandItems,
  CommandDialog,
};
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
