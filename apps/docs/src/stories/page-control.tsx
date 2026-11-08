"use client";
import { useState } from "react";
import { PageControl } from "@lenso/ui";
export interface PageControlStoryProps {
  count: number;
  disabled: boolean;
  variant?: "prominent" | "plain";
}
export function PageControlStory({
  count,
  disabled,
  variant = "prominent",
}: PageControlStoryProps) {
  const [page, setPage] = useState(0);
  return (
    <div>
      <p aria-live="polite">
        Page {Math.min(page + 1, count)} of {count}
      </p>
      <PageControl
        count={count}
        page={page}
        onPageChange={setPage}
        disabled={disabled}
        variant={variant}
      />
    </div>
  );
}
