"use client";
import type { ComponentProps } from "react";
import { Toast, Button } from "@lenso/ui";
import { Notifications } from "../en/toast/_shared";
export interface ToastStoryProps extends Pick<ComponentProps<typeof Toast.Root>, "variant"> {
  title: string;
  description: string;
}
export const initialArgs: ToastStoryProps = /* story-args:start */ {
  variant: "glass",
  title: "Changes saved",
  description: "Your changes are ready.",
}; /* story-args:end */
function Notification(args: ToastStoryProps) {
  const manager = Toast.useToastManager();
  return (
    <>
      <Button
        onClick={() =>
          manager.add({
            title: args.title,
            description: args.description,
            data: { variant: args.variant },
          })
        }
      >
        Show toast
      </Button>
      <Notifications />
    </>
  );
}
export function Preview(overrides: ToastStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Toast.Provider>
      <Notification {...args} />
    </Toast.Provider>
  );
}
