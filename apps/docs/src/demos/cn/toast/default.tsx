"use client";

import { Persons } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles, type ToastData } from "../../en/toast/_shared";
function InvitationQueue() {
  const manager = Toast.useToastManager<ToastData>();
  return (
    <>
      <div {...stylex.props(styles.frame)}>
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
          显示 Toast
        </Button>
      </div>
      <Notifications />
    </>
  );
}
export function Default() {
  return (
    <Toast.Provider>
      <InvitationQueue />
    </Toast.Provider>
  );
}
