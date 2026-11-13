// Modified: native UI SDK Root/Portal/Viewport/Popup/Close composition.
import type { Meta } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, AlertDialog, Button } from "@lenso/ui";
import { overlayStyles as s } from "./overlay.stylex";
import {
  AlertExample,
  AnimationExamples,
  CloseExamples,
  ControlledExamples,
  DismissExamples,
  OverlayIcon,
  PortalExample,
  cap,
} from "./overlay.fixtures";

export default {
  argTypes: {},
  component: AlertDialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Overlays/AlertDialog",
} as Meta<typeof AlertDialog>;

export const Default = () => (
  <AlertExample
    trigger="Delete Project"
    title="Delete project permanently?"
    danger
    confirm="Delete Project"
  >
    <p>
      This will permanently delete <strong>My Awesome Project</strong>and all of its data. This
      action cannot be undone.
    </p>
  </AlertExample>
);

export const Statuses = () => {
  const examples = [
    {
      status: "accent",
      trigger: "Sign Out",
      header: "Sign out of your account?",
      body: "You'll need to sign in again to access your account. Any unsaved changes will be lost.",
      cancel: "Stay Signed In",
      confirm: "Sign Out",
    },
    {
      status: "success",
      trigger: "Complete Task",
      header: "Complete this task?",
      body: "This will mark the task as complete and notify all team members. The task will be moved to your completed list.",
      cancel: "Not Yet",
      confirm: "Mark Complete",
    },
    {
      status: "warning",
      trigger: "Discard Changes",
      header: "Discard unsaved changes?",
      body: "You have unsaved changes that will be permanently lost. Are you sure you want to discard them?",
      cancel: "Keep Editing",
      confirm: "Discard",
    },
    {
      status: "danger",
      trigger: "Delete Account",
      header: "Delete your account?",
      body: "This will permanently delete your account and remove all your data from our servers. This action is irreversible.",
      cancel: "Cancel",
      confirm: "Delete Account",
    },
  ] as const;
  return (
    <div {...stylex.props(s.row)}>
      {examples.map(({ status, trigger, header, body, cancel, confirm }) => (
        <AlertDialog.Root key={status}>
          <AlertDialog.Trigger render={<Button xstyle={s[status]} />}>
            {trigger}
          </AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content xstyle={s.alertWidth}>
            <AlertDialog.Close />
            <AlertDialog.Header>
              <AlertDialog.Icon variant={status} />
              <AlertDialog.Title>{header}</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>{body}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<GlassButton variant="default" />}>
                {cancel}
              </AlertDialog.Close>
              <AlertDialog.Close
                render={
                  <Button
                    destructive={status === "danger"}
                    variant={status === "danger" ? "prominent" : "prominent"}
                  />
                }
              >
                {confirm}
              </AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Root>
      ))}
    </div>
  );
};

export const Placements = () => (
  <div {...stylex.props(s.row)}>
    {(["auto", "top", "center", "bottom"] as const).map((placement) => (
      <AlertExample
        key={placement}
        trigger={cap(placement)}
        placement={placement}
        title={placement === "auto" ? "Auto Placement" : `${cap(placement)} Position`}
      >
        <p>
          {placement === "auto"
            ? "Centers the alert on mobile and desktop."
            : `This dialog is positioned at the ${placement} of the viewport. Critical confirmations are typically centered for maximum attention.`}
        </p>
      </AlertExample>
    ))}
  </div>
);

export const Sizes = () => (
  <div {...stylex.props(s.row)}>
    {(["xs", "sm", "md", "lg", "cover"] as const).map((size) => (
      <AlertExample
        key={size}
        trigger={cap(size)}
        size={size}
        title={`Size: ${cap(size)}`}
        noWidth
        headerIcon={
          <AlertDialog.Icon xstyle={s.neutralIcon}>
            <OverlayIcon name="rocket" />
          </AlertDialog.Icon>
        }
      >
        <p>
          {size === "cover" ? (
            <>
              This alert dialog uses the <code>cover</code> size variant. It spans the full screen
              with margins: 16px on mobile and 40px on desktop. Maintains rounded corners and
              standard padding. Perfect for critical confirmations that need maximum width while
              preserving alert dialog aesthetics.
            </>
          ) : (
            <>
              This alert dialog uses the <code>{size}</code> size variant. On mobile devices, all
              sizes adapt to near full-width for optimal viewing. On desktop, each size provides a
              different maximum width to suit various content needs.
            </>
          )}
        </p>
      </AlertExample>
    ))}
  </div>
);

