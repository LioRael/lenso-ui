"use client";
// HeroUI v3.2.6 pagination adaptation (Apache-2.0).
import { useState } from "react";
import { Table } from "@lenso/ui";
import { Headers, Pages, Rows, styles, users } from "./data";
export function PaginationDemo() {
  const [page, setPage] = useState(1);
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Table with pagination" xstyle={styles.content}>
          <Headers />
          <Table.Body>
            <Rows items={users.slice((page - 1) * 4, page * 4)} />
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <Table.Footer>
        <Pages page={page} count={2} total={8} setPage={setPage} />
      </Table.Footer>
    </Table>
  );
}
