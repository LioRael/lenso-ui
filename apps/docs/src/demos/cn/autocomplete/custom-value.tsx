// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles } from "../../en/autocomplete/_native";
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
    <NativeAutocomplete
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
