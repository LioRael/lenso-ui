// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 drawer-custom-styles (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
export function CustomStyles() {
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right">
        <Drawer.Trigger render={<Button variant="secondary" />}>打开筛选</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop variant="blur" />
          <Drawer.Viewport>
            <Drawer.Popup xstyle={styles.filters}>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>筛选</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p {...stylex.props(styles.muted)}>按状态、负责人或日期缩小结果范围。</p>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>取消</Drawer.Close>
                  <Drawer.Close render={<Button />}>应用</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
