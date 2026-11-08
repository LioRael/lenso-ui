"use client";

import { HardDrive, Persons } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles, type ToastData } from "./_shared";

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
            Solid toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id = manager.add({
                title: "You have been invited to join a team",
                description: "Bob sent you an invitation to join the team",
                type: "default",
                data: { indicator: <Persons />, actionStyle: "tertiary" },
                actionProps: { children: "Dismiss", onClick: () => manager.close(id) },
              });
            }}
          >
            Default toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id = manager.add({
                title: "You have 2 credits left",
                description: "Get a paid plan for more credits",
                type: "accent",
                actionProps: { children: "Upgrade", onClick: () => manager.close(id) },
              });
            }}
          >
            Accent toast
          </Button>
          <Button
            xstyle={styles.successText}
            size="sm"
            variant="bordered"
            onClick={() => {
              const id = manager.add({
                title: "You have upgraded your plan",
                description: "You can continue using the chat",
                type: "success",
                data: { actionStyle: "success" },
                actionProps: { children: "Billing", onClick: () => manager.close(id) },
              });
            }}
          >
            Success toast
          </Button>
          <Button
            xstyle={styles.warningText}
            size="sm"
            variant="bordered"
            onClick={() => {
              const id = manager.add({
                title: "You have no credits left",
                description: "Upgrade to a paid plan to continue",
                type: "warning",
                data: { actionStyle: "warning" },
                actionProps: { children: "Upgrade", onClick: () => manager.close(id) },
              });
            }}
          >
            Warning toast
          </Button>
          <Button
            destructive
            size="sm"
            variant="bordered"
            onClick={() => {
              const id = manager.add({
                title: "Storage is full",
                description:
                  "Remove files to release space. Adding more text to demonstrate longer content display",
                type: "danger",
                data: { indicator: <HardDrive />, actionStyle: "danger" },
                actionProps: { children: "Remove", onClick: () => manager.close(id) },
              });
            }}
          >
            Danger toast
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
