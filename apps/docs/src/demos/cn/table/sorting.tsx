// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 sorting adaptation (Apache-2.0).
import { useState } from "react";
import { Table, type SortDescriptor } from "@lenso/ui";
import { Headers, Rows, styles, users, type User } from "../../en/table/data";
export function Sorting() {
  const [sort, setSort] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const sorted = users
    .slice(0, 5)
    .sort(
      (a, b) =>
        String(a[sort.column as keyof User]).localeCompare(String(b[sort.column as keyof User])) *
        (sort.direction === "ascending" ? 1 : -1),
    );
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="可排序表格"
          xstyle={styles.content}
          sortDescriptor={sort}
          onSortChange={setSort}
        >
          <Headers sorting />
          <Table.Body>
            <Rows items={sorted} />
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
