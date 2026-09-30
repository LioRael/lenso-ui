"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { ShoppingBag } from "@gravity-ui/icons";
import { Button, Disclosure } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function CustomStyles() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.root)}>
      <Disclosure open={open} onOpenChange={setOpen}>
        <Disclosure.Heading>
          <Disclosure.Trigger render={<Button variant="ghost" xstyle={styles.trigger} />}>
            <span {...stylex.props(styles.label)}>
              <ShoppingBag {...stylex.props(styles.icon)} />
              Shipping details
            </span>
            <Disclosure.Indicator xstyle={styles.indicator} />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body xstyle={styles.body}>
            Orders ship within 2 business days. Standard delivery takes 3–5 days; express is
            available at checkout.
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
