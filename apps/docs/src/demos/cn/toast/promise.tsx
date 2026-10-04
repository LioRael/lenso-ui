// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 promise, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "../../en/toast/_shared";
const uploadFile = (): Promise<{
  filename: string;
  size: number;
}> =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          filename: "document.pdf",
          size: 1024,
        }),
      2000,
    );
  });
const createEvent = (): Promise<never> =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Network error. Please try again.")), 2000);
  });
const saveData = (): Promise<{
  count: number;
}> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5)
        resolve({
          count: 42,
        });
      else reject(new Error("Failed to save data"));
    }, 2000);
  });
const fetchUser = (): Promise<{
  name: string;
  email: string;
}> =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          email: "john@example.com",
          name: "John Doe",
        }),
      2000,
    );
  });
function Workflows() {
  const manager = Toast.useToastManager();
  return (
    <>
      <div {...stylex.props(styles.frame, styles.promise)}>
        <div {...stylex.props(styles.section)}>
          <div {...stylex.props(styles.center)}>
            <h3 {...stylex.props(styles.heading)}>使用 toast.promise()</h3>
            <p {...stylex.props(styles.help)}>自动处理加载、成功和错误状态</p>
          </div>
          <div {...stylex.props(styles.buttons)}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(uploadFile(), {
                    error: {
                      title: "Failed to upload file",
                    },
                    loading: {
                      title: "Uploading file...",
                    },
                    success: (data) => ({
                      title: `File ${data.filename} uploaded (${data.size}KB)`,
                    }),
                  })
                  .catch(() => {});
              }}
            >
              上传文件
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(createEvent(), {
                    error: (error: Error) => ({
                      title: error.message,
                    }),
                    loading: {
                      title: "Creating event...",
                    },
                    success: {
                      title: "Event created",
                    },
                  })
                  .catch(() => {});
              }}
            >
              创建活动（错误）
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(saveData(), {
                    error: (error: Error) => ({
                      title: error.message,
                    }),
                    loading: {
                      title: "Saving changes...",
                    },
                    success: (data) => ({
                      title: `Saved ${data.count} items`,
                    }),
                  })
                  .catch(() => {});
              }}
            >
              保存数据（随机）
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(fetchUser(), {
                    error: {
                      title: "Failed to fetch user",
                    },
                    loading: {
                      title: "Loading user...",
                    },
                    success: (data) => ({
                      title: `Welcome back, ${data.name}!`,
                    }),
                  })
                  .catch(() => {});
              }}
            >
              获取用户
            </Button>
          </div>
        </div>
        <div {...stylex.props(styles.section)}>
          <div {...stylex.props(styles.center)}>
            <h3 {...stylex.props(styles.heading)}>手动加载状态</h3>
            <p {...stylex.props(styles.help)}>使用 isLoading 属性手动控制加载状态</p>
          </div>
          <div {...stylex.props(styles.buttons)}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const id = manager.add({
                  title: "Uploading file...",
                  description: "请稍候，正在上传您的文件",
                  type: "loading",
                  timeout: 0,
                });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "File uploaded",
                      description: "您的文件已成功上传",
                      type: "success",
                      timeout: 5000,
                    }),
                  3000,
                );
              }}
            >
              上传（含加载）
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const id = manager.add({
                  title: "Processing payment...",
                  type: "loading",
                  timeout: 0,
                });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "Payment processed",
                      description: "您的付款已成功处理",
                      type: "success",
                      timeout: 5000,
                    }),
                  2500,
                );
              }}
            >
              付款处理
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const id = manager.add({
                  title: "Saving changes...",
                  type: "loading",
                  timeout: 0,
                });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "Failed to save",
                      description: "请重试",
                      type: "danger",
                      timeout: 5000,
                    }),
                  2000,
                );
              }}
            >
              加载后显示错误
            </Button>
          </div>
        </div>
      </div>
      <Notifications />
    </>
  );
}
export function PromiseDemo() {
  return (
    <Toast.Provider>
      <Workflows />
    </Toast.Provider>
  );
}
