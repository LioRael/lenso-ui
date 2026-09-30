"use client";
// HeroUI v3.2.6 async-loading adaptation (Apache-2.0).
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner, Table } from "@lenso/ui";
import { Rows, styles, users } from "./data";
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
        <Table.Content aria-label="Async loading table" xstyle={styles.content}>
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
