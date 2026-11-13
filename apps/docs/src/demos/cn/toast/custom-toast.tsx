"use client";
import type { ReactNode } from "react";

import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Toast, createToaster } from "@lenso/ui";
import { styles } from "../../en/toast/_shared";
const toaster = createToaster<ReactNode>();

function CustomLayout() {
  const manager = toaster;
  return (
    <>
      <Toast.Region toaster={manager} side="bottom">
        {(item) => (
          <Toast key={item.id} xstyle={styles.customRoot}>
            <Toast.Content>
              <div {...stylex.props(styles.customRow)}>
                <Toast.Indicator xstyle={styles.accent} />
                <div {...stylex.props(styles.customText)}>
                  {item.title && <Toast.Title xstyle={styles.accent} />}
                  {item.description && <Toast.Description />}
                </div>
              </div>
            </Toast.Content>
            <Toast.Close xstyle={styles.customClose} aria-label="Close notification">
              <CloseIcon {...stylex.props(styles.customCloseIcon)} />
            </Toast.Close>
          </Toast>
        )}
      </Toast.Region>
      <Button
        size="sm"
        variant="bordered"
        onClick={() =>
          manager({
            description: "使用自定义渲染函数",
            title: "自定义布局 Toast",
            type: "default",
          })
        }
      >
        自定义 Toast
      </Button>
    </>
  );
}
export function CustomToast() {
  return (
    <div {...stylex.props(styles.frame)}>
      <>
        <CustomLayout />
      </>
    </div>
  );
}
