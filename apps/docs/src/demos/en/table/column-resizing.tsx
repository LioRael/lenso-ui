"use client";
// HeroUI v3.2.6 column-resizing adaptation (Apache-2.0).
import { Table } from "@lenso/ui";
import { Headers, Rows, styles, users } from "./data";
export function ColumnResizing() {
  return (
    <Table>
      <Table.ResizableContainer>
        <Table.Content aria-label="Table with resizable columns" xstyle={styles.resizing}>
          <Headers resizing />
          <Table.Body>
            <Rows items={users.slice(0, 5)} chips />
          </Table.Body>
        </Table.Content>
      </Table.ResizableContainer>
    </Table>
  );
}
