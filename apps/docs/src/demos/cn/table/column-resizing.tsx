"use client";

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
