"use client";
import type { ReactNode } from "react";

import { HardDrive, Persons } from "@gravity-ui/icons";
import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "../../en/toast/_shared";
const toaster = createToaster<ReactNode>();

function Messages() {
  const manager = toaster;
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <div {...stylex.props(styles.buttons)}>
          <Button
            size="sm"

            onClick={() => manager({ title: "Solid notification", data: { variant: "default" } })}
          >
            纯色 Toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id: string = manager({
                title: "You have been invited to join a team",
                description: "Bob 邀请您加入 团队",
                type: "default",
                data: {
                  indicator: <Persons />,
                  actionStyle: "tertiary",
                },
                action: { label: "忽略", onAction: () => manager.dismiss(id) },
              });
            }}
          >
            默认 Toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id: string = manager({
                title: "You have 2 credits left",
                description: "升级付费方案以获取更多积分",
                type: "info",
                action: { label: "升级", onAction: () => manager.dismiss(id) },
              });
            }}
          >
            强调 Toast
          </Button>
          <Button
            xstyle={styles.successText}
            size="sm"
            variant="bordered"
            onClick={() => {
              const id: string = manager({
                title: "You have upgraded your plan",
                description: "您可以继续使用聊天功能",
                type: "success",
                data: {
                  actionStyle: "success",
                },
                action: { label: "账单", onAction: () => manager.dismiss(id) },
              });
            }}
          >
            成功 Toast
          </Button>
          <Button
            xstyle={styles.warningText}
            size="sm"
            variant="bordered"
            onClick={() => {
              const id: string = manager({
                title: "You have no credits left",
                description: "升级付费方案以继续使用",
                type: "warning",
                data: {
                  actionStyle: "warning",
                },
                action: { label: "升级", onAction: () => manager.dismiss(id) },
              });
            }}
          >
            警告 Toast
          </Button>
          <Button
            destructive
            size="sm"
            variant="bordered"
            onClick={() => {
              const id: string = manager({
                title: "Storage is full",
                description: "删除文件以释放空间。此处增加更多文字以演示较长内容的显示效果",
                type: "error",
                data: {
                  indicator: <HardDrive />,
                  actionStyle: "danger",
                },
                action: { label: "删除", onAction: () => manager.dismiss(id) },
              });
            }}
          >
            危险 Toast
          </Button>
        </div>
      </div>
      <Notifications toaster={toaster} />
    </>
  );
}
export function Variants() {
  return (
    <>
      <Messages />
    </>
  );
}
