// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Modal, Toast } from "@lenso/ui";
import { useState, type ComponentProps, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { menuToast as s } from "./menu-toast.stylex";
import { MenuToastIcon } from "./menu-toast-icons.fixtures";

type NativePlacement = NonNullable<ComponentProps<typeof Toast.Viewport>["placement"]>;
type Placement = "top start" | "top" | "top end" | "bottom start" | "bottom" | "bottom end";
type ToastStoryProps = { placement: Placement; timeout?: number };
const meta = {
  argTypes: {
    placement: {
      control: "radio",
      options: ["top start", "top", "top end", "bottom start", "bottom", "bottom end"],
    },
    timeout: { control: "number" },
  },
  args: { placement: "bottom", timeout: undefined },
  parameters: { layout: "centered" },
  title: "Components/Feedback/Toast",
} satisfies Meta<ToastStoryProps>;
export default meta;
type Story = StoryObj<ToastStoryProps>;
type Data = {
  indicator?: ReactNode;
  actionTone?: "success" | "warning";
  actionVariant?: "tertiary" | "danger";
};
type Manager = ReturnType<typeof Toast.createToastManager<Data>>;
type ToastItem = ReturnType<typeof Toast.useToastManager<Data>>["toasts"][number];
function Action({ item, mobile = false }: { item: ToastItem; mobile?: boolean }) {
  return (
    <Toast.Action
      {...item.actionProps}
      render={
        <Button
          variant={item.data?.actionVariant ?? "primary"}
          xstyle={[
            mobile ? s.mobileAction : s.desktopAction,
            item.data?.actionTone === "success"
              ? s.successAction
              : item.data?.actionTone === "warning"
                ? s.warningAction
                : undefined,
          ]}
        />
      }
    />
  );
}
function Stack({
  placement,
  expanded = false,
  custom = false,
}: {
  placement: Placement;
  expanded?: boolean;
  custom?: boolean;
}) {
  const { toasts } = Toast.useToastManager<Data>();
  return (
    <Toast.Portal>
      <Toast.Viewport
        placement={placement.replace(" ", "-") as NativePlacement}
        alwaysExpanded={expanded}
        xstyle={s.toastViewport}
        aria-label={expanded ? "Expanded notifications" : "Notifications"}
      >
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} xstyle={custom && s.customToast}>
            {!custom && <Toast.Indicator>{item.data?.indicator}</Toast.Indicator>}
            <Toast.Content>
              {custom ? (
                <div {...stylex.props(s.row)}>
                  <Toast.Indicator xstyle={s.accent}>{item.data?.indicator}</Toast.Indicator>
                  <div {...stylex.props(s.customText)}>
                    {item.title && <Toast.Title xstyle={s.accent}>{item.title}</Toast.Title>}
                    {item.description && <Toast.Description>{item.description}</Toast.Description>}
                  </div>
                </div>
              ) : (
                <>
                  {item.title && <Toast.Title>{item.title}</Toast.Title>}
                  {item.description && <Toast.Description>{item.description}</Toast.Description>}
                  {item.actionProps && <Action item={item} mobile />}
                </>
              )}
            </Toast.Content>
            {!custom && item.actionProps && <Action item={item} />}
            <Toast.Close aria-label="Close notification" xstyle={custom && s.customClose}>
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="m4 4 8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Toast.Close>
          </Toast>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
function Provider({
  children,
  manager,
  placement,
  timeout = 4000,
  limit,
  expanded,
  custom,
}: ToastStoryProps & {
  children?: ReactNode;
  manager?: Manager;
  limit?: number;
  expanded?: boolean;
  custom?: boolean;
}) {
  return (
    <Toast.Provider toastManager={manager} timeout={timeout} limit={limit}>
      <Stack placement={placement} expanded={expanded} custom={custom} />
      {children}
    </Toast.Provider>
  );
}
function DefaultButtons() {
  const manager = Toast.useToastManager<Data>();
  function invitation() {
    const id = manager.add({
      title: "You have been invited to join a team",
      description: "Bob sent you an invitation to join HeroUI team",
      type: "default",
      data: {
        indicator: <MenuToastIcon name="persons" muted={false} />,
        actionVariant: "tertiary",
      },
      actionProps: { children: "Dismiss", onClick: () => manager.close(id) },
    });
  }
  function credits() {
    const id = manager.add({
      title: "You have 2 credits left",
      description: "Get a paid plan for more credits",
      type: "accent",
      actionProps: { children: "Upgrade", onClick: () => manager.close(id) },
    });
  }
  function success() {
    const id = manager.add({
      title: "You have upgraded your plan",
      description: "You can continue using HeroUI Chat",
      type: "success",
      data: { actionTone: "success" },
      actionProps: { children: "Billing", onClick: () => manager.close(id) },
    });
  }
  function warning() {
    const id = manager.add({
      title: "You have no credits left",
      description: "Upgrade to a paid plan to continue",
      type: "warning",
      data: { actionTone: "warning" },
      actionProps: { children: "Upgrade", onClick: () => manager.close(id) },
    });
  }
  function danger() {
    const id = manager.add({
      title: "Storage is full",
      description:
        "Remove files to release space. Adding more text to demonstrate longer content display",
      type: "danger",
      data: {
        indicator: <MenuToastIcon name="hard-drive" muted={false} />,
        actionVariant: "danger",
      },
      actionProps: { children: "Remove", onClick: () => manager.close(id) },
    });
  }
  return (
    <div {...stylex.props(s.buttons)}>
      <Button size="sm" variant="tertiary" xstyle={s.muted} onClick={invitation}>
        Default toast
      </Button>
      <Button size="sm" variant="secondary" onClick={credits}>
        Accent toast
      </Button>
      <Button size="sm" variant="tertiary" xstyle={s.success} onClick={success}>
        Success toast
      </Button>
      <Button size="sm" variant="tertiary" xstyle={s.warning} onClick={warning}>
        Warning toast
      </Button>
      <Button size="sm" variant="danger-soft" onClick={danger}>
        Danger toast
      </Button>
    </div>
  );
}
export const Default: Story = {
  args: {},
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args}>
        <DefaultButtons />
      </Provider>
    </div>
  ),
};
const placements = ["top start", "top", "top end", "bottom start", "bottom", "bottom end"] as const;
function PlacementsTemplate(args: ToastStoryProps) {
  const [managers] = useState(() => placements.map(() => Toast.createToastManager<Data>()));
  return (
    <div {...stylex.props(s.centered, s.gap6)}>
      {placements.map((placement, index) => (
        <Provider
          key={placement}
          {...args}
          placement={placement}
          manager={managers[index]}
          limit={3}
        />
      ))}
      <div {...stylex.props(s.placements)}>
        {placements.map((placement, index) => (
          <Button
            key={placement}
            size="sm"
            variant="secondary"
            onClick={() =>
              managers[index]!.add({
                title: "Event created",
                description: "Event has been created",
                type: "default",
              })
            }
          >
            {placement}
          </Button>
        ))}
      </div>
    </div>
  );
}
export const Placements: Story = { render: (args) => <PlacementsTemplate {...args} /> };
function ExpandedButton() {
  const manager = Toast.useToastManager();
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        manager.add({ title: "Simple message", type: "default" });
        setTimeout(() => manager.add({ title: "Operation completed", type: "success" }), 400);
        setTimeout(() => manager.add({ title: "New update available", type: "accent" }), 800);
      }}
    >
      Show 3 toasts
    </Button>
  );
}
export const Expanded: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args} expanded>
        <ExpandedButton />
      </Provider>
    </div>
  ),
};
function SimpleButtons() {
  const manager = Toast.useToastManager();
  return (
    <div {...stylex.props(s.buttons)}>
      {[
        { label: "Default", title: "Simple message", type: "default" },
        { label: "Success", title: "Operation completed", type: "success" },
        { label: "Info", title: "New update available", type: "accent" },
        { label: "Warning", title: "Please check your settings", type: "warning" },
        { label: "Error", title: "Something went wrong", type: "danger" },
      ].map((item) => (
        <Button
          key={item.label}
          size="sm"
          variant="secondary"
          onClick={() => manager.add({ title: item.title, type: item.type })}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
export const SimpleToast: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args}>
        <SimpleButtons />
      </Provider>
    </div>
  ),
};
function PromiseButtons() {
  const manager = Toast.useToastManager();
  const uploadFile = () =>
    new Promise<{ filename: string; size: number }>((resolve) =>
      setTimeout(() => resolve({ filename: "document.pdf", size: 1024 }), 2000),
    );
  const createEvent = () =>
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Network error. Please try again.")), 2000),
    );
  const saveData = () =>
    new Promise<{ count: number }>((resolve, reject) =>
      setTimeout(() => {
        if (Math.random() > 0.5) resolve({ count: 42 });
        else reject(new Error("Failed to save data"));
      }, 2000),
    );
  const fetchUser = () =>
    new Promise<{ name: string; email: string }>((resolve) =>
      setTimeout(() => resolve({ name: "John Doe", email: "john@example.com" }), 2000),
    );
  return (
    <div {...stylex.props(s.buttons)}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          void manager
            .promise(uploadFile(), {
              loading: "Uploading file...",
              error: "Failed to upload file",
              success: (data) => `File ${data.filename} uploaded (${data.size}KB)`,
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
              loading: "Creating event...",
              error: (error: Error) => error.message,
              success: "Event created",
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
              loading: "Saving changes...",
              error: (error: Error) => error.message,
              success: (data) => `Saved ${data.count} items`,
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
              loading: "Loading user...",
              error: "Failed to fetch user",
              success: (data) => `Welcome back, ${data.name}!`,
            })
            .catch(() => {});
        }}
      >
        Fetch user
      </Button>
    </div>
  );
}
export const PromiseToast: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args}>
        <PromiseButtons />
      </Provider>
    </div>
  ),
};
function IndicatorButton() {
  const manager = Toast.useToastManager<Data>();
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() =>
        manager.add({
          title: "Custom icon indicator",
          data: { indicator: <MenuToastIcon name="star" muted={false} /> },
        })
      }
    >
      Custom indicator
    </Button>
  );
}
export const CustomIndicator: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args}>
        <IndicatorButton />
      </Provider>
    </div>
  ),
};
function LoadingButtons() {
  const manager = Toast.useToastManager();
  function start(
    title: string,
    description: string | undefined,
    finished: string,
    detail: string,
    delay: number,
    error = false,
  ) {
    const id = manager.add({ title, description, type: "loading", timeout: 0 });
    setTimeout(
      () =>
        manager.update(id, {
          title: finished,
          description: detail,
          type: error ? "danger" : "success",
          timeout: 4000,
        }),
      delay,
    );
  }
  return (
    <div {...stylex.props(s.buttons)}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          start(
            "Uploading file...",
            "Please wait while we upload your file",
            "File uploaded",
            "Your file has been uploaded successfully",
            3000,
          )
        }
      >
        Upload with loading
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          start(
            "Processing payment...",
            undefined,
            "Payment processed",
            "Your payment has been processed successfully",
            2500,
          )
        }
      >
        Payment processing
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          start("Saving changes...", undefined, "Failed to save", "Please try again", 2000, true)
        }
      >
        Loading to error
      </Button>
    </div>
  );
}
export const LoadingState: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args}>
        <LoadingButtons />
      </Provider>
    </div>
  ),
};
function CallbacksButtons() {
  const manager = Toast.useToastManager();
  const [history, setHistory] = useState<{ id: string; message: string; time: string }[]>([]);
  function closed(message: string) {
    const time = new Date().toLocaleTimeString();
    const id = crypto.randomUUID();
    setHistory((previous) => [{ id, message, time }, ...previous].slice(0, 5));
  }
  return (
    <>
      <div {...stylex.props(s.buttons)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            manager.add({
              title: "File saved",
              timeout: 3000,
              onClose: () => closed("File saved (closed after 3 seconds)"),
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
              timeout: 10000,
              onClose: () => closed("Changes saved (closed after 10 seconds)"),
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
              onClose: () => closed("Event created (closed after default timeout)"),
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
              timeout: 0,
              onClose: () => closed("Important notification (manually closed)"),
            })
          }
        >
          Persistent toast
        </Button>
      </div>
      <div {...stylex.props(s.history)}>
        <div {...stylex.props(s.between)}>
          <h3 {...stylex.props(s.historyHeading)}>Closed History</h3>
          {history.length > 0 && (
            <Button
              size="sm"
              variant="tertiary"
              xstyle={s.historyClear}
              onClick={() => setHistory([])}
            >
              Clear
            </Button>
          )}
        </div>
        <div {...stylex.props(s.historyPanel)}>
          {history.length === 0 ? (
            <p {...stylex.props(s.muted)}>No toasts closed yet. Try closing one above!</p>
          ) : (
            history.map((item, index) => (
              <div key={item.id} {...stylex.props(s.historyItem, s.historyDelay(index * 50))}>
                <div {...stylex.props(s.historyText)}>
                  <span {...stylex.props(s.historyMessage)}>{item.message}</span>
                  <span {...stylex.props(s.historyTime)}>({item.time})</span>
                </div>
                <div {...stylex.props(s.historyCheck)}>
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
export const WithCallbacks: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered, s.callbacks, s.gap6)}>
      <Provider {...args}>
        <CallbacksButtons />
      </Provider>
    </div>
  ),
};
function CustomButton() {
  const manager = Toast.useToastManager();
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() =>
        manager.add({
          title: "Custom layout toast",
          description: "This uses a custom render function",
          type: "default",
        })
      }
    >
      Custom toast
    </Button>
  );
}
export const CustomToast: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args} custom>
        <CustomButton />
      </Provider>
    </div>
  ),
};
function CustomQueues(args: ToastStoryProps) {
  const [notification] = useState(() => Toast.createToastManager<Data>());
  const [error] = useState(() => Toast.createToastManager<Data>());
  const [success] = useState(() => Toast.createToastManager<Data>());
  return (
    <div {...stylex.props(s.queueRow)}>
      <Provider {...args} manager={notification} placement="bottom" limit={2} />
      <Provider {...args} manager={error} placement="top" limit={3} />
      <Provider {...args} manager={success} placement="bottom end" limit={1} />
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          notification.add({
            title: "New notification",
            description: "You have a new message",
            type: "default",
          })
        }
      >
        Add notification (max 2)
      </Button>
      <Button
        size="sm"
        variant="danger-soft"
        onClick={() =>
          error.add({
            title: "Error occurred",
            description: "Failed to save changes",
            type: "danger",
          })
        }
      >
        Add error (max 3)
      </Button>
      <Button
        size="sm"
        variant="secondary"
        xstyle={s.success}
        onClick={() =>
          success.add({
            title: "Success!",
            description: `Operation ${Date.now()}`,
            type: "success",
          })
        }
      >
        Add success (max 1)
      </Button>
    </div>
  );
}
export const CustomQueue: Story = { render: (args) => <CustomQueues {...args} /> };
function ModalExample() {
  const manager = Toast.useToastManager();
  return (
    <Modal>
      <Modal.Trigger render={<Button size="sm" variant="secondary" />}>Open modal</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup xstyle={s.modal}>
            <Modal.Close />
            <Modal.Header>
              <Modal.Icon xstyle={s.modalIcon}>
                <MenuToastIcon name="bell" large muted={false} />
              </Modal.Icon>
              <Modal.Title>Notifications</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Trigger a toast from inside the modal to see it render above the backdrop.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                xstyle={s.fullWidth}
                onClick={() =>
                  manager.add({
                    title: "Settings saved",
                    description: "Your changes have been applied",
                    type: "success",
                  })
                }
              >
                Show toast
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
export const ToastInModal: Story = {
  render: (args) => (
    <div {...stylex.props(s.centered)}>
      <Provider {...args}>
        <ModalExample />
      </Provider>
    </div>
  ),
};
