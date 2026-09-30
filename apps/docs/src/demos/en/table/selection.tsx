"use client";
// HeroUI v3.2.6 selection adaptation (Apache-2.0).
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Table } from "@lenso/ui";
import { Headers, Rows, styles, users } from "./data";
export function SelectionDemo() {
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  return (
    <div {...stylex.props(styles.stack)}>
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Table with selection"
            xstyle={styles.content}
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
          >
            <Headers selection />
            <Table.Body>
              <Rows items={users.slice(0, 4)} selection />
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <p {...stylex.props(styles.muted)}>
        Selected: {selected.size ? [...selected].join(", ") : "None"}
      </p>
    </div>
  );
}
