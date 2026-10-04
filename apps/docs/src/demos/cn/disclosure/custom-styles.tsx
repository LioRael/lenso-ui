// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { ShoppingBag } from "@gravity-ui/icons";
import { Button, Disclosure } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/disclosure/source.stylex";
export function CustomStyles() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.root)}>
      <Disclosure open={open} onOpenChange={setOpen}>
        <Disclosure.Heading>
          <Disclosure.Trigger render={<Button variant="ghost" xstyle={styles.trigger} />}>
            <span {...stylex.props(styles.label)}>
              <ShoppingBag {...stylex.props(styles.icon)} />
              配送详情
            </span>
            <Disclosure.Indicator xstyle={styles.indicator} />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body xstyle={styles.body}>
            订单将在 2 个工作日内发货。标准配送需 3–5 天；结账时可选择加急配送。
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
