// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 custom-cells adaptation (Apache-2.0).
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Icon } from "@iconify/react";
import { Avatar, Button, Table, type SortDescriptor } from "@lenso/ui";
import { Status, styles, users, type User } from "./custom-cells--data";
const workers = users.slice(0, 5).map((user, index) => ({
  ...user,
  key: [4586932, 5273849, 7492836, 8293746, 1234567][index]!,
  role: [
    "Chief Executive Officer",
    "Chief Technology Officer",
    "Chief Marketing Officer",
    "Chief Financial Officer",
    "Product Manager",
  ][index]!,
  color: ["red", "green", "blue", "purple", "orange"][index],
}));
export function CustomCells() {
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  const [sort, setSort] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const sorted = [...workers].sort(
    (a, b) =>
      String(a[sort.column as keyof User]).localeCompare(String(b[sort.column as keyof User])) *
      (sort.direction === "ascending" ? 1 : -1),
  );
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="自定义单元格表格"
          xstyle={styles.customCells}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          sortDescriptor={sort}
          onSortChange={setSort}
        >
          <Table.Header>
            <Table.Column columnKey="selection" width={48}>
              <Table.SelectionCheckbox />
            </Table.Column>
            {[
              ["key", "Worker ID"],
              ["name", "Member"],
              ["role", "Role"],
              ["status", "Status"],
            ].map(([key, title]) => (
              <Table.Column key={key} columnKey={key!} allowsSorting>
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    {title}
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
            ))}
            <Table.Column columnKey="actions">操作</Table.Column>
          </Table.Header>
          <Table.Body>
            {sorted.map((user) => (
              <Table.Row key={user.key} itemKey={user.key}>
                <Table.Cell>
                  <Table.SelectionCheckbox aria-label={`选择 ${user.name}`} />
                </Table.Cell>
                <Table.Cell>
                  <div {...stylex.props(styles.row)}>
                    #{user.key}
                    <Button
                      isIconOnly
                      aria-label={`复制 ID #${user.key}`}
                      size="sm"
                      variant="ghost"
                    >
                      <Icon icon="gravity-ui:copy" width={16} aria-hidden="true" />
                    </Button>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div {...stylex.props(styles.row)}>
                    <Avatar size="sm">
                      <Avatar.Image
                        alt={user.name}
                        src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${user.color}.jpg`}
                      />
                      <Avatar.Fallback>
                        {user.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </Avatar.Fallback>
                    </Avatar>
                    <div {...stylex.props(styles.detail)}>
                      <span>{user.name}</span>
                      <span {...stylex.props(styles.muted)}>{user.email}</span>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>
                  <Status status={user.status} />
                </Table.Cell>
                <Table.Cell>
                  <div {...stylex.props(styles.row)}>
                    {(["View", "Edit", "Delete"] as const).map((action, index) => (
                      <Button
                        key={action}
                        isIconOnly
                        aria-label={`${action} ${user.name}`}
                        size="sm"
                        variant={action === "Delete" ? "danger-soft" : "tertiary"}
                      >
                        <Icon
                          icon={`gravity-ui:${["eye", "pencil", "trash-bin"][index]}`}
                          width={16}
                          aria-hidden="true"
                        />
                      </Button>
                    ))}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
