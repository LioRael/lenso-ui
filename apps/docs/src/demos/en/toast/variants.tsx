"use client";
import type { ReactNode } from "react";

import { HardDrive, Persons } from "@gravity-ui/icons";
import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "./_shared";

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
            Solid toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id: string = manager({
                title: "You have been invited to join a team",
                description: "Bob sent you an invitation to join the team",
                type: "default",
                data: { indicator: <Persons />, actionStyle: "tertiary" },
                action: { label: "Dismiss", onAction: () => manager.dismiss(id) },
              });
            }}
          >
            Default toast
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              const id: string = manager({
                title: "You have 2 credits left",
                description: "Get a paid plan for more credits",
                type: "info",
                action: { label: "Upgrade", onAction: () => manager.dismiss(id) },
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
              const id: string = manager({
                title: "You have upgraded your plan",
                description: "You can continue using the chat",
                type: "success",
                data: { actionStyle: "success" },
                action: { label: "Billing", onAction: () => manager.dismiss(id) },
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
              const id: string = manager({
                title: "You have no credits left",
                description: "Upgrade to a paid plan to continue",
                type: "warning",
                data: { actionStyle: "warning" },
                action: { label: "Upgrade", onAction: () => manager.dismiss(id) },
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
              const id: string = manager({
                title: "Storage is full",
                description:
                  "Remove files to release space. Adding more text to demonstrate longer content display",
                type: "error",
                data: { indicator: <HardDrive />, actionStyle: "danger" },
                action: { label: "Remove", onAction: () => manager.dismiss(id) },
              });
            }}
          >
            Danger toast
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
