// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 popover-custom-styles (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "../../en/popover/styles";
export function CustomStyles() {
  return (
    <Popover>
      <Popover.Trigger render={<Button variant="secondary" />}>详情</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup xstyle={styles.customPopup}>
            <div {...stylex.props(styles.customDialog)}>
              <div aria-hidden="true" {...stylex.props(styles.highlight)} />
              <Popover.Title xstyle={styles.customHeading}>键盘快捷键</Popover.Title>
              <dl {...stylex.props(styles.shortcuts)}>
                <div {...stylex.props(styles.shortcut)}>
                  <dt {...stylex.props(styles.muted)}>保存</dt>
                  <dd {...stylex.props(styles.key)}>⌘ S</dd>
                </div>
                <div {...stylex.props(styles.shortcut)}>
                  <dt {...stylex.props(styles.muted)}>搜索</dt>
                  <dd {...stylex.props(styles.key)}>⌘ K</dd>
                </div>
              </dl>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover>
  );
}
