"use client";
import { Table } from "@lenso/ui";
import { Headers, Rows, styles, users } from "./data";
export function SecondaryVariant() {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label="Team members" xstyle={styles.content}>
          <Headers />
          <Table.Body>
            <Rows items={users.slice(0, 4)} />
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
