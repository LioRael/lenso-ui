// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 async-loading adaptation (Apache-2.0).
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner, Table } from "@lenso/ui";
import { Rows, styles, users } from "../../en/table/data";
export function AsyncLoading() {
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const request = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (request.current) clearTimeout(request.current);
    },
    [],
  );
  const loadMore = useCallback(() => {
    if (request.current || count >= users.length) return;
    setLoading(true);
    request.current = setTimeout(() => {
      request.current = null;
      setCount((previous) => previous + 6);
      setLoading(false);
    }, 1500);
  }, [count]);
  return (
    <Table>
      <Table.ScrollContainer xstyle={styles.viewport}>
        <Table.Content aria-label="异步加载表格" xstyle={styles.content}>
          <Table.Header xstyle={styles.sticky}>
            {["name", "role", "status", "email"].map((column) => (
              <Table.Column key={column} columnKey={column}>
                {column[0]!.toUpperCase() + column.slice(1)}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            <Rows items={users.slice(0, count)} chips />
            {count < users.length && (
              <Table.LoadMore colSpan={4} loading={loading} hasMore onLoadMore={loadMore}>
                <Table.LoadMoreContent>
                  <Spinner size="md" />
                </Table.LoadMoreContent>
              </Table.LoadMore>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
