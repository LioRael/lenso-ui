"use client";
// HeroUI v3.2.6 custom-styles adaptation (Apache-2.0).
import { Table } from "@lenso/ui";
import { Headers, Rows, styles, users } from "./data";
export function CustomStyles() {
  return (
    <Table xstyle={styles.customRoot}>
      <Table.ScrollContainer>
        <Table.Content aria-label="Team members" xstyle={styles.content}>
          <Headers custom email={false} />
          <Table.Body>
            <Rows items={users.slice(0, 3)} custom email={false} />
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
