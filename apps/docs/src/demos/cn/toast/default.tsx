// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 toast-default (Apache-2.0).
import { Persons } from "@gravity-ui/icons";
import { Button, Toast } from "@lenso/ui";
function InvitationQueue() {
  const manager = Toast.useToastManager();
  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          manager.add({
            title: "You have been invited to join a team",
            description: "Bob 邀请您加入 HeroUI 团队",
          })
        }
      >
        显示 Toast
      </Button>
      <Toast.Portal>
        <Toast.Viewport>
          {manager.toasts.map((toast) => (
            <Toast key={toast.id} toast={toast}>
              <Toast.Content>
                <Toast.Indicator>
                  <Persons />
                </Toast.Indicator>
                <Toast.Title />
                <Toast.Description />
                <Toast.Action onClick={() => manager.close(toast.id)}>忽略</Toast.Action>
                <Toast.Close aria-label="Close notification" />
              </Toast.Content>
            </Toast>
          ))}
        </Toast.Viewport>
      </Toast.Portal>
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
