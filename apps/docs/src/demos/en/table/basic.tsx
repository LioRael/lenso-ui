"use client";

// Adapted from HeroUI v3.2.6 table-basic (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Table } from "@lenso/ui";

const rows = [
  { key: "kate", name: "Kate Moore", role: "CEO", status: "Active", email: "kate@acme.com" },
  { key: "john", name: "John Smith", role: "CTO", status: "Active", email: "john@acme.com" },
  { key: "sara", name: "Sara Johnson", role: "CMO", status: "On Leave", email: "sara@acme.com" },
  {
    key: "michael",
    name: "Michael Brown",
    role: "CFO",
    status: "Active",
    email: "michael@acme.com",
  },
] as const;
const styles = stylex.create({ content: { minWidth: 600 } });

export function Basic() {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Team members" xstyle={styles.content}>
          <Table.Header>
            <Table.Column columnKey="name">Name</Table.Column>
            <Table.Column columnKey="role">Role</Table.Column>
            <Table.Column columnKey="status">Status</Table.Column>
            <Table.Column columnKey="email">Email</Table.Column>
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
