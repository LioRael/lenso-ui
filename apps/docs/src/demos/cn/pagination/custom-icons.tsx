// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0. Local state actions render native buttons; navigation examples retain anchors.
import { Pagination } from "@lenso/ui";
import { Icon } from "@iconify/react";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/pagination/source.stylex";
function pageNumbers(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 7)
    return Array.from(
      {
        length: total,
      },
      (_, index) => index + 1,
    );
  const pages: (number | "ellipsis")[] = [1];
  if (page > 3) pages.push("ellipsis");
  for (let value = Math.max(2, page - 1); value <= Math.min(total - 1, page + 1); value++)
    pages.push(value);
  if (page < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}
function StatefulPagination({
  total = 3,
  size = "md",
  summary = false,
  simple = false,
  disabled = false,
  custom = false,
  customIcons = false,
  initial = 1,
}: {
  total?: number;
  size?: "sm" | "md" | "lg";
  summary?: boolean;
  simple?: boolean;
  disabled?: boolean;
  custom?: boolean;
  customIcons?: boolean;
  initial?: number;
}) {
  const [page, setPage] = useState(initial);
  const perPage = simple ? 5 : 10;
  return (
    <Pagination size={size} xstyle={summary ? styles.full : styles.center}>
      {summary && (
        <Pagination.Summary>
          {simple
            ? `${(page - 1) * perPage + 1} to ${page * perPage} of ${total * perPage} invoices`
            : `Showing ${(page - 1) * perPage + 1}-${page * perPage} of ${total * perPage} results`}
        </Pagination.Summary>
      )}
      <Pagination.Content xstyle={custom && styles.customContent}>
        <Pagination.Item>
          <Pagination.Previous
            render={<button type="button" aria-label="返回" disabled={disabled || page === 1} />}
            disabled={disabled || page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            xstyle={custom && styles.link}
          >
            <Pagination.PreviousIcon>
              {customIcons ? <Icon icon="gravity-ui:arrow-left" /> : undefined}
            </Pagination.PreviousIcon>
            {!custom && <span>{simple ? "Prev" : customIcons ? "返回" : "Previous"}</span>}
          </Pagination.Previous>
        </Pagination.Item>
        {!simple &&
          pageNumbers(page, total).map((value, index) => (
            <Pagination.Item key={value === "ellipsis" ? `ellipsis-${index}` : value}>
              {value === "ellipsis" ? (
                <Pagination.Ellipsis />
              ) : (
                <Pagination.Link
                  render={<button type="button" aria-label={`${value}`} />}
                  isActive={value === page}
                  onClick={() => setPage(value)}
                  xstyle={custom && (value === page ? styles.active : styles.link)}
                >
                  {value}
                </Pagination.Link>
              )}
            </Pagination.Item>
          ))}
        <Pagination.Item>
          <Pagination.Next
            render={
              <button type="button" aria-label="前进" disabled={disabled || page === total} />
            }
            disabled={disabled || page === total}
            onClick={() => setPage((value) => Math.min(total, value + 1))}
            xstyle={custom && styles.link}
          >
            {!custom && <span>{customIcons ? "前进" : "Next"}</span>}
            <Pagination.NextIcon>
              {customIcons ? <Icon icon="gravity-ui:arrow-right" /> : undefined}
            </Pagination.NextIcon>
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
export function PaginationBasic() {
  return <StatefulPagination />;
}
export function PaginationWithEllipsis() {
  return (
    <div {...stylex.props(styles.overflow)}>
      <StatefulPagination total={12} />
    </div>
  );
}
export function PaginationSimplePrevNext() {
  return <StatefulPagination total={10} simple summary />;
}
export function PaginationWithSummary() {
  return <StatefulPagination total={12} summary />;
}
export function PaginationControlled() {
  return <StatefulPagination total={12} summary />;
}
export function PaginationDisabled() {
  return <StatefulPagination disabled />;
}
export function PaginationCustomIcons() {
  return <StatefulPagination customIcons />;
}
export function CustomStyles() {
  return <StatefulPagination custom initial={2} />;
}
export function PaginationSizes() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} {...stylex.props(styles.section)}>
          <span {...stylex.props(styles.caption)}>{size}</span>
          <StatefulPagination size={size} />
        </div>
      ))}
    </div>
  );
}
