// HeroUI v3.2.6 stories adaptation, Apache-2.0. Native public Table composition.
// oxlint-disable jsx-a11y/prefer-tag-over-role -- Public Table.Cell is a td without render composition; role preserves upstream row-header semantics.
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Button, Chip, EmptyState, Pagination, Spinner, Table } from "@lenso/ui";
import type { SortDescriptor } from "@lenso/ui/table";
import { collectionStyles as s } from "./collection.stylex";
import { CollectionIcon } from "./collection-icons.fixtures";
import { CollectionSelection } from "./collection-selection.fixtures";
import {
  columns,
  files,
  generateUsers,
  statusColorMap,
  users,
  type FileRow,
  type User,
} from "./collection-data.fixtures";

const meta = {
  component: Table,
  title: "Components/Data Display/Table",
  parameters: { layout: "centered" },
  argTypes: { variant: { control: "select", options: ["primary", "secondary"] } },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div {...stylex.props(s.wrapper)}>{children}</div>
);
function usePagination<T>(items: T[], rowsPerPage = 4) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(items.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage + 1;
  return {
    page,
    setPage,
    totalPages,
    start,
    end: Math.min(page * rowsPerPage, items.length),
    total: items.length,
    paginatedItems: items.slice(start - 1, page * rowsPerPage),
  };
}
function TablePaginationFooter({
  pagination: p,
}: {
  pagination: ReturnType<typeof usePagination>;
}) {
  return (
    <Pagination size="sm">
      <Pagination.Summary>
        {p.start} to {p.end} of {p.total} results
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            render={<button type="button" aria-label="Previous page" disabled={p.page === 1} />}
            disabled={p.page === 1}
            onClick={() => p.setPage((value) => Math.max(1, value - 1))}
          >
            <Pagination.PreviousIcon />
            Prev
          </Pagination.Previous>
        </Pagination.Item>
        {Array.from({ length: p.totalPages }, (_, i) => i + 1).map((page) => (
          <Pagination.Item key={page}>
            <Pagination.Link
              render={<button type="button" aria-label={String(page)} />}
              isActive={page === p.page}
              onClick={() => p.setPage(page)}
            >
              {page}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next
            render={
              <button type="button" aria-label="Next page" disabled={p.page === p.totalPages} />
            }
            disabled={p.page === p.totalPages}
            onClick={() => p.setPage((value) => Math.min(p.totalPages, value + 1))}
          >
            Next
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
function Status({ user }: { user: User }) {
  return (
    <Chip color={statusColorMap[user.status]} size="sm" variant="soft">
      {user.status}
    </Chip>
  );
}
function DefaultTableTemplate({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<React.Key>>(new Set());
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const sortedUsers = React.useMemo(
    () =>
      [...users].sort((a, b) => {
        const column = sortDescriptor.column as keyof User;
        return (
          String(a[column]).localeCompare(String(b[column])) *
          (sortDescriptor.direction === "descending" ? -1 : 1)
        );
      }),
    [sortDescriptor],
  );
  const pagination = usePagination(sortedUsers);
  const selectedCount = pagination.paginatedItems.filter((user) =>
    selectedKeys.has(user.id),
  ).length;
  return (
    <Wrapper>
      <Table variant={variant}>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Custom cells"
            xstyle={s.min800}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              <Table.Column columnKey="selection" xstyle={s.noEndPadding}>
                <CollectionSelection
                  label="Select all"
                  indeterminate={
                    selectedCount > 0 && selectedCount < pagination.paginatedItems.length
                  }
                />
              </Table.Column>
              {(
                [
                  ["id", "Worker ID"],
                  ["name", "Member"],
                  ["role", "Role"],
                  ["status", "Status"],
                ] as const
              ).map(([key, label]) => (
                <Table.Column
                  key={key}
                  columnKey={key}
                  allowsSorting
                  xstyle={key === "id" && s.noSeparator}
                >
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {label}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>
              ))}
              <Table.Column columnKey="actions" xstyle={s.end}>
                Actions
              </Table.Column>
            </Table.Header>
            <Table.Body items={pagination.paginatedItems}>
              {(user) => (
                <Table.Row itemKey={user.id} textValue={user.name}>
                  <Table.Cell xstyle={s.noEndPadding}>
                    <CollectionSelection label={`Select ${user.name}`} secondary />
                  </Table.Cell>
                  <Table.Cell role="rowheader" xstyle={s.weight}>
                    <div {...stylex.props(s.row2)}>
                      #{user.id.toString()}{" "}
                      <Button aria-label={`Copy ${user.id}`} isIconOnly size="sm" variant="ghost">
                        <CollectionIcon name="copy" {...stylex.props(s.mutedIcon)} />
                      </Button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div {...stylex.props(s.row3)}>
                      <Avatar size="sm">
                        <Avatar.Image src={user.image_url} />
                        <Avatar.Fallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar.Fallback>
                      </Avatar>
                      <div {...stylex.props(s.column)}>
                        <span {...stylex.props(s.textXs)}>{user.name}</span>
                        <span {...stylex.props(s.mutedXs)}>{user.email}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell xstyle={s.role}>{user.role}</Table.Cell>
                  <Table.Cell xstyle={s.status}>
                    <Status user={user} />
                  </Table.Cell>
                  <Table.Cell>
                    <div {...stylex.props(s.row1)}>
                      <Button
                        aria-label={`View ${user.name}`}
                        isIconOnly
                        size="sm"
                        variant="tertiary"
                      >
                        <CollectionIcon name="eye" />
                      </Button>
                      <Button
                        aria-label={`Edit ${user.name}`}
                        isIconOnly
                        size="sm"
                        variant="tertiary"
                      >
                        <CollectionIcon name="pencil" />
                      </Button>
                      <Button
                        aria-label={`Delete ${user.name}`}
                        isIconOnly
                        size="sm"
                        variant="danger-soft"
                      >
                        <CollectionIcon name="trash-bin" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>
          <TablePaginationFooter pagination={pagination} />
        </Table.Footer>
      </Table>
    </Wrapper>
  );
}
export const Default: Story = {
  args: { variant: "primary" },
  render: ({ variant }) => <DefaultTableTemplate variant={variant} />,
};
export const SecondaryVariant: Story = {
  render: () => <DefaultTableTemplate variant="secondary" />,
};
export const EmptyStateDemo: Story = {
  args: { variant: "primary" },
  render: ({ variant }) => (
    <Wrapper>
      <Table xstyle={s.emptyTable} variant={variant}>
        <Table.ScrollContainer>
          <Table.Content aria-label="Empty state" xstyle={[s.min600, s.fullHeight]}>
            <Table.Header columns={columns}>
              {(column) => <Table.Column columnKey={column.key}>{column.name}</Table.Column>}
            </Table.Header>
            <Table.Body>
              <Table.Row itemKey="empty">
                <Table.Cell colSpan={4}>
                  <EmptyState xstyle={s.emptyTableContent}>
                    <CollectionIcon name="tray" {...stylex.props(s.tray)} />
                    <span {...stylex.props(s.mutedSm)}>No results found</span>
                  </EmptyState>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Wrapper>
  ),
};
function DynamicTable({ selection = false }: { selection?: boolean }) {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<React.Key>>(new Set());
  const pagination = usePagination(users);
  const selectedCount = pagination.paginatedItems.filter((user) =>
    selectedKeys.has(user.id),
  ).length;
  return (
    <Wrapper>
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label={selection ? "Dynamic with selection" : "Dynamic collection"}
            xstyle={selection ? s.min650 : s.min600}
            selectionMode={selection ? "multiple" : "none"}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
          >
            <Table.Header>
              {selection && (
                <Table.Column columnKey="selection">
                  <CollectionSelection
                    label="Select all"
                    indeterminate={
                      selectedCount > 0 && selectedCount < pagination.paginatedItems.length
                    }
                  />
                </Table.Column>
              )}
              <Table.Collection items={columns}>
                {(column) => <Table.Column columnKey={column.key}>{column.name}</Table.Column>}
              </Table.Collection>
            </Table.Header>
            <Table.Body items={pagination.paginatedItems}>
              {(user) => (
                <Table.Row itemKey={user.id} textValue={user.name}>
                  {selection && (
                    <Table.Cell>
                      <CollectionSelection label={`Select ${user.name}`} secondary />
                    </Table.Cell>
                  )}
                  <Table.Collection items={columns}>
                    {(column) => (
                      <Table.Cell role={column.key === "name" ? "rowheader" : undefined}>
                        {user[column.key]}
                      </Table.Cell>
                    )}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>
          <TablePaginationFooter pagination={pagination} />
        </Table.Footer>
      </Table>
    </Wrapper>
  );
}
export const DynamicCollection: Story = { render: () => <DynamicTable /> };
export const DynamicWithSelection: Story = { render: () => <DynamicTable selection /> };
export const ColumnResizing: Story = {
  render: () => (
    <Wrapper>
      <Table>
        <Table.ResizableContainer>
          <Table.Content aria-label="Column resizing" xstyle={s.min700}>
            <Table.Header>
              {columns.map((column, index) => (
                <Table.Column
                  key={column.key}
                  columnKey={column.key}
                  width="1fr"
                  minWidth={[160, 220, 100, 200][index]}
                >
                  {column.name}
                  {index < 3 && <Table.ColumnResizer aria-label={`Resize ${column.name}`} />}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body items={users}>
              {(user) => (
                <Table.Row itemKey={user.id} textValue={user.name}>
                  <Table.Cell role="rowheader">{user.name}</Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>
                    <Status user={user} />
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ResizableContainer>
      </Table>
    </Wrapper>
  ),
};
function AsyncTable({ variant }: { variant?: "primary" | "secondary" }) {
  const [items, setItems] = React.useState(() => users.slice(0, 6));
  const [isLoading, setIsLoading] = React.useState(false);
  const loading = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const hasMore = items.length < users.length;
  const loadMore = React.useCallback(() => {
    if (!hasMore || loading.current) return;
    loading.current = true;
    setIsLoading(true);
    timer.current = setTimeout(() => {
      setItems((previous) => users.slice(0, previous.length + 6));
      setIsLoading(false);
      requestAnimationFrame(() => {
        loading.current = false;
      });
    }, 1500);
  }, [hasMore]);
  return (
    <Wrapper>
      <Table variant={variant}>
        <Table.ScrollContainer xstyle={s.scrollAsync}>
          <Table.Content aria-label="Async loading" xstyle={s.min600}>
            <Table.Header columns={columns} xstyle={s.sticky}>
              {(column) => <Table.Column columnKey={column.key}>{column.name}</Table.Column>}
            </Table.Header>
            <Table.Body>
              <Table.Collection items={items}>
                {(user) => (
                  <Table.Row itemKey={user.id} textValue={user.name}>
                    <Table.Cell role="rowheader">{user.name}</Table.Cell>
                    <Table.Cell>{user.role}</Table.Cell>
                    <Table.Cell>
                      <Status user={user} />
                    </Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                  </Table.Row>
                )}
              </Table.Collection>
              {hasMore && (
                <Table.LoadMore loading={isLoading} onLoadMore={loadMore} colSpan={4}>
                  <Table.LoadMoreContent>
                    <Spinner size="md" />
                  </Table.LoadMoreContent>
                </Table.LoadMore>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Wrapper>
  );
}
export const AsyncLoading: Story = {
  args: { variant: "primary" },
  render: ({ variant }) => <AsyncTable variant={variant} />,
};
const virtualizedUsers = generateUsers(1000);
export const Virtualization: Story = {
  render: () => (
    <Table>
      <Table.ScrollContainer xstyle={s.scrollVirtual}>
        <Table.Content aria-label="Virtualized table with 1000 rows" xstyle={s.min700}>
          <Table.Header xstyle={s.heading42}>
            <Table.Column columnKey="name" minWidth={160}>
              Name
            </Table.Column>
            <Table.Column columnKey="role" minWidth={220}>
              Role
            </Table.Column>
            <Table.Column columnKey="email" minWidth={240}>
              Email
            </Table.Column>
          </Table.Header>
          <Table.Body items={virtualizedUsers} virtualized={{ rowHeight: 42, height: 500 }}>
            {(user) => (
              <Table.Row itemKey={user.id} textValue={user.name}>
                <Table.Cell role="rowheader" xstyle={s.virtualCell}>
                  {user.name}
                </Table.Cell>
                <Table.Cell xstyle={s.virtualCell}>{user.role}</Table.Cell>
                <Table.Cell xstyle={s.virtualCell}>{user.email}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  ),
};
function ExpandableTable() {
  const [expandedKeys, setExpandedKeys] = React.useState<Set<React.Key>>(() => new Set(["1"]));
  const renderRow = (item: FileRow): React.ReactNode => (
    <Table.Row itemKey={item.key} textValue={item.title}>
      <Table.Cell columnKey="name" role="rowheader">
        {({ hasChildItems, isDisabled, isExpanded, isTreeColumn }) => (
          <span {...stylex.props(s.row1)}>
            {hasChildItems && isTreeColumn && (
              <Table.ExpandButton aria-label="Toggle row" disabled={isDisabled}>
                <CollectionIcon
                  name="chevron-right"
                  {...stylex.props(s.chevron, isExpanded && s.rotated)}
                />
              </Table.ExpandButton>
            )}
            <span>{item.title}</span>
          </span>
        )}
      </Table.Cell>
      <Table.Cell>{item.type}</Table.Cell>
      <Table.Cell>{item.date}</Table.Cell>
      <Table.Collection items={item.children}>{renderRow}</Table.Collection>
    </Table.Row>
  );
  return (
    <Wrapper>
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Files"
            xstyle={s.min520}
            expandedKeys={expandedKeys}
            treeColumn="name"
            onExpandedChange={setExpandedKeys}
          >
            <Table.Header>
              <Table.Column columnKey="name">Name</Table.Column>
              <Table.Column columnKey="type">Type</Table.Column>
              <Table.Column columnKey="date">Date Modified</Table.Column>
            </Table.Header>
            <Table.Body items={files}>{renderRow}</Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Wrapper>
  );
}
export const ExpandableRows: Story = { render: () => <ExpandableTable /> };
