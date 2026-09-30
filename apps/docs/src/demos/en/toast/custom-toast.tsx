"use client";

// Adapted from HeroUI v3.2.6 custom-toast, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Toast } from "@lenso/ui";
import { styles } from "./_shared";

function CustomLayout() {
  const manager = Toast.useToastManager();
  return (
    <>
      <Toast.Portal>
        <Toast.Viewport placement="bottom">
          {manager.toasts.map((item) => (
            <Toast key={item.id} toast={item} xstyle={styles.customRoot}>
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
          ))}
        </Toast.Viewport>
      </Toast.Portal>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          manager.add({
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
      <Toast.Provider>
        <CustomLayout />
      </Toast.Provider>
    </div>
  );
}
