import {
  CommandRoot,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandSeparator,
  CommandCollection,
  CommandStatus,
  CommandClear,
  useCommandFilter,
} from "./command.js";

export const Command: typeof CommandRoot & {
  Root: typeof CommandRoot;
  Input: typeof CommandInput;
  List: typeof CommandList;
  Item: typeof CommandItem;
  Empty: typeof CommandEmpty;
  Group: typeof CommandGroup;
  GroupLabel: typeof CommandGroupLabel;
  Separator: typeof CommandSeparator;
  Collection: typeof CommandCollection;
  Status: typeof CommandStatus;
  Clear: typeof CommandClear;
  useFilter: typeof useCommandFilter;
} = Object.assign(CommandRoot, {
  Root: CommandRoot,
  Input: CommandInput,
  List: CommandList,
  Item: CommandItem,
  Empty: CommandEmpty,
  Group: CommandGroup,
  GroupLabel: CommandGroupLabel,
  Separator: CommandSeparator,
  Collection: CommandCollection,
  Status: CommandStatus,
  Clear: CommandClear,
  useFilter: useCommandFilter,
});

export * from "./command.js";
