// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 custom-queue, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "../../en/toast/_shared";
export function CustomQueue() {
  const [notificationQueue] = useState(() => Toast.createToastManager());
  const [errorQueue] = useState(() => Toast.createToastManager());
  const [successQueue] = useState(() => Toast.createToastManager());
  return (
    <div {...stylex.props(styles.queues)}>
      <Toast.Provider toastManager={notificationQueue} limit={2}>
        <Notifications placement="bottom" />
      </Toast.Provider>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            notificationQueue.add({
              description: "您有一条新消息",
              title: "新通知",
              type: "default",
            })
          }
        >
          添加通知（最多 2 条）
        </Button>
      </div>
      <Toast.Provider toastManager={errorQueue} limit={3}>
        <Notifications placement="bottom-start" />
      </Toast.Provider>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          size="sm"
          variant="danger-soft"
          onClick={() =>
            errorQueue.add({
              description: "保存更改失败",
              title: "发生错误",
              type: "danger",
            })
          }
        >
          添加错误（最多 3 条）
        </Button>
      </div>
      <Toast.Provider toastManager={successQueue} limit={1}>
        <Notifications placement="bottom-end" />
      </Toast.Provider>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          xstyle={styles.successText}
          size="sm"
          variant="secondary"
          onClick={() =>
            successQueue.add({
              description: `操作 ${Date.now()}`,
              title: "成功！",
              type: "success",
            })
          }
        >
          添加成功（最多 1 条）
        </Button>
      </div>
    </div>
  );
}
