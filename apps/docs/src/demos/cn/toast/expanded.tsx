"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "../../en/toast/_shared";
const queue = Toast.createToastManager();
export function Expanded() {
  return (
    <div {...stylex.props(styles.frame)}>
      <Toast.Provider toastManager={queue}>
        <Notifications expanded aria-label="展开的通知" />
      </Toast.Provider>
      <Button
        size="sm"
        variant="bordered"
        onClick={() => {
          queue.add({
            title: "简单消息",
            type: "default",
          });
          setTimeout(
            () =>
              queue.add({
                title: "操作已完成",
                type: "success",
              }),
            400,
          );
          setTimeout(
            () =>
              queue.add({
                title: "有新更新可用",
                type: "accent",
              }),
            800,
          );
        }}
      >
        显示 3 条 Toast
      </Button>
    </div>
  );
}
