// HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
// Modified: native Base UI Root/Portal/Viewport/Popup/Close composition.
import type { Meta } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
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
      This will permanently delete <strong>My Awesome Project</strong> and all of its data. This
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
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup xstyle={s.alertWidth}>
                <AlertDialog.Close />
                <AlertDialog.Header>
                  <AlertDialog.Icon variant={status} />
                  <AlertDialog.Title>{header}</AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <p>{body}</p>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <AlertDialog.Close render={<Button variant="tertiary" />}>
                    {cancel}
                  </AlertDialog.Close>
                  <AlertDialog.Close
                    render={<Button variant={status === "danger" ? "danger" : "primary"} />}
                  >
                    {confirm}
                  </AlertDialog.Close>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
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
            ? "Automatically positions at the bottom on mobile and center on desktop for optimal user experience."
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
    <AlertDialog.Trigger render={<Button variant="secondary" />}>
      Reset Password
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Backdrop />
      <AlertDialog.Viewport>
        <AlertDialog.Popup xstyle={s.alertWidth}>
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
            <AlertDialog.Close render={<Button variant="tertiary" />}>Cancel</AlertDialog.Close>
            <AlertDialog.Close render={<Button />}>Send Reset Link</AlertDialog.Close>
          </AlertDialog.Footer>
        </AlertDialog.Popup>
      </AlertDialog.Viewport>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export const CustomBackdrop = () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger render={<Button variant="danger" />}>Delete Account</AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Backdrop variant="blur" xstyle={custom.redBackdrop} />
      <AlertDialog.Viewport>
        <AlertDialog.Popup xstyle={custom.width420}>
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
            <AlertDialog.Close render={<Button fullWidth variant="danger" />}>
              Delete Forever
            </AlertDialog.Close>
          </AlertDialog.Footer>
        </AlertDialog.Popup>
      </AlertDialog.Viewport>
    </AlertDialog.Portal>
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
    <AlertDialog.Portal>
      <AlertDialog.Backdrop />
      <AlertDialog.Viewport>
        <AlertDialog.Popup xstyle={s.alertWidth}>
          <AlertDialog.Close />
          <AlertDialog.Header>
            <AlertDialog.Icon variant="danger">
              <OverlayIcon name="trash-bin" />
            </AlertDialog.Icon>
            <AlertDialog.Title>Delete this item?</AlertDialog.Title>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              Use <code>AlertDialog.Trigger</code> to create custom trigger elements beyond standard
              buttons. This example shows a card-style trigger with icons and descriptive text.
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <AlertDialog.Close render={<Button variant="tertiary" />}>Cancel</AlertDialog.Close>
            <AlertDialog.Close render={<Button variant="danger" />}>Delete Item</AlertDialog.Close>
          </AlertDialog.Footer>
        </AlertDialog.Popup>
      </AlertDialog.Viewport>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export const CustomAnimations = () => <AnimationExamples alert />;
export const CustomPortal = () => <PortalExample alert />;

const custom = stylex.create({
  width420: { maxWidth: { default: null, "@media (min-width: 640px)": 420 } },
  redBackdrop: {
    backgroundImage: {
      default:
        "linear-gradient(to top, oklch(.258 .092 26.042 / .9), oklch(.258 .092 26.042 / .5), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to top, oklch(.258 .092 26.042 / .95), oklch(.258 .092 26.042 / .6), transparent)",
    },
  },
});
