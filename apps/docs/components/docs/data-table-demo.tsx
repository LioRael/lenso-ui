"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar } from "@lenso/ui/avatar";
import { Button } from "@lenso/ui/button";
import { Checkbox } from "@lenso/ui/checkbox";
import { DataTable, type DataTableColumn } from "@lenso/ui/data-table";
import { Menu } from "@lenso/ui/menu";
import { MoreHorizontal } from "lucide-react";
import { DataPlayground } from "./data-playground";
import { PlaygroundControls, PlaygroundSwitchControl } from "./playground-controls";
import { styles } from "./data-table-demo.stylex";

const columns: readonly DataTableColumn[] = [
  { id: "select", width: 36, pinned: true },
  { id: "name", width: 240, minWidth: 180, pinned: true },
  { id: "email", width: 210 },
  { id: "role", width: 135 },
  { id: "actions", width: 59 },
];

const members = [
  {
    id: "ada",
    name: "Ada Lovelace",
    handle: "ada",
    email: "ada@lenso.dev",
    role: "Workspace admin",
    team: "Platform",
  },
  {
    id: "grace",
    name: "Grace Hopper",
    handle: "grace",
    email: "grace@lenso.dev",
    role: "Member",
    team: "Platform",
  },
  {
    id: "alan",
    name: "Alan Turing",
    handle: "alan",
    email: "alan@lenso.dev",
    role: "Member",
    team: "Platform",
  },
  {
    id: "katherine",
    name: "Katherine Johnson",
    handle: "katherine",
    email: "katherine@lenso.dev",
    role: "Member",
    team: "Research",
  },
  {
    id: "donald",
    name: "Donald Knuth",
    handle: "donald",
    email: "donald@lenso.dev",
    role: "Guest",
    team: "Research",
  },
  {
    id: "margaret",
    name: "Margaret Hamilton",
    handle: "margaret",
    email: "margaret@lenso.dev",
    role: "Member",
    team: "Research",
  },
] as const;
const teams = ["Platform", "Research"] as const;
type SortKey = "name" | "email" | "role";

