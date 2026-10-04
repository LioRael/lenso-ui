// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 column-resizing adaptation (Apache-2.0).
import { Table } from "@lenso/ui";
import { Headers, Rows, styles, users } from "../../en/table/data";
export function ColumnResizing() {
  return (
    <Table>
      <Table.ResizableContainer>
        <Table.Content aria-label="可调整列宽的表格" xstyle={styles.resizing}>
          <Headers resizing />
          <Table.Body>
            <Rows items={users.slice(0, 5)} chips />
          </Table.Body>
        </Table.Content>
      </Table.ResizableContainer>
    </Table>
  );
}
