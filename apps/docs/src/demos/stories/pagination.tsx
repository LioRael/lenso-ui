"use client";
import type { ComponentProps } from "react";
import { Pagination } from "@lenso/ui";
import { useState } from "react";
export interface PaginationStoryProps extends Pick<ComponentProps<typeof Pagination>, "size"> {
  total: number;
}
export const initialArgs: PaginationStoryProps = /* story-args:start */ {
  size: "md",
  total: 5,
}; /* story-args:end */

export function Preview(overrides: PaginationStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const [page, setPage] = useState(1);
  const total = Math.max(1, Math.min(20, Math.round(args.total)));
  return (
    <Pagination size={args.size} aria-label="Results pages">
      <Pagination.Content>
        {Array.from({ length: total }, (_, i) => (
          <Pagination.Item key={i}>
            <Pagination.Link
              render={<button type="button" aria-label={`Page ${i + 1}`} />}
              isActive={page === i + 1}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Link>
          </Pagination.Item>
        ))}
      </Pagination.Content>
    </Pagination>
  );
}
