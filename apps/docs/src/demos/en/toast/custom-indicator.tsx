"use client";
import type { ReactNode } from "react";

import { Star } from "@gravity-ui/icons";
import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "./_shared";

const toaster = createToaster<ReactNode>();

function Message() {
  const manager = toaster;
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <Button
          size="sm"
          variant="bordered"
          onClick={() => manager({ title: "Custom icon indicator", data: { indicator: <Star /> } })}
        >
          Custom indicator
        </Button>
      </div>
      <Notifications toaster={toaster} />
    </>
  );
}

export function CustomIndicator() {
  return (
    <>
      <Message />
    </>
  );
}
