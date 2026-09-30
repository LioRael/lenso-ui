"use client";
// Shared source data/anatomy from HeroUI v3.2.6 table examples (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Chip, Pagination, Table } from "@lenso/ui";
export interface User {
  key: number;
  name: string;
  role: string;
  status: string;
  email: string;
}
const names = [
  "Kate Moore",
  "John Smith",
  "Sara Johnson",
  "Michael Brown",
  "Emily Davis",
  "Davis Wilson",
  "Olivia Martinez",
  "James Taylor",
  "Sophia Anderson",
  "Liam Thomas",
  "Lucas Martinez",
  "Emma Johnson",
  "Noah Davis",
  "Ava Wilson",
  "Oliver Martinez",
  "Isabella Johnson",
  "Mia Davis",
  "William Wilson",
];
const roles = [
  "CEO",
  "CTO",
  "CMO",
  "CFO",
  "Product Manager",
  "Lead Designer",
  "Frontend Engineer",
  "Backend Engineer",
  "QA Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Frontend Engineer",
  "Backend Engineer",
  "Lead Designer",
  "Frontend Engineer",
  "Backend Engineer",
  "Lead Designer",
  "Frontend Engineer",
];
export const users: User[] = names.map((name, index) => ({
  key: index + 1,
  name,
  role: roles[index]!,
  status: index === 2 || index === 8 ? "On Leave" : index === 4 ? "Inactive" : "Active",
  email: `${name.split(" ")[0]!.toLowerCase()}@acme.com`,
}));
export const columns = ["name", "role", "status", "email"] as const;
export const styles = stylex.create({
  content: { minWidth: 600 },
  resizing: { minWidth: 700 },
  customCells: { minWidth: 800 },
  stack: { display: "flex", flexDirection: "column", gap: 12 },
  viewport: { height: 280, overflowY: "auto" },
  virtualViewport: { height: 300, overflowY: "auto" },
  sticky: { position: "sticky", top: 0, zIndex: 10, backgroundColor: "var(--surface-secondary)" },
  row: { display: "flex", alignItems: "center", gap: 12 },
  detail: { display: "flex", flexDirection: "column", fontSize: 12 },
  muted: { color: "var(--muted)", fontSize: 14 },
  customRoot: {
    maxWidth: 672,
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
    boxShadow: {
      default: "0 1px 2px #0000000d, 0 0 0 1px #0000000d",
      ":is(.dark *,[data-theme='dark'] *)": "0 1px 2px #0000000d, 0 0 0 1px #ffffff1a",
    },
  },
  customHeaderRow: {
    backgroundColor: {
      default: "color-mix(in oklch, oklch(.97 0 0) 80%, transparent)",
      ":is(.dark *,[data-theme='dark'] *)": "color-mix(in oklch, oklch(.269 0 0) 80%, transparent)",
    },
  },
  customHeader: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".025em",
    color: {
      default: "oklch(.556 0 0)",
      ":is(.dark *,[data-theme='dark'] *)": "oklch(.708 0 0)",
    },
  },
  customCell: {
    backgroundColor: {
      default: "var(--surface)",
      ":is(tr:nth-child(even)>td)": "color-mix(in oklch, oklch(.985 0 0) 50%, transparent)",
      ":is(tr:hover>td)": "color-mix(in oklch, oklch(.97 0 0) 60%, transparent)",
      ":is(.dark *,[data-theme='dark'] *):is(tr:nth-child(even)>td)":
        "color-mix(in oklch, oklch(.205 0 0) 30%, transparent)",
      ":is(.dark *,[data-theme='dark'] *):is(tr:hover>td)":
        "color-mix(in oklch, oklch(.269 0 0) 50%, transparent)",
    },
    borderTop: "1px solid color-mix(in oklch, var(--border) 60%, transparent)",
    transitionProperty: "background-color",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
  },
  customName: {
    fontWeight: 500,
    color: { default: "oklch(.205 0 0)", ":is(.dark *,[data-theme='dark'] *)": "oklch(.97 0 0)" },
  },
});
export function Status({ status }: { status: string }) {
  return (
    <Chip
      color={status === "Active" ? "success" : status === "Inactive" ? "danger" : "warning"}
      size="sm"
      variant="soft"
    >
      {status}
    </Chip>
  );
}
export function Headers({
  sorting = false,
  selection = false,
  resizing = false,
  custom = false,
  email = true,
}: {
  sorting?: boolean;
  selection?: boolean;
  resizing?: boolean;
  custom?: boolean;
  email?: boolean;
}) {
  return (
    <Table.Header xstyle={custom && styles.customHeaderRow}>
      {selection && (
        <Table.Column columnKey="selection" width={48}>
          <Table.SelectionCheckbox />
        </Table.Column>
      )}
      {columns
        .filter((key) => email || key !== "email")
        .map((key, index) => (
          <Table.Column
            key={key}
            columnKey={key}
            allowsSorting={sorting}
            width={resizing ? "1fr" : undefined}
            minWidth={resizing ? [160, 220, 100, 200][index] : undefined}
            xstyle={custom && styles.customHeader}
          >
            {({ sortDirection }) => (
              <>
                {sorting ? (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    {key[0]!.toUpperCase() + key.slice(1)}
                  </Table.SortableColumnHeader>
                ) : (
                  key[0]!.toUpperCase() + key.slice(1)
                )}
                {resizing && key !== "email" && <Table.ColumnResizer />}
              </>
            )}
          </Table.Column>
        ))}
    </Table.Header>
  );
}
export function Rows({
  items,
  selection = false,
  chips = false,
  custom = false,
  email = true,
}: {
  items: readonly User[];
  selection?: boolean;
  chips?: boolean;
  custom?: boolean;
  email?: boolean;
}) {
  return items.map((user) => (
    <Table.Row key={user.key} itemKey={user.key}>
      {selection && (
        <Table.Cell>
          <Table.SelectionCheckbox aria-label={`Select ${user.name}`} />
        </Table.Cell>
      )}
      {columns
        .filter((key) => email || key !== "email")
        .map((key) => (
          <Table.Cell
            key={key}
            xstyle={[custom && styles.customCell, custom && key === "name" && styles.customName]}
          >
            {key === "status" && chips ? <Status status={user.status} /> : user[key]}
          </Table.Cell>
        ))}
    </Table.Row>
  ));
}
export function Pages({
  page,
  count,
  total,
  setPage,
}: {
  page: number;
  count: number;
  total: number;
  setPage: (page: number) => void;
}) {
  const action = (event: React.MouseEvent<HTMLAnchorElement>, next: number) => {
    event.preventDefault();
    setPage(next);
  };
  return (
    <Pagination size="sm">
      <Pagination.Summary>
        {(page - 1) * 4 + 1} to {Math.min(page * 4, total)} of {total} results
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            href={`?page=${page - 1}`}
            disabled={page === 1}
            onClick={(event) => action(event, page - 1)}
          >
            <Pagination.PreviousIcon />
            Prev
          </Pagination.Previous>
        </Pagination.Item>
        {Array.from({ length: count }, (_, index) => index + 1).map((number) => (
          <Pagination.Item key={number}>
            <Pagination.Link
              href={`?page=${number}`}
              isActive={number === page}
              onClick={(event) => action(event, number)}
            >
              {number}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next
            href={`?page=${page + 1}`}
            disabled={page === count}
            onClick={(event) => action(event, page + 1)}
          >
            Next
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
