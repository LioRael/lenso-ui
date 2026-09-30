// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 table-basic (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Table } from "@lenso/ui";
const rows = [
  {
    key: "kate",
    name: "Kate Moore",
    role: "CEO",
    status: "Active",
    email: "kate@acme.com",
  },
  {
    key: "john",
    name: "John Smith",
    role: "CTO",
    status: "Active",
    email: "john@acme.com",
  },
  {
    key: "sara",
    name: "Sara Johnson",
    role: "CMO",
    status: "On Leave",
    email: "sara@acme.com",
  },
  {
    key: "michael",
    name: "Michael Brown",
    role: "CFO",
    status: "Active",
    email: "michael@acme.com",
  },
] as const;
const styles = stylex.create({
  content: {
    minWidth: 600,
  },
});
export function Basic() {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="团队成员" xstyle={styles.content}>
          <Table.Header>
            <Table.Column columnKey="name">姓名</Table.Column>
            <Table.Column columnKey="role">角色</Table.Column>
            <Table.Column columnKey="status">状态</Table.Column>
            <Table.Column columnKey="email">邮箱</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Collection items={rows}>
              {(row) => (
                <Table.Row itemKey={row.key}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.role}</Table.Cell>
                  <Table.Cell>{row.status}</Table.Cell>
                  <Table.Cell>{row.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
