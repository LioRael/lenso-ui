"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { createContext, useContext, useState, type RefAttributes } from "react";

const CommandReadOnly = createContext(false);

export type CommandRootProps<Value> = Omit<
  Autocomplete.Root.Props<Value>,
  "inline" | "open" | "defaultOpen" | "onOpenChange" | "mode" | "filter" | "items" | "filteredItems"
> & {
  items?: readonly Value[];
  filteredItems?: readonly Value[];
  filter?: Autocomplete.Root.Props<Value>["filter"] | false;
};

/** An inline command list. Compose with Dialog when an overlay is needed. */
export function CommandRoot<Value>({
  value,
  defaultValue = "",
  onValueChange,
  filter,
  autoHighlight = "always",
  keepHighlight = true,
  readOnly = false,
  ...props
}: CommandRootProps<Value>) {
  const [query, setQuery] = useState(defaultValue);
  return (
    <CommandReadOnly value={readOnly}>
      <Autocomplete.Root
        {...props}
        readOnly={readOnly}
        inline
        open
        autoHighlight={autoHighlight}
        keepHighlight={keepHighlight}
        filter={filter === false ? null : filter}
        value={value ?? query}
        onValueChange={(next, details) => {
          // Executing a command must not replace the query with its label.
          if (details.reason === "item-press") {
            details.cancel();
            return;
          }
          onValueChange?.(next, details);
          if (!details.isCanceled) setQuery(next);
        }}
      />
    </CommandReadOnly>
  );
}

export type CommandItemProps<Value = string> = Omit<Autocomplete.Item.Props, "value" | "onSelect"> &
  RefAttributes<HTMLDivElement> & {
    value: Value;
    onSelect?: (value: Value) => void;
  };

export function CommandItem<Value = string>({
  value,
  onClick,
  onSelect,
  ...props
}: CommandItemProps<Value>) {
  const readOnly = useContext(CommandReadOnly);
  return (
    <Autocomplete.Item
      {...props}
      value={value}
      onClick={(event) => {
        onClick?.(event);
        if (!readOnly && !event.defaultPrevented && !event.baseUIHandlerPrevented)
          onSelect?.(value);
      }}
    />
  );
}

export type CommandInputProps = Autocomplete.Input.Props;
export function CommandInput({ onKeyDown, ...props }: CommandInputProps) {
  return (
    <Autocomplete.Input
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
          event.preventBaseUIHandler();
        }
      }}
    />
  );
}
export const CommandList: typeof Autocomplete.List = Autocomplete.List;
export const CommandEmpty: typeof Autocomplete.Empty = Autocomplete.Empty;
export const CommandGroup: typeof Autocomplete.Group = Autocomplete.Group;
export const CommandGroupLabel: typeof Autocomplete.GroupLabel = Autocomplete.GroupLabel;
export const CommandSeparator: typeof Autocomplete.Separator = Autocomplete.Separator;
export const CommandCollection: typeof Autocomplete.Collection = Autocomplete.Collection;
export const CommandStatus: typeof Autocomplete.Status = Autocomplete.Status;
export const CommandClear: typeof Autocomplete.Clear = Autocomplete.Clear;
export const useCommandFilter: typeof Autocomplete.useFilter = Autocomplete.useFilter;
