"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar } from "@lenso/ui/avatar";
import { Button } from "@lenso/ui/button";
import { Checkbox } from "@lenso/ui/checkbox";
import { DataTable, type DataTableColumn } from "@lenso/ui/data-table";
import { styles } from "./data-table-demo.stylex";

const columns: readonly DataTableColumn[] = [
  { id: "select", width: 42, pinned: true },
  { id: "name", width: 292, minWidth: 220, pinned: true },
  { id: "email", width: 230 },
  { id: "role", width: 160 },
];

const members = [
  {
    id: "ada",
    name: "Ada Lovelace",
    handle: "ada",
    email: "ada@lenso.dev",
    role: "Workspace admin",
  },
  { id: "grace", name: "Grace Hopper", handle: "grace", email: "grace@lenso.dev", role: "Member" },
  { id: "alan", name: "Alan Turing", handle: "alan", email: "alan@lenso.dev", role: "Member" },
  {
    id: "katherine",
    name: "Katherine Johnson",
    handle: "katherine",
    email: "katherine@lenso.dev",
    role: "Member",
  },
  {
    id: "donald",
    name: "Donald Knuth",
    handle: "donald",
    email: "donald@lenso.dev",
    role: "Guest",
  },
  {
    id: "margaret",
    name: "Margaret Hamilton",
    handle: "margaret",
    email: "margaret@lenso.dev",
    role: "Member",
  },
] as const;

export function DataTableDemo() {
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set());
  const [copyStatus, setCopyStatus] = React.useState("");
  const allSelected = selected.size === members.length;
  const toggle = (id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    setCopyStatus("");
  };
  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(
        members
          .filter((member) => selected.has(member.id))
          .map((member) => member.email)
          .join(", "),
      );
      setCopyStatus("Emails copied");
    } catch {
      setCopyStatus("Could not copy emails");
    }
  };

  return (
    <div {...stylex.props(styles.demo)}>
      <DataTable.Root columns={columns} label="Workspace members" maxHeight={420}>
        <DataTable.Header>
          <DataTable.Row>
            <DataTable.Head columnId="select" xstyle={styles.selectCell}>
              <Checkbox.Root
                aria-label="Select all members"
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onCheckedChange={(checked) =>
                  setSelected(checked ? new Set(members.map((member) => member.id)) : new Set())
                }
              >
                <Checkbox.Indicator />
              </Checkbox.Root>
            </DataTable.Head>
            <DataTable.Head columnId="name" resizable resizeLabel="Resize Name column">
              Name
            </DataTable.Head>
            <DataTable.Head columnId="email">Email</DataTable.Head>
            <DataTable.Head columnId="role">Role</DataTable.Head>
          </DataTable.Row>
        </DataTable.Header>
        <DataTable.Body>
          {members.map((member) => (
            <DataTable.Row key={member.id} selected={selected.has(member.id)}>
              <DataTable.Cell columnId="select" xstyle={styles.selectCell}>
                <Checkbox.Root
                  aria-label={`Select ${member.name}`}
                  checked={selected.has(member.id)}
                  onCheckedChange={(checked) => toggle(member.id, checked)}
                >
                  <Checkbox.Indicator />
                </Checkbox.Root>
              </DataTable.Cell>
              <DataTable.Cell columnId="name">
                <span {...stylex.props(styles.identity)}>
                  <Avatar.Root size="default">
                    <Avatar.Fallback>{member.name[0]}</Avatar.Fallback>
                  </Avatar.Root>
                  <span {...stylex.props(styles.identityCopy)}>
                    <span {...stylex.props(styles.name)}>{member.name}</span>
                    <span {...stylex.props(styles.handle)}>{member.handle}</span>
                  </span>
                </span>
              </DataTable.Cell>
              <DataTable.Cell columnId="email">{member.email}</DataTable.Cell>
              <DataTable.Cell columnId="role">{member.role}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable.Body>
      </DataTable.Root>
      {selected.size > 0 && (
        <div {...stylex.props(styles.selectionBar)} role="toolbar" aria-label="Selected members">
          <span>{selected.size} selected</span>
          <span {...stylex.props(styles.toolbarRule)} />
          <Button size="compact" variant="ghost" onClick={copyEmails}>
            Copy emails
          </Button>
          <Button size="compact" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}
      <output {...stylex.props(styles.status)}>{copyStatus}</output>
    </div>
  );
}
