"use client";

// Adapted from HeroUI v3.2.6 custom-styles, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { styles } from "./_shared";

function StyledNotifications() {
  const manager = Toast.useToastManager();
  return (
    <>
      <Toast.Portal>
        <Toast.Viewport placement="bottom">
          {manager.toasts.map((item) => (
            <Toast key={item.id} toast={item} xstyle={styles.styledRoot}>
              <Toast.Content>
                <div {...stylex.props(styles.styledRow)}>
                  <Toast.Indicator xstyle={styles.neutral} />
                  <div {...stylex.props(styles.styledText)}>
                    {item.title && <Toast.Title xstyle={styles.styledTitle} />}
                    {item.description && <Toast.Description xstyle={styles.styledDescription} />}
                  </div>
                </div>
              </Toast.Content>
            </Toast>
          ))}
        </Toast.Viewport>
      </Toast.Portal>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          manager.add({ description: "Draft synced", title: "Saved", type: "default" })
        }
      >
        Show toast
      </Button>
    </>
  );
}

export function CustomStyles() {
  return (
    <div {...stylex.props(styles.customFrame)}>
      <Toast.Provider>
        <StyledNotifications />
      </Toast.Provider>
    </div>
  );
}
