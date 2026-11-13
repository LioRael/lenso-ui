"use client";
import type { ReactNode } from "react";

import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Toast, createToaster } from "@lenso/ui";
import { styles } from "./_shared";

const toaster = createToaster<ReactNode>();

function CustomLayout() {
  const manager = toaster;
  return (
    <>
      <Toast.Region toaster={manager} side="bottom">
        {(item) => (
          <Toast key={item.id} xstyle={styles.customRoot}>
            <Toast.Content>
              <div {...stylex.props(styles.customRow)}>
                <Toast.Indicator xstyle={styles.accent} />
                <div {...stylex.props(styles.customText)}>
                  {item.title && <Toast.Title xstyle={styles.accent} />}
                  {item.description && <Toast.Description />}
                </div>
              </div>
            </Toast.Content>
            <Toast.Close xstyle={styles.customClose} aria-label="Close notification">
              <CloseIcon {...stylex.props(styles.customCloseIcon)} />
            </Toast.Close>
          </Toast>
        )}
      </Toast.Region>
      <Button
        size="sm"
        variant="bordered"
        onClick={() =>
          manager({
            description: "This uses a custom render function",
            title: "Custom layout toast",
            type: "default",
          })
        }
      >
        Custom toast
      </Button>
    </>
  );
}

export function CustomToast() {
  return (
    <div {...stylex.props(styles.frame)}>
      <>
        <CustomLayout />
      </>
    </div>
  );
}
