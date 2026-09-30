"use client";
// HeroUI v3.2.6 virtualization adaptation (Apache-2.0); native row spacers.
import { Table } from "@lenso/ui";
import { styles } from "./data";
const first = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "James",
  "Sophia",
  "Oliver",
  "Isabella",
  "Lucas",
  "Mia",
  "Ethan",
  "Charlotte",
  "Mason",
  "Amelia",
  "Logan",
  "Harper",
  "Alexander",
  "Ella",
  "Benjamin",
];
const last = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Robinson",
  "Walker",
];
const roles = [
  "Software Engineer",
  "Senior Engineer",
  "Staff Engineer",
  "Product Manager",
  "Designer",
  "Data Analyst",
  "QA Engineer",
  "DevOps Engineer",
  "Marketing Manager",
  "Sales Representative",
];
const users = Array.from({ length: 1000 }, (_, index) => ({
  key: index + 1,
  name: `${first[index % 20]} ${last[Math.floor(index / 20) % 20]}`,
  role: roles[index % 10],
  email: `${first[index % 20]!.toLowerCase()}.${last[Math.floor(index / 20) % 20]!.toLowerCase()}@acme.com`,
}));
export function Virtualization() {
  return (
    <Table>
      <Table.ScrollContainer xstyle={styles.virtualViewport}>
        <Table.Content aria-label="Virtualized table with 1000 rows" xstyle={styles.resizing}>
          <Table.Header xstyle={styles.sticky}>
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
          <Table.Body items={users} virtualized={{ height: 300, rowHeight: 42 }}>
            {(user) => (
              <Table.Row itemKey={user.key}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
