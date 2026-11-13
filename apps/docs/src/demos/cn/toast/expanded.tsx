"use client";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "../../en/toast/_shared";
const queue = createToaster();

export function Expanded() {
  return (
    <div {...stylex.props(styles.frame)}>
      <>
        <Notifications expanded aria-label="展开的通知" toaster={queue} />
      </>
      <Button
        size="sm"
        variant="bordered"
        onClick={() => {
          queue({
            title: "简单消息",
            type: "default",
          });
          setTimeout(
            () =>
              queue({
                title: "操作已完成",
                type: "success",
              }),
            400,
          );
          setTimeout(
            () =>
              queue({
                title: "有新更新可用",
                type: "info",
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
