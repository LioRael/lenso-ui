"use client";
import type { ReactNode } from "react";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import { Notifications, styles } from "../../en/toast/_shared";
const toaster = createToaster<ReactNode>();

function History() {
  const manager = toaster;
  const [closedHistory, setClosedHistory] = useState<
    Array<{
      id: number;
      message: string;
      time: string;
    }>
  >([]);
  const nextId = useRef(0);
  const addToHistory = (message: string) => {
    const time = new Date().toLocaleTimeString();
    const id = nextId.current++;
    setClosedHistory((previous) =>
      [
        {
          id,
          message,
          time,
        },
        ...previous,
      ].slice(0, 5),
    );
  };
  return (
    <>
      <div {...stylex.props(styles.frame, styles.large)}>
        <div {...stylex.props(styles.buttons)}>
          <Button
            size="sm"
            variant="bordered"
            onClick={() =>
              manager({
                title: "File saved",
                onDismiss: () => addToHistory("File saved (closed after 3 seconds)"),
                duration: 3000,
              })
            }
          >
            自定义超时（3 秒）
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() =>
              manager({
                title: "Changes saved",
                onDismiss: () => addToHistory("Changes saved (closed after 10 seconds)"),
                duration: 10000,
              })
            }
          >
            自定义超时（10 秒）
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() =>
              manager({
                title: "Event created",
                type: "success",
                onDismiss: () => addToHistory("Event created (closed after default timeout)"),
              })
            }
          >
            使用 onClose 回调
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() =>
              manager({
                title: "Important notification",
                description: "此 Toast 将保持显示直至关闭",
                onDismiss: () => addToHistory("Important notification (manually closed)"),
                duration: Infinity,
              })
            }
          >
            持久显示 Toast
          </Button>
        </div>
        <div {...stylex.props(styles.history)}>
          <div {...stylex.props(styles.historyHeading)}>
            <h3 {...stylex.props(styles.heading)}>关闭历史</h3>
            {closedHistory.length > 0 && (
              <Button
                xstyle={styles.clear}
                size="sm"
                variant="bordered"
                onClick={() => setClosedHistory([])}
              >
                清空
              </Button>
            )}
          </div>
          <div {...stylex.props(styles.historyPanel)}>
            {closedHistory.length === 0 ? (
              <p {...stylex.props(styles.empty)}>尚无已关闭的 Toast。请尝试关闭上方的 Toast！</p>
            ) : (
              closedHistory.map((item, index) => (
                <div
                  key={item.id}
                  {...stylex.props(styles.historyItem, styles.historyDelay(index * 50))}
                >
                  <div {...stylex.props(styles.historyText)}>
                    <span {...stylex.props(styles.medium)}>{item.message}</span>
                    <span {...stylex.props(styles.time)}>({item.time})</span>
                  </div>
                  <div {...stylex.props(styles.check)}>
                    <svg
                      {...stylex.props(styles.checkIcon)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Notifications toaster={toaster} />
    </>
  );
}
export function Callbacks() {
  return (
    <>
      <History />
    </>
  );
}
