"use client";
import type { ReactNode } from "react";

import { Persons } from "@gravity-ui/icons";
import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "../../en/toast/_shared";
const toaster = createToaster<ReactNode>();

function InvitationQueue() {
  const manager = toaster;
  return (
    <>
      <div {...stylex.props(styles.frame)}>
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
          显示 Toast
        </Button>
      </div>
      <Notifications toaster={toaster} />
    </>
  );
}
export function Default() {
  return (
    <>
      <InvitationQueue />
    </>
  );
}
