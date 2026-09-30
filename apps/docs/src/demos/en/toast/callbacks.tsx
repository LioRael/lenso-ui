"use client";

// Adapted from HeroUI v3.2.6 callbacks, Apache-2.0.
import { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "./_shared";

function History() {
  const manager = Toast.useToastManager();
  const [closedHistory, setClosedHistory] = useState<
    Array<{ id: number; message: string; time: string }>
  >([]);
  const nextId = useRef(0);
  const addToHistory = (message: string) => {
    const time = new Date().toLocaleTimeString();
    const id = nextId.current++;
    setClosedHistory((previous) => [{ id, message, time }, ...previous].slice(0, 5));
  };
  return (
    <>
      <div {...stylex.props(styles.frame, styles.large)}>
        <div {...stylex.props(styles.buttons)}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "File saved",
                onClose: () => addToHistory("File saved (closed after 3 seconds)"),
                timeout: 3000,
              })
            }
          >
            Custom timeout (3s)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "Changes saved",
                onClose: () => addToHistory("Changes saved (closed after 10 seconds)"),
                timeout: 10000,
              })
            }
          >
            Custom timeout (10s)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "Event created",
                type: "success",
                onClose: () => addToHistory("Event created (closed after default timeout)"),
              })
            }
          >
            With onClose callback
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "Important notification",
                description: "This toast will stay until dismissed",
                onClose: () => addToHistory("Important notification (manually closed)"),
                timeout: 0,
              })
            }
          >
            Persistent toast
          </Button>
        </div>
        <div {...stylex.props(styles.history)}>
          <div {...stylex.props(styles.historyHeading)}>
            <h3 {...stylex.props(styles.heading)}>Closed History</h3>
            {closedHistory.length > 0 && (
              <Button
                xstyle={styles.clear}
                size="sm"
                variant="tertiary"
                onClick={() => setClosedHistory([])}
              >
                Clear
              </Button>
            )}
          </div>
          <div {...stylex.props(styles.historyPanel)}>
            {closedHistory.length === 0 ? (
              <p {...stylex.props(styles.empty)}>No toasts closed yet. Try closing one above!</p>
            ) : (
              closedHistory.map((item, index) => (
                <div
                  key={item.id}
                  {...stylex.props(styles.historyItem, styles.historyDelay(index * 50))}
                >
                  <div {...stylex.props(styles.historyText)}>
                    <span {...stylex.props(styles.medium)}>{item.message}</span>
                    <span {...stylex.props(styles.time)}>({item.time})</span>
                  </div>
                  <div {...stylex.props(styles.check)}>
                    <svg
                      {...stylex.props(styles.checkIcon)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Notifications />
    </>
  );
}

export function Callbacks() {
  return (
    <Toast.Provider>
      <History />
    </Toast.Provider>
  );
}
