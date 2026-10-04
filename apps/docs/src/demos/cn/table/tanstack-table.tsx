// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 tanstack-table adaptation (Apache-2.0); retains the v9 data model.
import { useState } from "react";
import { Table, type SortDescriptor } from "@lenso/ui";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type SortingState,
} from "@tanstack/react-table";
import { Pages, Status, styles, users, type User } from "./tanstack-table--data";
const features = tableFeatures({
  paginatedRowModel: createPaginatedRowModel(),
  rowPaginationFeature,
  rowSortingFeature,
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
  },
  sortedRowModel: createSortedRowModel(),
});
const helper = createColumnHelper<typeof features, User>();
const columns = helper.columns([
  helper.accessor("name", {
    header: "Name",
  }),
  helper.accessor("role", {
    header: "Role",
  }),
  helper.accessor("status", {
    header: "Status",
    cell: (info) => <Status status={info.getValue()} />,
  }),
  helper.accessor("email", {
    header: "Email",
  }),
]);
const data = users.slice(0, 8);
export function TanstackTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    columns,
    data,
    features,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 4,
      },
    },
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  const first = sorting[0];
  const descriptor: SortDescriptor | undefined = first
    ? {
        column: first.id,
        direction: first.desc ? "descending" : "ascending",
      }
    : undefined;
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="TanStack 表格示例"
          xstyle={styles.content}
          sortDescriptor={descriptor}
          onSortChange={(next) =>
            setSorting([
              {
                id: String(next.column),
                desc: next.direction === "descending",
              },
            ])
          }
        >
          <Table.Header>
            {table.getHeaderGroups()[0]?.headers.map((header) => (
              <Table.Column
                key={header.id}
                columnKey={header.id}
                allowsSorting={header.column.getCanSort()}
              >
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id} itemKey={row.id}>
                {row.getAllCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <Table.Footer>
        <Pages
          page={table.state.pagination.pageIndex + 1}
          count={table.getPageCount()}
          total={8}
          setPage={(page) => table.setPageIndex(page - 1)}
        />
      </Table.Footer>
    </Table>
  );
}
