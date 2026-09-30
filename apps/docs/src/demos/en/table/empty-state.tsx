"use client";
// HeroUI v3.2.6 empty-state adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Icon } from "@iconify/react";
import { EmptyState, Table } from "@lenso/ui";
import { Headers, styles } from "./data";
const empty = stylex.create({
  root: { minHeight: 200 },
  content: {
    minHeight: 140,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    textAlign: "center",
    color: "var(--muted)",
  },
});
export function EmptyStateDemo() {
  return (
    <Table xstyle={empty.root}>
      <Table.ScrollContainer>
        <Table.Content aria-label="Empty table" xstyle={styles.content}>
          <Headers />
          <Table.Body>
            <tr>
              <td colSpan={4}>
                <EmptyState xstyle={empty.content}>
                  <Icon icon="gravity-ui:tray" width={24} aria-hidden="true" />
                  <span>No results found</span>
                </EmptyState>
              </td>
            </tr>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
