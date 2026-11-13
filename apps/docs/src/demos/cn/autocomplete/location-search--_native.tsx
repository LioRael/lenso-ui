"use client";

/**
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0.
 * Modified: native Base UI selection, popup search and removable chips.
 */
import { ComboBox, Avatar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId, useState, type ReactNode } from "react";
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
    backgroundColor: "var(--lenso-background-grouped-secondary)",
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
    color: "var(--lenso-label-secondary)",
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
    backgroundColor: "var(--lenso-control-fill)",
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
      outline: "2px solid var(--lenso-focus-ring)",
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
    backgroundColor: "transparent",
    outline: "none",
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
    borderRadius: "var(--lenso-shape-content-xl)",
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
    borderColor: "color-mix(in oklch, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    boxShadow: "var(--lenso-surface-shadow)",
    ":focus-visible": {
      borderColor: "color-mix(in oklch, var(--lenso-tint) 25%, transparent)",
      outline: "2px solid color-mix(in oklch, var(--lenso-tint) 15%, transparent)",
    },
  },
  customPopup: {
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    boxShadow: "var(--lenso-overlay-shadow)",
  },
  customChip: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--lenso-tint) 15%, transparent)",
    backgroundColor: "color-mix(in oklch, var(--lenso-tint) 8%, transparent)",
  },
  customItem: {
    borderRadius: 8,
    ":is([data-highlighted])": {
      backgroundColor: "color-mix(in oklch, var(--lenso-tint) 10%, transparent)",
    },
    ":is([data-selected])": {
      backgroundColor: "color-mix(in oklch, var(--lenso-tint) 5%, transparent)",
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
  query?: string;
  onQueryChange?: (value: string) => void;
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
export function OptionPicker({
  items,
  label,
  placeholder,
  description,
  multiple = false,
  hideClear,
  chipText = (item) => item.name,
  renderValue,
  renderItem = (item) => <OptionContent item={item} />,
  value,
  defaultValue,
  onValueChange,
  open,
  onOpenChange,
  query,
  onQueryChange,
  filteredItems,
  emptyText = "No results found",
  loading,
  disabled,
  required,
  invalid,
  error,
  name,
  variant,
  fullWidth,
  custom,
  indicator,
  onItemHighlighted,
  list,
  xstyle,
}: DemoProps) {
  const id = useId();
  const [localValue, setLocalValue] = useState<Option | Option[] | null>(
    defaultValue ?? (multiple ? [] : null),
  );
  const selected = value === undefined ? localValue : value;
  const selectedItems = Array.isArray(selected) ? selected : selected ? [selected] : [];
  return (
    <div
      {...stylex.props(
        styles.field,
        fullWidth && styles.wide,
        custom && styles.customField,
        xstyle,
      )}
    >
      <ComboBox<Option, boolean>
        multiple={multiple}
        value={selected}
        onValueChange={(next) => {
          setLocalValue(next);
          onValueChange?.(next);
        }}
        itemToLabel={(item) => item.name}
        itemToValue={(item) => item.id}
        isItemEqualToValue={(a, b) => a.id === b.id}
        query={query}
        onQueryChange={onQueryChange}
        filter={filteredItems ? false : undefined}
        open={open}
        onOpenChange={onOpenChange}
        onHighlight={(item) => onItemHighlighted?.(item ?? undefined)}
        disabled={disabled}
        required={required}
        name={name}
        variant={variant}
        fullWidth={fullWidth}
      >
        <ComboBox.Label htmlFor={id}>{label}</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input id={id} placeholder={placeholder} aria-invalid={invalid || undefined} />
          {!hideClear && <ComboBox.Clear aria-label={`Clear ${label}`} />}
          <ComboBox.Trigger aria-label={`Show ${label} options`}>
            <ComboBox.Indicator>{indicator}</ComboBox.Indicator>
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        {multiple && (
          <ComboBox.Chips>
            {selectedItems.map((item) => (
              <ComboBox.Chip key={item.id} value={item}>
                {chipText(item)}
                <ComboBox.ChipRemove aria-label={`Remove ${item.name}`} />
              </ComboBox.Chip>
            ))}
          </ComboBox.Chips>
        )}
        <ComboBox.Content>
          <ComboBox.Empty>{loading ? "Searching..." : emptyText}</ComboBox.Empty>
          {list ?? (
            <ComboBox.List>
              {(filteredItems ?? items).map((item) => (
                <ComboBox.Item
                  key={item.id}
                  value={item}
                  label={item.name}
                  disabled={item.disabled}
                >
                  {renderItem(item)}
                  <ComboBox.ItemIndicator />
                </ComboBox.Item>
              ))}
            </ComboBox.List>
          )}
        </ComboBox.Content>
      </ComboBox>
      {renderValue && selectedItems[0] && <output>{renderValue(selectedItems[0])}</output>}
      {(description || error) && <p {...stylex.props(styles.muted)}>{error ?? description}</p>}
    </div>
  );
}
