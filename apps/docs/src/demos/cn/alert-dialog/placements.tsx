"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, AlertDialog } from "@lenso/ui";
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
  },
  popup: {
    maxWidth: 400,
  },
});
export function Placements() {
  const placements = ["auto", "top", "center", "bottom"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {placements.map((placement) => (
        <AlertDialog key={placement}>
          <AlertDialog.Trigger render={<Button />}>
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup placement={placement} xstyle={styles.popup}>
                <AlertDialog.Close aria-label="Close dialog" />
                <AlertDialog.Header>
                  <AlertDialog.Icon variant="accent" />
                  <AlertDialog.Title>
                    {placement === "auto"
                      ? "自动定位"
                      : `${placement.charAt(0).toUpperCase() + placement.slice(1)}位置`}
                  </AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description>
                    {placement === "auto"
                      ? "在移动端和桌面端均居中显示。"
                      : `对话框将锚定在视口的「${placement}」区域。重要确认通常使用居中 placement 以吸引最多注意。`}
                  </AlertDialog.Description>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <AlertDialog.Action variant="cancel">取消</AlertDialog.Action>
                  <AlertDialog.Action>确认</AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        </AlertDialog>
      ))}
    </div>
  );
}
