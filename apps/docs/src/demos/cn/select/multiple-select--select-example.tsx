"use client";

/**
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI value, collection, portal and validation contracts.
 */
import { Field } from "@base-ui/react/field";
import { Xmark } from "@gravity-ui/icons";
import { Select } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
export const exampleStyles = stylex.create({
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    width: 256,
    maxWidth: "100%",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  compactStack: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  wide: {
    width: 400,
    maxWidth: "100%",
  },
  full: {
    width: "100%",
  },
  surface: {
    width: 320,
    maxWidth: "100%",
    borderRadius: 24,
    padding: 24,
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    color: "var(--lenso-label-primary)",
  },
  note: {
    margin: 0,
    fontSize: 14,
    color: "var(--lenso-label-secondary)",
  },
  error: {
    fontSize: 14,
    color: "var(--lenso-status-error-indicator)",
  },
  action: {
    border: 0,
    borderRadius: 12,
    paddingBlock: 8,
    paddingInline: 16,
    backgroundColor: "var(--lenso-tint)",
    color: "var(--lenso-label-on-tint)",
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": "2px solid var(--lenso-focus-ring)",
    },
    outlineOffset: 2,
  },
  triggerGroup: {
    position: "relative",
    display: "flex",
  },
  clear: {
    position: "absolute",
    insetInlineEnd: 28,
    top: "50%",
    transform: "translateY(-50%)",
    border: 0,
    backgroundColor: "transparent",
    color: "var(--lenso-label-secondary)",
    width: 24,
    height: 24,
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": "2px solid var(--lenso-focus-ring)",
    },
    borderRadius: 6,
  },
  clearTrigger: {
    paddingInlineEnd: 56,
  },
  smallIndicator: {
    width: 12,
    height: 12,
  },
  customField: {
    width: 224,
  },
  customTrigger: {
    borderRadius: 12,
    backgroundColor: "var(--lenso-control-fill)",
  },
  customPopover: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--lenso-control-border)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 4,
    boxShadow: "var(--lenso-overlay-shadow)",
  },
  customItem: {
    borderRadius: 8,
    backgroundColor: {
      default: "transparent",
      ":is([data-highlighted])": "color-mix(in oklab, var(--lenso-tint) 10%, transparent)",
    },
    color: {
      default: "inherit",
      ":is([data-selected])": "var(--lenso-label-primary)",
    },
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    objectFit: "cover",
  },
  smallAvatar: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    objectFit: "cover",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBlock: 8,
  },
});
export interface Choice {
  value: string;
  label: string;
  disabled?: boolean;
  content?: ReactNode;
}
export interface ChoiceSection {
  label: string;
  items: Choice[];
}
export const states: Choice[] = [
  {
    value: "florida",
    label: "Florida",
  },
  {
    value: "delaware",
    label: "Delaware",
  },
  {
    value: "california",
    label: "California",
  },
  {
    value: "texas",
    label: "Texas",
  },
  {
    value: "new-york",
    label: "New York",
  },
  {
    value: "washington",
    label: "Washington",
  },
];
export const controlledStates: Choice[] = [
  {
    value: "california",
    label: "California",
  },
  {
    value: "texas",
    label: "Texas",
  },
  {
    value: "florida",
    label: "Florida",
  },
  {
    value: "new-york",
    label: "New York",
  },
  {
    value: "illinois",
    label: "Illinois",
  },
  {
    value: "pennsylvania",
    label: "Pennsylvania",
  },
];
export const countries: Choice[] = [
  {
    value: "argentina",
    label: "阿根廷",
  },
  {
    value: "venezuela",
    label: "委内瑞拉",
  },
  {
    value: "japan",
    label: "日本",
  },
  {
    value: "france",
    label: "法国",
  },
  {
    value: "italy",
    label: "意大利",
  },
  {
    value: "spain",
    label: "西班牙",
  },
  {
    value: "thailand",
    label: "泰国",
  },
  {
    value: "new-zealand",
    label: "新西兰",
  },
  {
    value: "iceland",
    label: "冰岛",
  },
];
export const countrySections: ChoiceSection[] = [
  {
    label: "North America",
    items: [
      {
        value: "usa",
        label: "United States",
      },
      {
        value: "canada",
        label: "Canada",
      },
      {
        value: "mexico",
        label: "Mexico",
      },
    ],
  },
  {
    label: "Europe",
    items: [
      {
        value: "uk",
        label: "United Kingdom",
      },
      {
        value: "france",
        label: "法国",
      },
      {
        value: "germany",
        label: "Germany",
      },
      {
        value: "spain",
        label: "西班牙",
      },
      {
        value: "italy",
        label: "意大利",
      },
    ],
  },
  {
    label: "Asia",
    items: [
      {
        value: "japan",
        label: "日本",
      },
      {
        value: "china",
        label: "China",
      },
      {
        value: "india",
        label: "India",
      },
      {
        value: "south-korea",
        label: "South Korea",
      },
    ],
  },
];
type FieldProps<Multiple extends boolean | undefined> = Omit<
  ComponentProps<typeof Select.Root<string, Multiple>>,
  "items" | "children"
