// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 variants, Apache-2.0.
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
            variant="tertiary"
            onClick={() => {
              const id = manager.add({
                title: "You have been invited to join a team",
                description: "Bob 邀请您加入 HeroUI 团队",
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
            variant="secondary"
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
            variant="tertiary"
            onClick={() => {
              const id = manager.add({
                title: "You have upgraded your plan",
                description: "您可以继续使用 HeroUI Chat",
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
            variant="tertiary"
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
            size="sm"
            variant="danger-soft"
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
