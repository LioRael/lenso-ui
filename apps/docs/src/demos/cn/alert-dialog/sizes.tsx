"use client";

import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, AlertDialog } from "@lenso/ui";
const SIZE_LABELS = {
  cover: "通栏",
  lg: "大",
  md: "中",
  sm: "小",
  xs: "超小",
};
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
  },
  icon: {
    backgroundColor: "var(--lenso-control-fill)",
    color: "var(--lenso-label-primary)",
  },
  rocket: {
    width: 20,
    height: 20,
  },
});
export function Sizes() {
  const sizes = ["xs", "sm", "md", "lg", "cover"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {sizes.map((size) => (
        <AlertDialog key={size}>
          <AlertDialog.Trigger render={<Button />}>
            {size.charAt(0).toUpperCase() + size.slice(1)}
          </AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content size={size}>
            <AlertDialog.Close aria-label="Close dialog" />
            <AlertDialog.Header>
              <AlertDialog.Icon variant="default" xstyle={styles.icon}>
                <Rocket {...stylex.props(styles.rocket)} />
              </AlertDialog.Icon>
              <AlertDialog.Title>
                Size: {size.charAt(0).toUpperCase() + size.slice(1)}
              </AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                {size === "cover" ? (
                  <>
                    此警告框使用<code>通栏</code>尺寸：在移动端与桌面端保留边距（移动端约
                    16px、桌面端约
                    40px）铺满可视区域，仍保持圆角与标准内边距，适合需要最大宽度又保留对话框气质的关键确认。
                  </>
                ) : (
                  <>
                    此警告框使用<code>{SIZE_LABELS[size]}</code> size variant. On mobile devices,
                    all sizes adapt to near full-width for optimal viewing. On desktop, each size
                    provides a different maximum width to suit various content needs.
                  </>
                )}
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Action variant="cancel">取消</AlertDialog.Action>
              <AlertDialog.Action>确认</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      ))}
    </div>
  );
}
