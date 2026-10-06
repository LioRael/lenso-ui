"use client";

import * as stylex from "@stylexjs/stylex";
import { Avatar, Button, ProgressBar, Table } from "@lenso/ui";
import { finances as s } from "../styles/theme-builder-finances.stylex";
import { money, type Month } from "./theme-builder-finances-parts";

export function ExpenseCategories({
  items,
  selected,
  expense,
  month,
  onSelect,
  onClear,
}: {
  items: readonly { label: string; cents: number }[];
  selected: string | null;
  expense: number;
  month: Month;
  onSelect: (category: string | null) => void;
  onClear: () => void;
}) {
  return (
    <section aria-label="Expense categories" {...stylex.props(s.card, s.categories)}>
      <h3 {...stylex.props(s.sectionHeading)}>Expense categories</h3>
      <p {...stylex.props(s.note)}>
        {money(expense)} spent · {month.label}
      </p>
      <Table.Root variant="secondary" xstyle={s.categoryTableRoot}>
        <Table.Content aria-label="Expense categories" xstyle={s.categoryTable}>
          <Table.Header xstyle={s.categoryHeader}>
            <Table.Column columnKey="category" xstyle={s.categoryHeading}>
              Category
            </Table.Column>
            <Table.Column columnKey="amount" xstyle={[s.categoryHeading, s.amount]}>
              Amount
            </Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Collection items={items.map((item) => ({ ...item, key: item.label }))}>
              {(item) => (
                <Table.Row key={item.label} itemKey={item.label} xstyle={s.categoryRow}>
                  <Table.Cell xstyle={s.categoryCell}>
                    <Button
                      variant="ghost"
                      aria-label={`Filter ${item.label} transactions`}
                      aria-pressed={selected === item.label}
                      xstyle={[s.category, selected === item.label && s.selected]}
                      onClick={() => onSelect(selected === item.label ? null : item.label)}
                    >
                      <Avatar size="sm" aria-hidden="true">
                        <Avatar.Fallback>{item.label.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                      </Avatar>
                      <span {...stylex.props(s.categoryLabel)}>{item.label}</span>
                    </Button>
                  </Table.Cell>
                  <Table.Cell xstyle={s.categoryAmount}>
                    <bdi>{money(item.cents)}</bdi>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
          </Table.Body>
        </Table.Content>
      </Table.Root>
      <ProgressBar
        value={Math.min(expense, month.budget)}
        max={month.budget}
        size="sm"
        color={expense > month.budget ? "danger" : "accent"}
        aria-label="Monthly spending budget"
        aria-valuetext={`${money(expense)} spent of ${money(month.budget)} budget`}
      >
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <p {...stylex.props(s.note)}>Monthly budget {money(month.budget)}</p>
      <Button size="sm" variant="tertiary" onClick={onClear}>
        View all transactions
      </Button>
    </section>
  );
}
