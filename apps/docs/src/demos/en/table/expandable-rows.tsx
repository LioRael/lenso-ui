"use client";
// HeroUI v3.2.6 expandable-rows adaptation (Apache-2.0).
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Icon } from "@iconify/react";
import { Table } from "@lenso/ui";
type Row = { key: string; title: string; type: string; date: string; children: Row[] };
const file = (key: string, title: string, date: string, children: Row[] = []): Row => ({
  key,
  title,
  date,
  children,
  type: children.length ? "Directory" : "File",
});
const rows = [
  file("1", "Documents", "10/20/2025", [
    file("2", "Project", "8/2/2025", [
      file("3", "Weekly Report", "7/10/2025"),
      file("4", "Budget", "8/20/2025"),
    ]),
  ]),
  file("5", "Photos", "2/3/2026", [
    file("6", "Image 1", "1/23/2026"),
    file("7", "Image 2", "2/3/2026"),
  ]),
];
const styles = stylex.create({
  content: { minWidth: 520 },
  title: { display: "flex", alignItems: "center", gap: 4 },
  chevron: { transform: "rotate(90deg)" },
  collapsed: { transform: { default: "none", ":dir(rtl)": "rotate(180deg)" } },
});
export function ExpandableRows() {
  const [expanded, setExpanded] = useState<Set<Key>>(new Set(["1"]));
  const renderRow = (item: Row): React.ReactNode => (
    <Table.Row itemKey={item.key} textValue={item.title}>
      <Table.Cell columnKey="name">
        {({ hasChildItems, isExpanded, isTreeColumn }) => (
          <span {...stylex.props(styles.title)}>
            {hasChildItems && isTreeColumn && (
              <Table.ExpandButton aria-label={`Toggle ${item.title}`}>
                <Icon
                  icon="gravity-ui:chevron-right"
                  width={16}
                  aria-hidden="true"
                  {...stylex.props(isExpanded ? styles.chevron : styles.collapsed)}
                />
              </Table.ExpandButton>
            )}
            <span>{item.title}</span>
          </span>
        )}
      </Table.Cell>
      <Table.Cell>{item.type}</Table.Cell>
      <Table.Cell>{item.date}</Table.Cell>
      <Table.Collection items={item.children}>{renderRow}</Table.Collection>
    </Table.Row>
  );
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Files"
          xstyle={styles.content}
          treeColumn="name"
          expandedKeys={expanded}
          onExpandedChange={setExpanded}
        >
          <Table.Header>
            <Table.Column columnKey="name">Name</Table.Column>
            <Table.Column columnKey="type">Type</Table.Column>
            <Table.Column columnKey="date">Date Modified</Table.Column>
          </Table.Header>
          <Table.Body items={rows}>{renderRow}</Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
