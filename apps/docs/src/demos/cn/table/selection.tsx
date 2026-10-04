// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 selection adaptation (Apache-2.0).
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Table } from "@lenso/ui";
import { Headers, Rows, styles, users } from "./selection--data";
export function SelectionDemo() {
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  return (
    <div {...stylex.props(styles.stack)}>
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="带选择的表格"
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
      <p {...stylex.props(styles.muted)}>已选：{selected.size ? [...selected].join(", ") : "无"}</p>
    </div>
  );
}
