"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Toast } from "@lenso/ui";
import { styles } from "../../en/toast/_shared";
function CustomLayout() {
  const manager = Toast.useToastManager();
  return (
    <>
      <Toast.Portal>
        <Toast.Viewport placement="bottom">
          {manager.toasts.map((item) => (
            <Toast key={item.id} toast={item} xstyle={styles.customRoot}>
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
          ))}
        </Toast.Viewport>
      </Toast.Portal>
      <Button
        size="sm"
        variant="bordered"
        onClick={() =>
          manager.add({
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
      <Toast.Provider>
        <CustomLayout />
      </Toast.Provider>
    </div>
  );
}