> & {
  label: string;
  choices: Choice[];
  sections?: ChoiceSection[];
  placeholder?: string;
  description?: string;
  indicator?: ReactNode;
  valueContent?: ComponentProps<typeof Select.Value>["children"];
  clear?: () => void;
  custom?: boolean;
  fluid?: boolean;
  footer?: ReactNode;
  listRef?: ComponentProps<typeof Select.List>["ref"];
  onListScroll?: ComponentProps<typeof Select.List>["onScroll"];
  customRender?: boolean;
};
export function SelectExample<Multiple extends boolean | undefined = false>({
  label,
  choices,
  sections,
  placeholder = "Select one",
  description,
  indicator,
  valueContent,
  clear,
  custom = false,
  fluid = false,
  footer,
  listRef,
  onListScroll,
  customRender = false,
  ...props
}: FieldProps<Multiple>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const renderItem = (choice: Choice) => (
    <Select.Item
      key={choice.value}
      value={choice.value}
      disabled={choice.disabled}
      xstyle={custom && exampleStyles.customItem}
    >
      <Select.ItemText>{choice.content ?? choice.label}</Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
  return (
    <Field.Root
      name={props.name}
      {...stylex.props(
        exampleStyles.field,
        custom && exampleStyles.customField,
        fluid && exampleStyles.full,
      )}
      render={customRender ? <div data-custom="foo" /> : undefined}
    >
      <Select.Root
        {...props}
        items={choices.map(({ value, label: text }) => ({
          value,
          label: text,
        }))}
        fullWidth
      >
        <Select.Label>{label}</Select.Label>
        <div {...stylex.props(exampleStyles.triggerGroup)}>
          <Select.Trigger
            ref={triggerRef}
            xstyle={[custom && exampleStyles.customTrigger, !!clear && exampleStyles.clearTrigger]}
          >
            <Select.Value placeholder={placeholder}>{valueContent}</Select.Value>
            <Select.Indicator xstyle={!!indicator && exampleStyles.smallIndicator}>
              {indicator}
            </Select.Indicator>
          </Select.Trigger>
          {clear && (
            <button
              type="button"
              aria-label="Clear selection"
              {...stylex.props(exampleStyles.clear)}
              onClick={() => {
                clear();
                triggerRef.current?.focus();
              }}
            >
              <Xmark width={12} height={12} aria-hidden="true" />
            </button>
          )}
        </div>
        <Select.Portal>
          <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
            <Select.Popover xstyle={custom && exampleStyles.customPopover}>
              <Select.List ref={listRef} onScroll={onListScroll}>
                {sections
                  ? sections.map((section, index) => (
                      <div key={section.label}>
                        {index > 0 && <Select.Separator />}
                        <Select.Group>
                          <Select.GroupLabel>{section.label}</Select.GroupLabel>
                          {section.items.map(renderItem)}
                        </Select.Group>
                      </div>
                    ))
                  : choices.map(renderItem)}
                {footer}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      {description && (
        <Field.Description {...stylex.props(exampleStyles.note)}>{description}</Field.Description>
      )}
      {props.required && <Field.Error {...stylex.props(exampleStyles.error)} />}
    </Field.Root>
  );
}
