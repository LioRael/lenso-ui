"use client";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Notifications, styles } from "../../en/toast/_shared";

export function CustomQueue() {
  const [notificationQueue] = useState(() => createToaster());
  const [errorQueue] = useState(() => createToaster());
  const [successQueue] = useState(() => createToaster());
  return (
    <div {...stylex.props(styles.queues)}>
      <>
        <Notifications side="bottom" align="center" toaster={notificationQueue} maxVisible={2} />
      </>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          size="sm"
          variant="bordered"
          onClick={() =>
            notificationQueue({
              description: "您有一条新消息",
              title: "新通知",
              type: "default",
            })
          }
        >
          添加通知（最多 2 条）
        </Button>
      </div>
      <>
        <Notifications side="bottom" align="start" toaster={errorQueue} maxVisible={3} />
      </>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          destructive
          size="sm"
          variant="bordered"
          onClick={() =>
            errorQueue({
              description: "保存更改失败",
              title: "发生错误",
              type: "error",
            })
          }
        >
          添加错误（最多 3 条）
        </Button>
      </div>
      <>
        <Notifications side="bottom" align="end" toaster={successQueue} maxVisible={1} />
      </>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          xstyle={styles.successText}
          size="sm"
          variant="bordered"
          onClick={() =>
            successQueue({
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