export const BackdropVariants = () => (
  <div {...stylex.props(s.row)}>
    {(["opaque", "blur", "transparent"] as const).map((backdrop) => (
      <AlertExample
        key={backdrop}
        trigger={cap(backdrop)}
        backdrop={backdrop}
        title={`Backdrop: ${cap(backdrop)}`}
      >
        <p>
          {backdrop === "opaque"
            ? "An opaque dark backdrop that completely obscures the background, providing maximum focus on the dialog."
            : backdrop === "blur"
              ? "A blurred backdrop that softly obscures the background while maintaining visual context."
              : "A transparent backdrop that keeps the background fully visible, useful for less critical confirmations."}
        </p>
      </AlertExample>
    ))}
  </div>
);

export const CustomIcon = () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger render={<GlassButton variant="default" />}>
      Reset Password
    </AlertDialog.Trigger>
    <AlertDialog.Backdrop />
    <AlertDialog.Content xstyle={s.alertWidth}>
      <AlertDialog.Close />
      <AlertDialog.Header>
        <AlertDialog.Icon variant="warning">
          <OverlayIcon name="lock-open" />
        </AlertDialog.Icon>
        <AlertDialog.Title>Reset your password?</AlertDialog.Title>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <p>
          We'll send a password reset link to your email address. You'll need to create a new
          password to regain access to your account.
        </p>
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <AlertDialog.Close render={<GlassButton variant="default" />}>Cancel</AlertDialog.Close>
        <AlertDialog.Close render={<Button />}>Send Reset Link</AlertDialog.Close>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
);

export const CustomBackdrop = () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger render={<Button destructive variant="prominent" />}>
      Delete Account
    </AlertDialog.Trigger>
    <AlertDialog.Backdrop variant="blur" xstyle={custom.redBackdrop} />
    <AlertDialog.Content xstyle={custom.width420}>
      <AlertDialog.Close />
      <AlertDialog.Header xstyle={s.centered}>
        <AlertDialog.Icon variant="danger">
          <OverlayIcon name="triangle-exclamation" />
        </AlertDialog.Icon>
        <AlertDialog.Title>Permanently delete your account?</AlertDialog.Title>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <p>
          This action cannot be undone. All your data, settings, and content will be permanently
          removed from our servers. The dramatic red backdrop emphasizes the severity and
          irreversibility of this decision.
        </p>
      </AlertDialog.Body>
      <AlertDialog.Footer xstyle={s.reverse}>
        <AlertDialog.Close render={<Button fullWidth />}>Keep Account</AlertDialog.Close>
        <AlertDialog.Close render={<Button destructive fullWidth variant="prominent" />}>
          Delete Forever
        </AlertDialog.Close>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
);

export const DismissBehavior = () => <DismissExamples alert />;
export const CloseMethods = () => <CloseExamples alert />;
export const Controlled = () => <ControlledExamples alert />;

export const CustomTrigger = () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger xstyle={s.customTrigger}>
      <div {...stylex.props(s.triggerIcon, s.danger)}>
        <OverlayIcon name="trash-bin" />
      </div>
      <div {...stylex.props(s.triggerText)}>
        <p {...stylex.props(s.triggerTitle)}>Delete Item</p>
        <p {...stylex.props(s.small)}>Permanently remove this item</p>
      </div>
    </AlertDialog.Trigger>
    <AlertDialog.Backdrop />
    <AlertDialog.Content xstyle={s.alertWidth}>
      <AlertDialog.Close />
      <AlertDialog.Header>
        <AlertDialog.Icon variant="danger">
          <OverlayIcon name="trash-bin" />
        </AlertDialog.Icon>
        <AlertDialog.Title>Delete this item?</AlertDialog.Title>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <p>
          Use <code>AlertDialog.Trigger</code>to create custom trigger elements beyond standard
          buttons. This example shows a card-style trigger with icons and descriptive text.
        </p>
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <AlertDialog.Close render={<GlassButton variant="default" />}>Cancel</AlertDialog.Close>
        <AlertDialog.Close render={<Button destructive variant="prominent" />}>
          Delete Item
        </AlertDialog.Close>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
);

export const CustomAnimations = () => <AnimationExamples alert />;
export const CustomPortal = () => <PortalExample alert />;

const custom = stylex.create({
  width420: { maxWidth: { default: null, "@media (min-width: 640px)": 420 } },
  redBackdrop: {
    backgroundImage:
      "linear-gradient(to top, var(--lenso-status-error-fill), var(--lenso-status-error-fill), transparent)",
  },
});
