"use client";

import { HardDrive, Persons } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles, type ToastData } from "../../en/toast/_shared";
function Messages() {
  const manager = Toast.useToastManager<ToastData>();
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <div {...stylex.props(styles.buttons)}>
          <Button
            size="sm"

            onClick={() =>
              manager.add({ title: "Solid notification", data: { variant: "default" } })
            }
          >
            纯色 Toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id = manager.add({
                title: "You have been invited to join a team",
                description: "Bob 邀请您加入 团队",
                type: "default",
                data: {
                  indicator: <Persons />,
                  actionStyle: "tertiary",
                },
                actionProps: {
                  children: "忽略",
                  onClick: () => manager.close(id),
                },
              });
            }}
          >
            默认 Toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id = manager.add({
                title: "You have 2 credits left",
                description: "升级付费方案以获取更多积分",
                type: "accent",
                actionProps: {
                  children: "升级",
                  onClick: () => manager.close(id),
                },
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
              const id = manager.add({
                title: "You have upgraded your plan",
                description: "您可以继续使用聊天功能",
                type: "success",
                data: {
                  actionStyle: "success",
                },
                actionProps: {
                  children: "账单",
                  onClick: () => manager.close(id),
                },
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
              const id = manager.add({
                title: "You have no credits left",
                description: "升级付费方案以继续使用",
                type: "warning",
                data: {
                  actionStyle: "warning",
                },
                actionProps: {
                  children: "升级",
                  onClick: () => manager.close(id),
                },
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
              const id = manager.add({
                title: "Storage is full",
                description: "删除文件以释放空间。此处增加更多文字以演示较长内容的显示效果",
                type: "danger",
                data: {
                  indicator: <HardDrive />,
                  actionStyle: "danger",
                },
                actionProps: {
                  children: "删除",
                  onClick: () => manager.close(id),
                },
              });
            }}
          >
            危险 Toast
          </Button>
        </div>
      </div>
      <Notifications />
    </>
  );
}
export function Variants() {
  return (
    <Toast.Provider>
      <Messages />
    </Toast.Provider>
  );
}
