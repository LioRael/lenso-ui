"use client";
import { useState } from "react";
import type { ComponentProps } from "react";
import { Toast, Button, createToaster } from "@lenso/ui";
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
  const [manager] = useState(() => createToaster());
  return (
    <>
      <Button
        onClick={() =>
          manager({
            title: args.title,
            description: args.description,
            data: { variant: args.variant },
          })
        }
      >
        Show toast
      </Button>
      <Notifications toaster={manager} />
    </>
  );
}
export function Preview(overrides: ToastStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <>
      <Notification {...args} />
    </>
  );
}
