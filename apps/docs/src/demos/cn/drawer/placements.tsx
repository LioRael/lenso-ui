"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
const PLACEMENT_LABELS = {
  bottom: "底部",
  left: "左侧",
  right: "右侧",
  top: "顶部",
};
export function Placements() {
  const placements = ["bottom", "top", "left", "right"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {placements.map((placement) => (
        <Drawer key={placement} side={placement}>
          <Drawer.Trigger render={<Button />}>
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </Drawer.Trigger>
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.Layout>
              <Drawer.Close aria-label="Close drawer" />
              {placement === "bottom" && <Drawer.Handle />}
              <Drawer.Header>
                <Drawer.Title>
                  {placement.charAt(0).toUpperCase() + placement.slice(1)}Drawer
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  此抽屉从屏幕<strong>{PLACEMENT_LABELS[placement]}</strong>边缘滑入。
                </p>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close render={<Button variant="bordered" />}>取消</Drawer.Close>
                <Drawer.Close render={<Button />}>完成</Drawer.Close>
              </Drawer.Footer>
              {placement === "top" && <Drawer.Handle />}
            </Drawer.Layout>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  );
}
