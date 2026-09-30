"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button, Disclosure, DisclosureGroup, Separator } from "@lenso/ui";
import { styles } from "./source.stylex";
export function CustomStyles() {
  return (
    <DisclosureGroup xstyle={styles.custom}>
      <Disclosure value="billing">
        <Disclosure.Heading>
          <Disclosure.Trigger render={<Button variant="ghost" xstyle={styles.trigger} />}>
            Billing
            <Disclosure.Indicator xstyle={styles.muted} />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body xstyle={styles.body}>
            Invoices are issued on the first of each month.
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
      <Separator xstyle={styles.separator} />
      <Disclosure value="support">
        <Disclosure.Heading>
          <Disclosure.Trigger render={<Button variant="ghost" xstyle={styles.trigger} />}>
            Support
            <Disclosure.Indicator xstyle={styles.muted} />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body xstyle={styles.body}>
            Reach us at help@heroui.com. Typical response time is under one business day.
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </DisclosureGroup>
  );
}
