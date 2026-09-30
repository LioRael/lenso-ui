"use client";

// Adapted from HeroUI v3.2.6 toast-default (Apache-2.0).
import { Persons } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles, type ToastData } from "./_shared";

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
              description: "Bob sent you an invitation to join HeroUI team",
              type: "default",
              data: { indicator: <Persons />, actionStyle: "tertiary" },
              actionProps: { children: "Dismiss", onClick: () => manager.close(id) },
            });
          }}
        >
          Show toast
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
