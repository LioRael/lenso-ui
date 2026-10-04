// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button, Disclosure, DisclosureGroup, Separator } from "@lenso/ui";
import { styles } from "../../en/disclosure-group/source.stylex";
export function CustomStyles() {
  return (
    <DisclosureGroup xstyle={styles.custom}>
      <Disclosure value="billing">
        <Disclosure.Heading>
          <Disclosure.Trigger render={<Button variant="ghost" xstyle={styles.trigger} />}>
            账单
            <Disclosure.Indicator xstyle={styles.muted} />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body xstyle={styles.body}>发票将于每月 1 日开具。</Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
      <Separator xstyle={styles.separator} />
      <Disclosure value="support">
        <Disclosure.Heading>
          <Disclosure.Trigger render={<Button variant="ghost" xstyle={styles.trigger} />}>
            支持
            <Disclosure.Indicator xstyle={styles.muted} />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body xstyle={styles.body}>
            请通过 help@heroui.com 联系我们。通常会在一个工作日内回复。
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </DisclosureGroup>
  );
}
