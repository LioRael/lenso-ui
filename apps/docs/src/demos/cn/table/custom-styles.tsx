// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 custom-styles adaptation (Apache-2.0).
import { Table } from "@lenso/ui";
import { Headers, Rows, styles, users } from "../../en/table/data";
export function CustomStyles() {
  return (
    <Table xstyle={styles.customRoot}>
      <Table.ScrollContainer>
        <Table.Content aria-label="团队成员" xstyle={styles.content}>
          <Headers custom email={false} />
          <Table.Body>
            <Rows items={users.slice(0, 3)} custom email={false} />
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
