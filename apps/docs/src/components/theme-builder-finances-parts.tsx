"use client";

import { useId, useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Input, Modal, Select } from "@lenso/ui";
import { finances as s } from "../styles/theme-builder-finances.stylex";

export type TransactionType = "income" | "expense";
export type Transaction = {
  id: string;
  month: string;
  day: number;
  description: string;
  cents: number;
  type: TransactionType;
  category: string;
};
export type Month = {
  value: string;
  label: string;
  short: string;
  days: number;
  opening: number;
  budget: number;
};
export const months: [Month, ...Month[]] = [
  { value: "2026-05", label: "May 2026", short: "May", days: 31, opening: 320000, budget: 220000 },
  {
    value: "2026-04",
    label: "April 2026",
    short: "Apr",
    days: 30,
    opening: 285000,
    budget: 210000,
  },
  {
    value: "2026-03",
    label: "March 2026",
    short: "Mar",
    days: 31,
    opening: 240000,
    budget: 200000,
  },
];
const typeChoices = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
] as const;
export const filterChoices = [{ value: "all", label: "All transactions" }, ...typeChoices] as const;
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const money = (cents: number) => currency.format(cents / 100);

export function sampleTransactions(): Transaction[] {
  return months.flatMap((month, index) => {
    const rows: [number, string, number, TransactionType, string][] = [
      [2, "Studio rent", 85000, "expense", "Rent"],
      [5, "Brand identity project", 240000 - index * 20000, "income", "Client work"],
      [10, "Design software", 4900, "expense", "Software"],
      [14, "Print samples", 16800 + index * 1400, "expense", "Printing"],
      [18, "Workshop materials", 9200, "expense", "Materials"],
      [23, "Editorial commission", 120000 - index * 15000, "income", "Client work"],
      [27, "Studio supplies", 7350, "expense", "Supplies"],
    ];
    return rows.map(([day, description, cents, type, category], row) => ({
      id: `${month.value}-${row}`,
      month: month.value,
      day,
      description,
      cents,
      type,
      category,
    }));
  });
}

export function totals(rows: Transaction[]) {
  return rows.reduce(
    (sum, row) => {
      sum[row.type] += row.cents;
      return sum;
    },
    { income: 0, expense: 0 },
  );
}

export function ChoiceSelect<Value extends string>({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: Value;
  items: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
}) {
  const id = useId();
  return (
    <div {...stylex.props(s.field)}>
      <span id={id} {...stylex.props(s.label)}>
        {label}
      </span>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <Select.Trigger aria-labelledby={id} xstyle={s.select}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popover>
              <Select.List>
                {items.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select>
    </div>
  );
}

export function parseAmount(value: string): number | null {
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents > 0 && cents <= 99999999 ? cents : null;
}

export function AddTransaction({
  month,
  onAdd,
}: {
  month: Month;
  onAdd: (transaction: Omit<Transaction, "id">) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cents = parseAmount(amount);
    if (!description.trim() || cents === null) {
      setError(
        "Enter a description and an amount from 0.01 to 999999.99, with up to two decimal places.",
      );
      return;
    }
    onAdd({
      month: month.value,
      day: month.days,
      description: description.trim(),
      cents,
      type,
      category: type === "expense" ? "Other" : "Client work",
    });
    setOpen(false);
  }
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDescription("");
          setAmount("");
          setType("expense");
          setError("");
        }
        setOpen(next);
      }}
    >
      <Modal.Trigger render={<Button size="sm" />}>Add transaction</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup size="sm">
            <Modal.Header>
              <Modal.Title>Add transaction</Modal.Title>
              <Modal.Description>
                Add a local sample entry dated {month.short} {month.days}, 2026. No transfer is
                made.
              </Modal.Description>
            </Modal.Header>
            <form onSubmit={submit}>
              <Modal.Body xstyle={s.form}>
                <div {...stylex.props(s.field)}>
                  <label htmlFor={`${id}-description`} {...stylex.props(s.label)}>
                    Description
                  </label>
                  <Input
                    id={`${id}-description`}
                    name="description"
                    required
                    maxLength={80}
                    fullWidth
                    value={description}
                    onValueChange={setDescription}
                  />
                </div>
                <div {...stylex.props(s.field)}>
                  <label htmlFor={`${id}-amount`} {...stylex.props(s.label)}>
                    Amount (USD)
                  </label>
                  <Input
                    id={`${id}-amount`}
                    name="amount"
                    required
                    inputMode="decimal"
                    fullWidth
                    value={amount}
                    onValueChange={setAmount}
                    aria-describedby={`${id}-amount-help`}
                    aria-invalid={error && parseAmount(amount) === null ? true : undefined}
                  />
                  <p id={`${id}-amount-help`} {...stylex.props(s.note)}>
                    0.01–999999.99 · Use a decimal point, no currency symbol.
                  </p>
                </div>
                <ChoiceSelect
                  label="Transaction type"
                  value={type}
                  items={typeChoices}
                  onChange={setType}
                />
                {error && (
                  <p role="alert" {...stylex.props(s.error)}>
                    {error}
                  </p>
                )}
              </Modal.Body>
              <Modal.Footer xstyle={s.actions}>
                <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
                <Button type="submit">Save transaction</Button>
              </Modal.Footer>
            </form>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
