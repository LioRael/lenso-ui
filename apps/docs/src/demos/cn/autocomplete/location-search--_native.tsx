// Generated source-backed helper adaptation from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/**
 * Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0.
 * Modified: native Base UI selection, popup search and removable chips.
 */
import { Autocomplete, Avatar, Spinner } from "@lenso/ui";
import { autocompleteSharedStyles } from "@lenso/tokens/autocomplete";
import { searchFieldStyles, searchFieldGroupStyles } from "@lenso/tokens/search-field";
import { tagStyles } from "@lenso/tokens/tag";
import { Magnifier, Xmark } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { useId, useRef, useState, type ReactNode } from "react";
export interface Option {
  id: string;
  name: string;
  email?: string;
  country?: string;
  role?: string;
  avatarUrl?: string;
  fallback?: string;
  disabled?: boolean;
  searchText?: string;
}
export const styles = stylex.create({
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: 256,
    maxWidth: "100%",
  },
  wide: {
    width: "100%",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  surface: {
    backgroundColor: "var(--surface)",
    width: 320,
    maxWidth: "100%",
    borderRadius: 24,
    padding: 24,
  },
  fullSurface: {
    width: 380,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  details: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  muted: {
    color: "var(--muted)",
    fontSize: 12,
  },
  search: {
    flexShrink: 0,
    paddingInline: 12,
    paddingBlock: 4,
  },
  searchGroup: {
    height: 36,
    overflow: "hidden",
    fontSize: 14,
    backgroundColor: {
      default: "var(--default)",
      ":focus-within": "var(--default)",
    },
  },
  input: {
    flexGrow: 1,
    width: 0,
    paddingInline: 8,
  },
  list: {
    maxHeight: 320,
    overflowY: "auto",
  },
  fieldGroup: {
    width: "100%",
  },
  chipShell: {
    paddingInlineEnd: 28,
    gap: 0,
    ":focus-within": {
      outline: "2px solid var(--focus)",
      outlineOffset: 2,
    },
  },
  toggle: {
    position: "absolute",
    insetInlineEnd: 0,
    top: 0,
    bottom: 0,
    flexShrink: 0,
    width: 24,
    minHeight: 24,
    padding: 0,
    borderWidth: 0,
    boxShadow: "none",
    backgroundColor: {
      default: "transparent",
      ":hover": "transparent",
      ":focus-visible": "transparent",
    },
    outline: {
      default: "none",
      ":focus-visible": "none",
    },
  },
  trigger: {
    width: "100%",
    textAlign: "start",
  },
  triggerWithClear: {
    paddingInlineEnd: 52,
  },
  clear: {
    position: "absolute",
    insetInlineEnd: 28,
    top: "50%",
    transform: "translateY(-50%)",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    flexGrow: 1,
    minWidth: 0,
  },
  searchClear: {
    width: 20,
    height: 20,
    marginInlineEnd: 8,
    borderRadius: "var(--radius-xl)",
  },
  chip: {
    lineHeight: "16px",
  },
  smallAvatar: {
    width: 16,
    height: 16,
  },
  customField: {
    width: "100%",
    maxWidth: 384,
    paddingTop: 24,
    gap: 6,
  },
  customTrigger: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    boxShadow: "0 1px 2px #0000000d, 0 0 0 1px color-mix(in oklch, var(--accent) 5%, transparent)",
    ":focus-visible": {
      borderColor: "color-mix(in oklch, var(--accent) 25%, transparent)",
      outline: "2px solid color-mix(in oklch, var(--accent) 15%, transparent)",
    },
  },
  customPopup: {
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    boxShadow: "0 20px 25px -5px #0000001a",
  },
  customChip: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--accent) 15%, transparent)",
    backgroundColor: "color-mix(in oklch, var(--accent) 8%, transparent)",
  },
  customItem: {
    borderRadius: 8,
    ":is([data-highlighted])": {
      backgroundColor: "color-mix(in oklch, var(--accent) 10%, transparent)",
    },
    ":is([data-selected])": {
      backgroundColor: "color-mix(in oklch, var(--accent) 5%, transparent)",
    },
  },
});
export function OptionAvatar({ item, small = false }: { item: Option; small?: boolean }) {
  return (
    <Avatar size="sm" xstyle={small && styles.smallAvatar}>
      <Avatar.Image src={item.avatarUrl} alt="" />
      <Avatar.Fallback>{item.fallback}</Avatar.Fallback>
    </Avatar>
  );
}
export function OptionContent({ item }: { item: Option }) {
  return (
    <span {...stylex.props(styles.row)}>
      {item.avatarUrl && <OptionAvatar item={item} />}
      <span {...stylex.props(styles.details)}>
        <span>{item.name}</span>
        {(item.email || item.country || item.role) && (
          <span {...stylex.props(styles.muted)}>{item.email || item.country || item.role}</span>
        )}
      </span>
    </span>
  );
}
interface DemoProps {
  items: Option[];
  label: string;
  placeholder?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  description?: string;
  multiple?: boolean;
  chips?: boolean;
  hideClear?: boolean;
  chipText?: (item: Option) => ReactNode;
  renderValue?: (item: Option) => ReactNode;
  renderItem?: (item: Option) => ReactNode;
  value?: Option | Option[] | null;
  defaultValue?: Option | Option[] | null;
  onValueChange?: (value: Option | Option[] | null) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  inputValue?: string;
  onInputValueChange?: (value: string) => void;
  filteredItems?: Option[];
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  error?: string;
  name?: string;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  custom?: boolean;
  indicator?: ReactNode;
  virtualized?: boolean;
  onItemHighlighted?: (item: Option | undefined) => void;
  list?: ReactNode;
  xstyle?: stylex.StyleXStyles;
}
export function NativeAutocomplete({
  items,
  label,
  placeholder = "Select one",
  searchLabel = "Search options",
  searchPlaceholder = "Search...",
  description,
  multiple = false,
  chips = false,
  hideClear = false,
  chipText = (item) => item.name,
  renderValue,
  renderItem = (item) => <OptionContent item={item} />,
  value,
  defaultValue,
  onValueChange,
  open,
  onOpenChange,
  inputValue,
  onInputValueChange,
  filteredItems,
  emptyText = "No results found",
  loading = false,
  disabled,
  required,
  invalid,
  error,
  name,
  variant,
  fullWidth,
  custom,
  indicator,
  virtualized,
  onItemHighlighted,
  list,
  xstyle,
}: DemoProps) {
  const id = useId();
  const { contains } = Autocomplete.useFilter({
    sensitivity: "base",
  });
  const fieldRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState<Option | Option[] | null>(
    defaultValue ?? (multiple ? [] : null),
  );
  const [localQuery, setLocalQuery] = useState("");
  const query = inputValue ?? localQuery;
  const changeQuery = (next: string) => {
    setLocalQuery(next);
    onInputValueChange?.(next);
  };
  const selected = value === undefined ? localValue : value;
  const selectedItems = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const showChips = chips && selectedItems.length > 0;
  return (
    <div
      {...stylex.props(
        styles.field,
        fullWidth && styles.wide,
        custom && styles.customField,
        xstyle,
      )}
    >
      <Autocomplete<Option, boolean>
        items={items}
        multiple={multiple}
        value={selected}
        onValueChange={(next) => {
          setLocalValue(next);
          onValueChange?.(next);
        }}
        itemToStringLabel={(item) => item.name}
        itemToStringValue={(item) => item.id}
        isItemEqualToValue={(a, b) => a.id === b.id}
        filter={(item, inputQuery) =>
          contains(
            item.searchText ?? `${item.name} ${item.email ?? ""} ${item.role ?? ""}`,
            inputQuery,
          )
        }
        filteredItems={filteredItems}
        open={open}
        onOpenChange={onOpenChange}
        inputValue={query}
        onInputValueChange={changeQuery}
        disabled={disabled}
        required={required}
        name={name}
        variant={variant}
        fullWidth={fullWidth}
        virtualized={virtualized}
        onItemHighlighted={onItemHighlighted}
      >
        <Autocomplete.Label>
          <span id={`${id}-label`}>
            {label}
            {required && " *"}
          </span>
        </Autocomplete.Label>
        <Autocomplete.InputGroup
          ref={fieldRef}
          aria-labelledby={`${id}-label`}
          xstyle={[
            styles.fieldGroup,
            showChips && autocompleteSharedStyles.trigger,
            showChips && variant === "secondary" && autocompleteSharedStyles.secondary,
            showChips && styles.chipShell,
            showChips && custom && styles.customTrigger,
          ]}
        >
          {showChips && (
            <Autocomplete.Chips xstyle={styles.chips}>
              {selectedItems.map((item) => (
                <Autocomplete.Chip
                  key={item.id}
                  xstyle={[
                    tagStyles.root,
                    tagStyles.sm,
                    tagStyles.default,
                    styles.chip,
                    custom && styles.customChip,
                  ]}
                >
                  {item.avatarUrl && <OptionAvatar item={item} small />}
                  {chipText(item)}
                  <Autocomplete.ChipRemove aria-label={`Remove ${item.name}`}>
                    <Xmark width={12} height={12} aria-hidden="true" />
                  </Autocomplete.ChipRemove>
                </Autocomplete.Chip>
              ))}
            </Autocomplete.Chips>
          )}
          {showChips && !hideClear && <Autocomplete.Clear aria-label={`Clear ${label}`} />}
          <Autocomplete.Trigger
            aria-labelledby={`${id}-label`}
            aria-describedby={description || error ? `${id}-description` : undefined}
            aria-invalid={invalid || undefined}
            xstyle={[
              styles.trigger,
              !showChips && !hideClear && styles.triggerWithClear,
              custom && styles.customTrigger,
              showChips && styles.toggle,
            ]}
          >
            <Autocomplete.Value placeholder={placeholder}>
              {showChips
                ? () => null
                : renderValue
                  ? (current: Option | null) => (current ? renderValue(current) : placeholder)
                  : undefined}
            </Autocomplete.Value>
            <Autocomplete.Indicator>{indicator}</Autocomplete.Indicator>
          </Autocomplete.Trigger>
          {!showChips && !hideClear && (
            <Autocomplete.Clear aria-label={`Clear ${label}`} xstyle={styles.clear} />
          )}
        </Autocomplete.InputGroup>
        <Autocomplete.Portal>
          <Autocomplete.Positioner anchor={fieldRef}>
            <Autocomplete.Popover xstyle={custom && styles.customPopup}>
              <div {...stylex.props(searchFieldStyles.root, styles.search)}>
                <div
                  {...stylex.props(
                    searchFieldGroupStyles.root,
                    searchFieldGroupStyles.secondary,
                    styles.searchGroup,
                  )}
                >
                  <Magnifier {...stylex.props(searchFieldStyles.icon)} aria-hidden="true" />
                  <Autocomplete.Input
                    ref={searchRef}
                    aria-label={searchLabel}
                    placeholder={searchPlaceholder}
                    xstyle={styles.input}
                  />
                  {loading && <Spinner size="sm" aria-label="Searching" />}
                  {!loading && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      disabled={!query}
                      {...stylex.props(searchFieldStyles.clear, styles.searchClear)}
                      onClick={() => {
                        changeQuery("");
                        searchRef.current?.focus();
                      }}
                    >
                      <Xmark width={12} height={12} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <Autocomplete.Empty>{loading ? "搜索中…" : emptyText}</Autocomplete.Empty>
              {list ?? (
                <Autocomplete.List xstyle={styles.list}>
                  {(item: Option) => (
                    <Autocomplete.Item
                      key={item.id}
                      value={item}
                      disabled={item.disabled}
                      xstyle={custom && styles.customItem}
                    >
                      {renderItem(item)}
                      <Autocomplete.ItemIndicator />
                    </Autocomplete.Item>
                  )}
                </Autocomplete.List>
              )}
            </Autocomplete.Popover>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
        {(description || error) && (
          <span id={`${id}-description`} {...stylex.props(styles.muted)}>
            {error || description}
          </span>
        )}
      </Autocomplete>
    </div>
  );
}
