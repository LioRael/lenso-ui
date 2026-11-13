"use client";

import * as stylex from "@stylexjs/stylex";
import { OptionPicker, styles } from "../../en/autocomplete/_native";
const currencies = [
  {
    code: "USD",
    id: "usd",
    name: "US Dollar",
    symbol: "$",
  },
  {
    code: "EUR",
    id: "eur",
    name: "Euro",
    symbol: "€",
  },
  {
    code: "GBP",
    id: "gbp",
    name: "British Pound",
    symbol: "£",
  },
  {
    code: "JPY",
    id: "jpy",
    name: "Japanese Yen",
    symbol: "¥",
  },
  {
    code: "CHF",
    id: "chf",
    name: "Swiss Franc",
    symbol: "₣",
  },
].map((currency) => ({
  ...currency,
  searchText: `${currency.code} ${currency.name}`,
}));
export function CustomValue() {
  return (
    <OptionPicker
      items={currencies}
      label="货币"
      placeholder="选择货币"
      hideClear
      defaultValue={currencies[0]}
      searchLabel="Search currencies"
      searchPlaceholder="Search currencies..."
      renderItem={(item) => {
        const currency = currencies.find((entry) => entry.id === item.id);
        return (
          <span {...stylex.props(styles.details)}>
            <span>{currency?.code}</span>
            <span {...stylex.props(styles.muted)}>{item.name}</span>
          </span>
        );
      }}
      renderValue={(item) => {
        const currency = currencies.find((entry) => entry.id === item.id);
        return currency ? (
          <span {...stylex.props(styles.row)}>
            <strong>{currency.symbol}</strong>
            <span>{currency.code}</span>
            <span {...stylex.props(styles.muted)}>{currency.name}</span>
          </span>
        ) : (
          item.name
        );
      }}
    />
  );
}
