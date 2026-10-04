// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 custom-styles, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { styles } from "../../en/toast/_shared";
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
          manager.add({
            description: "草稿已同步",
            title: "已保存",
            type: "default",
          })
        }
      >
        显示提示
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
