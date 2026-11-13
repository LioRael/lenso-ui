"use client";

import { OptionPicker } from "../../en/autocomplete/_native";
const emails = [
  {
    email: "alice@example.com",
    id: "alice@example.com",
    name: "Alice Johnson",
  },
  {
    email: "bob@example.com",
    id: "bob@example.com",
    name: "Bob Smith",
  },
  {
    email: "charlie@example.com",
    id: "charlie@example.com",
    name: "Charlie Brown",
  },
  {
    email: "diana@example.com",
    id: "diana@example.com",
    name: "Diana Prince",
  },
  {
    email: "eve@example.com",
    id: "eve@example.com",
    name: "Eve Wilson",
  },
];
export function EmailRecipients() {
  return (
    <OptionPicker
      items={emails}
      label="收件人"
      placeholder="添加收件人"
      multiple
      chips
      chipText={(item) => item.email}
      searchLabel="Search emails"
      searchPlaceholder="Search emails..."
      emptyText="No recipients found"
    />
  );
}
