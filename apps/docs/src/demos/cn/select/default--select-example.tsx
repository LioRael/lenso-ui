// Generated source-backed helper adaptation from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/**
 * Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
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
    backgroundColor: "var(--surface)",
    color: "var(--surface-foreground)",
  },
  note: {
    margin: 0,
    fontSize: 14,
    color: "var(--muted)",
  },
  error: {
    fontSize: 14,
    color: "var(--danger)",
  },
  action: {
    border: 0,
    borderRadius: 12,
    paddingBlock: 8,
    paddingInline: 16,
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": "2px solid var(--focus)",
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
    color: "var(--muted)",
    width: 24,
    height: 24,
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": "2px solid var(--focus)",
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
    backgroundColor: "var(--default)",
  },
  customPopover: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
    backgroundColor: "var(--surface)",
    padding: 4,
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  customItem: {
    borderRadius: 8,
    backgroundColor: {
      default: "transparent",
      ":is([data-highlighted])": "color-mix(in oklab, var(--accent) 10%, transparent)",
    },
    color: {
      default: "inherit",
      ":is([data-selected])": "var(--foreground)",
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
    label: "佛罗里达",
  },
  {
    value: "delaware",
    label: "特拉华",
  },
  {
    value: "california",
    label: "加利福尼亚",
  },
  {
    value: "texas",
    label: "德克萨斯",
  },
  {
    value: "new-york",
    label: "纽约",
  },
  {
    value: "washington",
    label: "华盛顿",
  },
];
export const controlledStates: Choice[] = [
  {
    value: "california",
    label: "加利福尼亚",
  },
  {
    value: "texas",
    label: "德克萨斯",
  },
  {
    value: "florida",
    label: "佛罗里达",
  },
  {
    value: "new-york",
    label: "纽约",
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
    label: "Argentina",
  },
  {
    value: "venezuela",
    label: "Venezuela",
  },
  {
    value: "japan",
    label: "Japan",
  },
  {
    value: "france",
    label: "France",
  },
  {
    value: "italy",
    label: "Italy",
  },
  {
    value: "spain",
    label: "Spain",
  },
  {
    value: "thailand",
    label: "Thailand",
  },
  {
    value: "new-zealand",
    label: "New Zealand",
  },
  {
    value: "iceland",
    label: "Iceland",
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
        label: "France",
      },
      {
        value: "germany",
        label: "Germany",
      },
      {
        value: "spain",
        label: "Spain",
      },
      {
        value: "italy",
        label: "Italy",
      },
    ],
  },
  {
    label: "Asia",
    items: [
      {
        value: "japan",
        label: "Japan",
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
  onPopoverScroll?: ComponentProps<typeof Select.Popover>["onScroll"];
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
  onPopoverScroll,
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
            <Select.Popover
              xstyle={custom && exampleStyles.customPopover}
              onScroll={onPopoverScroll}
            >
              <Select.List ref={listRef}>
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
