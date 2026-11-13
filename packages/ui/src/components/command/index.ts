import {
  CommandRoot,
  CommandBackdrop,
  CommandContent,
  CommandHeader,
  CommandInputGroup,
  CommandSearchIcon,
  CommandViewport,
  CommandSectionLabel,
  CommandIcon,
  CommandItemBody,
  CommandItemContent,
  CommandItemText,
  CommandItemDescription,
  CommandItemMeta,
  CommandMessage,
  CommandFooter,
  CommandHint,
  CommandKey,
  CommandAction,
  CommandActionKey,
  CommandClose,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandSeparator,
  CommandStatus,
} from "./command.js";

export const Command: typeof CommandRoot & {
  Root: typeof CommandRoot;
  Backdrop: typeof CommandBackdrop;
  Content: typeof CommandContent;
  Header: typeof CommandHeader;
  InputGroup: typeof CommandInputGroup;
  SearchIcon: typeof CommandSearchIcon;
  Viewport: typeof CommandViewport;
  SectionLabel: typeof CommandSectionLabel;
  Icon: typeof CommandIcon;
  ItemBody: typeof CommandItemBody;
  ItemContent: typeof CommandItemContent;
  ItemText: typeof CommandItemText;
  ItemDescription: typeof CommandItemDescription;
  ItemMeta: typeof CommandItemMeta;
  Message: typeof CommandMessage;
  Footer: typeof CommandFooter;
  Hint: typeof CommandHint;
  Key: typeof CommandKey;
  Action: typeof CommandAction;
  ActionKey: typeof CommandActionKey;
  Close: typeof CommandClose;

  Input: typeof CommandInput;
  List: typeof CommandList;
  Item: typeof CommandItem;
  Empty: typeof CommandEmpty;
  Group: typeof CommandGroup;
  GroupLabel: typeof CommandGroupLabel;
  Separator: typeof CommandSeparator;
  Status: typeof CommandStatus;
} = Object.assign(CommandRoot, {
  Root: CommandRoot,
  Backdrop: CommandBackdrop,
  Content: CommandContent,
  Header: CommandHeader,
  InputGroup: CommandInputGroup,
  SearchIcon: CommandSearchIcon,
  Viewport: CommandViewport,
  SectionLabel: CommandSectionLabel,
  Icon: CommandIcon,
  ItemBody: CommandItemBody,
  ItemContent: CommandItemContent,
  ItemText: CommandItemText,
  ItemDescription: CommandItemDescription,
  ItemMeta: CommandItemMeta,
  Message: CommandMessage,
  Footer: CommandFooter,
  Hint: CommandHint,
  Key: CommandKey,
  Action: CommandAction,
  ActionKey: CommandActionKey,
  Close: CommandClose,

  Input: CommandInput,
  List: CommandList,
  Item: CommandItem,
  Empty: CommandEmpty,
  Group: CommandGroup,
  GroupLabel: CommandGroupLabel,
  Separator: CommandSeparator,
  Status: CommandStatus,
});

export * from "./command.js";
