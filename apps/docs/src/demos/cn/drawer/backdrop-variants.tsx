"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
const VARIANT_LABELS = {
  blur: "模糊",
  opaque: "不透明",
  transparent: "透明",
};
export function BackdropVariants() {
  const variants = ["opaque", "blur", "transparent"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {variants.map((variant) => (
        <Drawer key={variant} side="bottom">
          <Drawer.Trigger render={<Button />}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Drawer.Trigger>
          <Drawer.Backdrop variant={variant} />
          <Drawer.Content>
            <Drawer.Layout>
              <Drawer.Handle />
              <Drawer.Close aria-label="Close drawer" />
              <Drawer.Header>
                <Drawer.Title>
                  Backdrop: {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  此抽屉使用<code>{VARIANT_LABELS[variant]}</code>背景变体。
                </p>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close render={<Button xstyle={styles.fullWidth} />}>关闭</Drawer.Close>
              </Drawer.Footer>
            </Drawer.Layout>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  );
}