export function DataTableDemo() {
  const [grouped, setGrouped] = React.useState(true);
  const [showRowSelection, setShowRowSelection] = React.useState(true);
  const [showActionsHeader, setShowActionsHeader] = React.useState(false);
  const [sortable, setSortable] = React.useState(true);
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set());
  const [copyStatus, setCopyStatus] = React.useState("");
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [headerHovered, setHeaderHovered] = React.useState(false);
  const [sort, setSort] = React.useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });
  const allSelected = selected.size === members.length;
  const sortBy = (key: SortKey) =>
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
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
  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyStatus("Email copied");
    } catch {
      setCopyStatus("Could not copy email");
    }
  };
  const visibleColumns = showRowSelection
    ? columns
    : columns.filter((column) => column.id !== "select");
  const sections = grouped
    ? teams.map((team) => ({
        key: team,
        label: team,
        rows: members.filter((member) => member.team === team),
      }))
    : [{ key: "all", label: null, rows: [...members] }];

  return (
    <DataPlayground
      controls={
        <PlaygroundControls name="Data Table">
          <PlaygroundSwitchControl
            checked={grouped}
            label="Group rows"
            onCheckedChange={setGrouped}
          />
          <PlaygroundSwitchControl
            checked={showRowSelection}
            label="Row selection"
            onCheckedChange={(checked) => {
              setShowRowSelection(checked);
              if (!checked) setSelected(new Set());
            }}
          />
          <PlaygroundSwitchControl
            checked={sortable}
            label="Sorting"
            onCheckedChange={setSortable}
          />
          <PlaygroundSwitchControl
            checked={showActionsHeader}
            label="Actions header"
            onCheckedChange={setShowActionsHeader}
          />
        </PlaygroundControls>
      }
    >
      <div {...stylex.props(styles.demo)}>
        <DataTable.Root columns={visibleColumns} label="Workspace members" maxHeight={520}>
          <DataTable.Header>
            <DataTable.Row
              onPointerEnter={() => setHeaderHovered(true)}
              onPointerLeave={() => setHeaderHovered(false)}
              onFocusCapture={() => setHeaderHovered(true)}
              onBlurCapture={() => setHeaderHovered(false)}
            >
              {showRowSelection && (
                <DataTable.Head columnId="select" xstyle={styles.selectCell}>
                  <Checkbox.Root
                    aria-label="Select all members"
                    checked={allSelected}
                    indeterminate={selected.size > 0 && !allSelected}
                    xstyle={
                      headerHovered || selected.size > 0
                        ? styles.revealVisible
                        : styles.revealControl
                    }
                    onCheckedChange={(checked) =>
                      setSelected(checked ? new Set(members.map((member) => member.id)) : new Set())
                    }
                  >
                    <Checkbox.Indicator />
                  </Checkbox.Root>
                </DataTable.Head>
              )}
              <DataTable.Head
                columnId="name"
                resizable
                resizeLabel="Resize Name column"
                {...(sortable ? { onSort: () => sortBy("name") } : {})}
                sortDirection={sortable && sort.key === "name" ? sort.direction : null}
                sortLabel="Order by name"
              >
                Name
              </DataTable.Head>
              <DataTable.Head
                columnId="email"
                {...(sortable ? { onSort: () => sortBy("email") } : {})}
                sortDirection={sortable && sort.key === "email" ? sort.direction : null}
                sortLabel="Order by email"
              >
                Email
              </DataTable.Head>
              <DataTable.Head
                columnId="role"
                {...(sortable ? { onSort: () => sortBy("role") } : {})}
                sortDirection={sortable && sort.key === "role" ? sort.direction : null}
                sortLabel="Order by role"
              >
                Role
              </DataTable.Head>
              <DataTable.Head aria-label="Actions" columnId="actions" xstyle={styles.actionCell}>
                {showActionsHeader ? "Actions" : null}
              </DataTable.Head>
            </DataTable.Row>
          </DataTable.Header>
          {sections.map((section) => {
            const group = sortable
              ? [...section.rows].sort(
                  (a, b) =>
                    a[sort.key].localeCompare(b[sort.key]) * (sort.direction === "asc" ? 1 : -1),
                )
              : section.rows;
            return (
              <DataTable.Body key={section.key}>
                {section.label && <DataTable.GroupRow label={section.label} count={group.length} />}
                {group.map((member) => {
                  const revealed = hoveredId === member.id || selected.has(member.id);
                  return (
                    <DataTable.Row
                      key={member.id}
                      selected={selected.has(member.id)}
                      onPointerEnter={() => setHoveredId(member.id)}
                      onPointerLeave={() => setHoveredId(null)}
                      onFocusCapture={() => setHoveredId(member.id)}
                      onBlurCapture={() => setHoveredId(null)}
                    >
                      {showRowSelection && (
                        <DataTable.Cell columnId="select" xstyle={styles.selectCell}>
                          <Checkbox.Root
                            aria-label={`Select ${member.name}`}
                            checked={selected.has(member.id)}
                            xstyle={revealed ? styles.revealVisible : styles.revealControl}
                            onCheckedChange={(checked) => toggle(member.id, checked)}
                          >
                            <Checkbox.Indicator />
                          </Checkbox.Root>
                        </DataTable.Cell>
                      )}
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
                      <DataTable.Cell columnId="actions" xstyle={styles.actionCell}>
                        <Menu.Root>
                          <Menu.Trigger
                            aria-label={`Actions for ${member.name}`}
                            xstyle={revealed ? styles.actionVisible : styles.actionConcealed}
                          >
                            <MoreHorizontal aria-hidden="true" size={16} />
                          </Menu.Trigger>
                          <Menu.Portal>
                            <Menu.Positioner align="end">
                              <Menu.Popup aria-label={`${member.name} actions`}>
                                {showRowSelection && (
                                  <Menu.Item
                                    onClick={() => toggle(member.id, !selected.has(member.id))}
                                  >
                                    {selected.has(member.id) ? "Deselect" : "Select"}
                                  </Menu.Item>
                                )}
                                <Menu.Item onClick={() => copyEmail(member.email)}>
                                  Copy email
                                </Menu.Item>
                              </Menu.Popup>
                            </Menu.Positioner>
                          </Menu.Portal>
                        </Menu.Root>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })}
              </DataTable.Body>
            );
          })}
        </DataTable.Root>
        {showRowSelection && selected.size > 0 && (
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
    </DataPlayground>
  );
}
