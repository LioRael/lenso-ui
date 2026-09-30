"use client";

// Adapted from HeroUI v3.2.6 promise, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "./_shared";

const uploadFile = (): Promise<{ filename: string; size: number }> =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ filename: "document.pdf", size: 1024 }), 2000);
  });
const createEvent = (): Promise<never> =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Network error. Please try again.")), 2000);
  });
const saveData = (): Promise<{ count: number }> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) resolve({ count: 42 });
      else reject(new Error("Failed to save data"));
    }, 2000);
  });
const fetchUser = (): Promise<{ name: string; email: string }> =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ email: "john@example.com", name: "John Doe" }), 2000);
  });

function Workflows() {
  const manager = Toast.useToastManager();
  return (
    <>
      <div {...stylex.props(styles.frame, styles.promise)}>
        <div {...stylex.props(styles.section)}>
          <div {...stylex.props(styles.center)}>
            <h3 {...stylex.props(styles.heading)}>Using toast.promise()</h3>
            <p {...stylex.props(styles.help)}>
              Automatically handles loading, success, and error states
            </p>
          </div>
          <div {...stylex.props(styles.buttons)}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(uploadFile(), {
                    error: { title: "Failed to upload file" },
                    loading: { title: "Uploading file..." },
                    success: (data) => ({
                      title: `File ${data.filename} uploaded (${data.size}KB)`,
                    }),
                  })
                  .catch(() => {});
              }}
            >
              Upload file
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(createEvent(), {
                    error: (error: Error) => ({ title: error.message }),
                    loading: { title: "Creating event..." },
                    success: { title: "Event created" },
                  })
                  .catch(() => {});
              }}
            >
              Create event (error)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(saveData(), {
                    error: (error: Error) => ({ title: error.message }),
                    loading: { title: "Saving changes..." },
                    success: (data) => ({ title: `Saved ${data.count} items` }),
                  })
                  .catch(() => {});
              }}
            >
              Save data (random)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void manager
                  .promise(fetchUser(), {
                    error: { title: "Failed to fetch user" },
                    loading: { title: "Loading user..." },
                    success: (data) => ({ title: `Welcome back, ${data.name}!` }),
                  })
                  .catch(() => {});
              }}
            >
              Fetch user
            </Button>
          </div>
        </div>
        <div {...stylex.props(styles.section)}>
          <div {...stylex.props(styles.center)}>
            <h3 {...stylex.props(styles.heading)}>Manual Loading State</h3>
            <p {...stylex.props(styles.help)}>Manually control loading state with isLoading prop</p>
          </div>
          <div {...stylex.props(styles.buttons)}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const id = manager.add({
                  title: "Uploading file...",
                  description: "Please wait while we upload your file",
                  type: "loading",
                  timeout: 0,
                });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "File uploaded",
                      description: "Your file has been uploaded successfully",
                      type: "success",
                      timeout: 5000,
                    }),
                  3000,
                );
              }}
            >
              Upload with loading
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
                      description: "Your payment has been processed successfully",
                      type: "success",
                      timeout: 5000,
                    }),
                  2500,
                );
              }}
            >
              Payment processing
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const id = manager.add({ title: "Saving changes...", type: "loading", timeout: 0 });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "Failed to save",
                      description: "Please try again",
                      type: "danger",
                      timeout: 5000,
                    }),
                  2000,
                );
              }}
            >
              Loading to error
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
