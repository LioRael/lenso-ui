// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 toast-default (Apache-2.0).
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
          variant="secondary"
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
