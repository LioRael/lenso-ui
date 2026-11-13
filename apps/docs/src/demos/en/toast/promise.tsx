"use client";
import type { ReactNode } from "react";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
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

const toaster = createToaster<ReactNode>();

function Workflows() {
  const manager = toaster;
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
              variant="bordered"
              onClick={() => {
                void manager.promise(uploadFile(), {
                  error: { title: "Failed to upload file" },
                  loading: { title: "Uploading file..." },
                  success: (data) => ({
                    title: `File ${data.filename} uploaded (${data.size}KB)`,
                  }),
                });
              }}
            >
              Upload file
            </Button>
            <Button
              size="sm"
              variant="bordered"
              onClick={() => {
                void manager.promise(createEvent(), {
                  error: (error: unknown) => ({
                    title: error instanceof Error ? error.message : String(error),
                  }),
                  loading: { title: "Creating event..." },
                  success: { title: "Event created" },
                });
              }}
            >
              Create event (error)
            </Button>
            <Button
              size="sm"
              variant="bordered"
              onClick={() => {
                void manager.promise(saveData(), {
                  error: (error: unknown) => ({
                    title: error instanceof Error ? error.message : String(error),
                  }),
                  loading: { title: "Saving changes..." },
                  success: (data) => ({ title: `Saved ${data.count} items` }),
                });
              }}
            >
              Save data (random)
            </Button>
            <Button
              size="sm"
              variant="bordered"
              onClick={() => {
                void manager.promise(fetchUser(), {
                  error: { title: "Failed to fetch user" },
                  loading: { title: "Loading user..." },
                  success: (data) => ({ title: `Welcome back, ${data.name}!` }),
                });
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
              variant="bordered"
              onClick={() => {
                const id: string = manager({
                  title: "Uploading file...",
                  description: "Please wait while we upload your file",
                  type: "loading",
                  duration: Infinity,
                });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "File uploaded",
                      description: "Your file has been uploaded successfully",
                      type: "success",
                      duration: 5000,
                    }),
                  3000,
                );
              }}
            >
              Upload with loading
            </Button>
            <Button
              size="sm"
              variant="bordered"
              onClick={() => {
                const id: string = manager({
                  title: "Processing payment...",
                  type: "loading",
                  duration: Infinity,
                });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "Payment processed",
                      description: "Your payment has been processed successfully",
                      type: "success",
                      duration: 5000,
                    }),
                  2500,
                );
              }}
            >
              Payment processing
            </Button>
            <Button
              size="sm"
              variant="bordered"
              onClick={() => {
                const id: string = manager({
                  title: "Saving changes...",
                  type: "loading",
                  duration: Infinity,
                });
                setTimeout(
                  () =>
                    manager.update(id, {
                      title: "Failed to save",
                      description: "Please try again",
                      type: "error",
                      duration: 5000,
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
      <Notifications toaster={toaster} />
    </>
  );
}

export function PromiseDemo() {
  return (
    <>
      <Workflows />
    </>
  );
}
