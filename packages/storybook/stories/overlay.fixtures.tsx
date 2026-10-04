// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// SPDX-License-Identifier: Apache-2.0. Ordinary interactions use native Base UI.
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Modal, Button, Input, Label, TextField } from "@lenso/ui";
import { useOverlayState } from "@lenso/ui/hooks";
import { overlayStyles as s } from "./overlay.stylex";

const icons = stylex.create({
  source: (name: string) => ({
    display: "inline-block",
    width: 20,
    height: 20,
    flexShrink: 0,
    backgroundColor: "currentColor",
    maskImage: `url("https://api.iconify.design/gravity-ui/${name}.svg")`,
    maskSize: "contain",
    maskRepeat: "no-repeat",
    maskPosition: "center",
  }),
});
// Original Gravity UI icon IDs, MIT, YANDEX LLC; license retained in
// ../GRAVITY-ICONS-LICENSE.txt. No replacement drawings.
export function OverlayIcon({ name }: { name: string }) {
  return <span aria-hidden="true" data-source-icon={name} {...stylex.props(icons.source(name))} />;
}
export const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
export const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam.";
export const portalLorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

type CommonExample = {
  trigger: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  placement?: "auto" | "top" | "center" | "bottom";
  size?: "xs" | "sm" | "md" | "lg" | "cover";
  backdrop?: "opaque" | "blur" | "transparent";
  cancel?: string;
  confirm?: string;
  danger?: boolean;
  noWidth?: boolean;
  headerIcon?: React.ReactNode;
};
export function AlertExample({
  trigger,
  title,
  children,
  placement,
  size,
  backdrop,
  cancel = "Cancel",
  confirm = "Confirm",
  danger,
  noWidth,
  headerIcon,
}: CommonExample) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger render={<Button variant={danger ? "danger" : "secondary"} />}>
        {trigger}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop variant={backdrop} />
        <AlertDialog.Viewport>
          <AlertDialog.Popup placement={placement} size={size} xstyle={!noWidth && s.alertWidth}>
            <AlertDialog.Close />
            <AlertDialog.Header>
              {headerIcon ?? <AlertDialog.Icon variant={danger ? "danger" : "accent"} />}
              <AlertDialog.Title>{title}</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>{children}</AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="tertiary" />}>{cancel}</AlertDialog.Close>
              <AlertDialog.Close render={<Button variant={danger ? "danger" : "primary"} />}>
                {confirm}
              </AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
export function ModalExample({
  trigger,
  title,
  children,
  placement,
  size,
  backdrop,
  cancel,
  confirm = "Continue",
  noWidth,
}: Omit<CommonExample, "size"> & { size?: CommonExample["size"] | "full" }) {
  return (
    <Modal.Root>
      <Modal.Trigger render={<Button variant="secondary" />}>{trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop variant={backdrop} />
        <Modal.Viewport>
          <Modal.Popup placement={placement} size={size} xstyle={!noWidth && s.modalWidth}>
            <Modal.Close />
            <Modal.Header>
              <Modal.Icon xstyle={s.neutralIcon}>
                <OverlayIcon name="rocket" />
              </Modal.Icon>
              <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
              {cancel && (
                <Modal.Close render={<Button variant="secondary" />}>{cancel}</Modal.Close>
              )}
              <Modal.Close render={<Button xstyle={!cancel && s.full} />}>{confirm}</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>
  );
}
export function OverlayForm({ contact = false }: { contact?: boolean }) {
  const fields = contact
    ? [
        ["name", "Name", "text", "Enter your name"],
        ["email", "Email", "email", "Enter your email"],
        ["phone", "Phone", "tel", "Enter your phone number"],
        ["company", "Company", "text", "Enter your company name"],
        ["message", "Message", "text", "Enter your message"],
      ]
    : [
        ["name", "Name", "text", "Enter your name"],
        ["email", "Email", "email", "Enter your email"],
        ["bio", "Bio", "text", "Tell us about yourself"],
      ];
  return (
    <form {...stylex.props(s.column)}>
      {fields.map(([name, label, type, placeholder]) => (
        <TextField key={name} name={name} fullWidth>
          <Label>{label}</Label>
          <Input
            type={type}
            placeholder={placeholder}
            variant={contact ? "primary" : "secondary"}
          />
        </TextField>
      ))}
    </form>
  );
}

export function ControlledExamples({ alert = false }: { alert?: boolean }) {
  const O = alert ? AlertDialog : Modal;
  const family = alert ? "alert dialog" : "modal";
  return (
    <div {...stylex.props(s.examples)}>
      {["useState()", "useOverlayState()"].map((method) => (
        <ControlledExample key={method} alert={alert} method={method} family={family} O={O} />
      ))}
    </div>
  );
}
function ControlledExample({
  alert,
  method,
  family,
  O,
}: {
  alert: boolean;
  method: string;
  family: string;
  O: typeof Modal | typeof AlertDialog;
}) {
  const [localOpen, setLocalOpen] = React.useState(false);
  const state = useOverlayState();
  const open = method === "useState()" ? localOpen : state.isOpen;
  const setOpen = method === "useState()" ? setLocalOpen : state.setOpen;
  return (
    <div {...stylex.props(s.section)}>
      <h3 {...stylex.props(s.heading)}>
        With {method === "useState()" ? "React." : ""}
        {method}
      </h3>
      <p {...stylex.props(s.muted)}>
        {method === "useState()" ? (
          <>
            Control the {family} using React's <code>useState</code> hook for simple state
            management. Perfect for basic use cases.
          </>
        ) : (
          <>
            Use the <code>useOverlayState</code> hook for a cleaner API with convenient methods like{" "}
            <code>open()</code>, <code>close()</code>, and <code>toggle()</code>.
          </>
        )}
      </p>
      <O.Root open={open} onOpenChange={setOpen}>
        <div {...stylex.props(s.panel)}>
          <p {...stylex.props(s.small)}>
            Status: <span>{open ? "open" : "closed"}</span>
          </p>
          <div {...stylex.props(s.compactRow)}>
            <O.Trigger render={<Button size="sm" variant="secondary" />}>
              Open {alert ? "Dialog" : "Modal"}
            </O.Trigger>
            <Button size="sm" variant="tertiary" onClick={() => setOpen(!open)}>
              Toggle
            </Button>
          </div>
        </div>
        <O.Portal>
          <O.Backdrop />
          <O.Viewport>
            <O.Popup xstyle={alert ? s.alertWidth : s.modalWidth}>
              <O.Close />
              <O.Header>
                {alert ? (
                  <AlertDialog.Icon variant={method === "useState()" ? "accent" : "success"} />
                ) : (
                  <Modal.Icon xstyle={method === "useState()" ? s.accent : s.success}>
                    <OverlayIcon name="circle-check" />
                  </Modal.Icon>
                )}
                <O.Title>Controlled with {method}</O.Title>
              </O.Header>
              <O.Body>
                <p>
                  {method === "useState()" ? (
                    <>
                      This {family} is controlled by React's <code>useState</code> hook. Pass{" "}
                      <code>isOpen</code> and <code>onOpenChange</code> props to manage the{" "}
                      {alert ? "dialog" : "modal"} state externally.
                    </>
                  ) : (
                    <>
                      The <code>useOverlayState</code> hook provides dedicated methods for common
                      operations. No need to manually create callbacks—just use{" "}
                      <code>state.open()</code>, <code>state.close()</code>, or{" "}
                      <code>state.toggle()</code>.
                    </>
                  )}
                </p>
              </O.Body>
              <O.Footer>
                <O.Close render={<Button variant={alert ? "tertiary" : "secondary"} />}>
                  Cancel
                </O.Close>
                <O.Close render={<Button />}>Confirm</O.Close>
              </O.Footer>
            </O.Popup>
          </O.Viewport>
        </O.Portal>
      </O.Root>
    </div>
  );
}
export function CloseExamples({ alert = false }: { alert?: boolean }) {
  const O = alert ? AlertDialog : Modal;
  return (
    <div {...stylex.props(s.wideExamples)}>
      {['Using slot="close"', "Using Dialog render props"].map((method, i) => (
        <CloseExample key={method} O={O} alert={alert} method={method} controlled={i === 1} />
      ))}
    </div>
  );
}
function CloseExample({
  O,
  alert,
  method,
  controlled,
}: {
  O: typeof Modal | typeof AlertDialog;
  alert: boolean;
  method: string;
  controlled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div {...stylex.props(s.section)}>
      <h3 {...stylex.props(s.heading)}>{method}</h3>
      <p {...stylex.props(s.muted)}>
        {controlled ? (
          <>
            Access the <code>close</code> method from the Dialog's render props. This gives you full
            control over when and how to close the {alert ? "dialog" : "modal"}, allowing you to add
            custom logic before closing.
          </>
        ) : (
          <>
            The simplest way to close {alert ? "a dialog" : "a modal"}. Add{" "}
            <code>slot="close"</code> to any Button component within the{" "}
            {alert ? "dialog" : "modal"}. When clicked, it will automatically close the{" "}
            {alert ? "dialog" : "modal"}.
          </>
        )}
      </p>
      <O.Root open={open} onOpenChange={setOpen}>
        <O.Trigger render={<Button variant="secondary" />}>
          Open {alert ? "Dialog" : "Modal"}
        </O.Trigger>
        <O.Portal>
          <O.Backdrop />
          <O.Viewport>
            <O.Popup xstyle={alert ? s.alertWidth : s.modalWidth}>
              <O.Header>
                {alert ? (
                  <AlertDialog.Icon variant={controlled ? "success" : "accent"} />
                ) : (
                  <Modal.Icon xstyle={controlled ? s.success : s.accent}>
                    <OverlayIcon name={controlled ? "circle-check" : "circle-info"} />
                  </Modal.Icon>
                )}
                <O.Title>{method}</O.Title>
              </O.Header>
              <O.Body>
                <p>
                  {controlled ? (
                    <>
                      The buttons below use the <code>close</code> method from render props. You can
                      add validation or other logic before calling <code>renderProps.close()</code>.
                    </>
                  ) : (
                    <>
                      Click either button below - both have <code>slot="close"</code> and will close
                      the {alert ? "dialog" : "modal"} automatically.
                    </>
                  )}
                </p>
              </O.Body>
              <O.Footer>
                {controlled ? (
                  <>
                    <Button
                      variant={alert ? "tertiary" : "secondary"}
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setOpen(false)}>Confirm</Button>
                  </>
                ) : (
                  <>
                    <O.Close render={<Button variant={alert ? "tertiary" : "secondary"} />}>
                      Cancel
                    </O.Close>
                    <O.Close render={<Button />}>Confirm</O.Close>
                  </>
                )}
              </O.Footer>
            </O.Popup>
          </O.Viewport>
        </O.Portal>
      </O.Root>
    </div>
  );
}
export function DismissExamples({ alert = false }: { alert?: boolean }) {
  const O = alert ? AlertDialog : Modal;
  const family = alert ? "alert dialog" : "modal";
  return (
    <div {...stylex.props(s.dismissExamples)}>
      {[false, true].map((keyboard) => (
        <div key={String(keyboard)} {...stylex.props(s.section)}>
          <h3 {...stylex.props(s.heading)}>
            {keyboard ? "isKeyboardDismissDisabled" : "isDismissable"}
          </h3>
          <p {...stylex.props(s.muted)}>
            {keyboard ? (
              <>
                Controls whether the ESC key can dismiss the {family}.{" "}
                {alert ? (
                  <>
                    Alert dialogs typically require explicit action, so this defaults to{" "}
                    <code>true</code>. When set to <code>false</code>, the ESC key will be enabled.
                  </>
                ) : (
                  <>
                    When set to <code>true</code>, the ESC key will be disabled and users must use
                    explicit close actions.
                  </>
                )}
              </>
            ) : (
              <>
                Controls whether the {family} can be dismissed by clicking the overlay backdrop.{" "}
                {alert ? (
                  <>
                    Alert dialogs typically require explicit action, so this defaults to{" "}
                    <code>false</code>. Set to <code>true</code> for less critical confirmations.
                  </>
                ) : (
                  <>
                    Defaults to <code>true</code>. Set to <code>false</code> to require explicit
                    close action.
                  </>
                )}
              </>
            )}
          </p>
          <O.Root
            onOpenChange={(_, details) => {
              if (keyboard ? details.reason === "escape-key" : details.reason === "outside-press")
                details.cancel();
            }}
          >
            <O.Trigger render={<Button variant="secondary" />}>
              Open {alert ? "Alert Dialog" : "Modal"}
            </O.Trigger>
            <O.Portal>
              <O.Backdrop />
              <O.Viewport>
                <O.Popup xstyle={alert ? s.alertWidth : s.modalWidth}>
                  <O.Close />
                  <O.Header>
                    {alert ? (
                      <AlertDialog.Icon variant={keyboard ? "accent" : "danger"}>
                        <OverlayIcon name="circle-info" />
                      </AlertDialog.Icon>
                    ) : (
                      <Modal.Icon xstyle={s.neutralIcon}>
                        <OverlayIcon name="circle-info" />
                      </Modal.Icon>
                    )}
                    <O.Title>
                      {keyboard ? "isKeyboardDismissDisabled = true" : "isDismissable = false"}
                    </O.Title>
                    <p {...stylex.props(s.muted)}>
                      {keyboard
                        ? "ESC key is disabled"
                        : `Clicking the backdrop won't close this ${family}`}
                    </p>
                  </O.Header>
                  <O.Body>
                    <p>
                      {keyboard
                        ? `Press ESC - nothing happens. You must use ${alert ? "the action buttons to dismiss this alert dialog." : "the close button or click the overlay backdrop to dismiss this modal."}`
                        : `Try clicking outside this ${family} on the overlay - it won't close. You must use ${alert ? "the action buttons to dismiss it." : "the close button or press ESC to dismiss it."}`}
                    </p>
                  </O.Body>
                  <O.Footer>
                    {alert && <O.Close render={<Button variant="tertiary" />}>Cancel</O.Close>}
                    <O.Close render={<Button xstyle={!alert && s.full} />}>
                      {alert ? "Confirm" : "Close"}
                    </O.Close>
                  </O.Footer>
                </O.Popup>
              </O.Viewport>
            </O.Portal>
          </O.Root>
        </div>
      ))}
    </div>
  );
}
export function AnimationExamples({ alert = false }: { alert?: boolean }) {
  const O = alert ? AlertDialog : Modal;
  const animations = [
    {
      name: "Kinematic Scale",
      description: `Physics-based elastic scaling. Simulates a high-damping spring system with fast transient response and prolonged settling time. Ideal for ${alert ? "Alert Dialogs and Modals." : "Modals and Popovers."}`,
      icon: "sparkles",
      motion: s.kinematic,
      backdropMotion: s.kinematicBackdrop,
    },
    {
      name: "Fluid Slide",
      description:
        "Simulates movement through a medium with fluid resistance. Eliminates mechanical linearity for a natural, grounded feel. Perfect for Bottom Sheets or Toasts.",
      icon: "arrow-up-from-line",
      motion: s.fluid,
      backdropMotion: s.fluidBackdrop,
    },
  ];
  return (
    <div {...stylex.props(s.row)}>
      {animations.map(({ name, description, icon, motion, backdropMotion }) => (
        <O.Root key={name}>
          <O.Trigger render={<Button variant="secondary" />}>{name}</O.Trigger>
          <O.Portal>
            <O.Backdrop xstyle={backdropMotion} />
            <O.Viewport>
              <O.Popup xstyle={[alert ? s.alertWidth : s.modalWidth, motion]}>
                <O.Close />
                <O.Header>
                  {alert ? (
                    <AlertDialog.Icon variant="accent">
                      <OverlayIcon name={icon} />
                    </AlertDialog.Icon>
                  ) : (
                    <Modal.Icon xstyle={s.neutralIcon}>
                      <OverlayIcon name={icon} />
                    </Modal.Icon>
                  )}
                  <O.Title>{name} Animation</O.Title>
                </O.Header>
                <O.Body>
                  <p>{description}</p>
                </O.Body>
                <O.Footer>
                  <O.Close render={<Button variant="tertiary" />}>Close</O.Close>
                  <O.Close render={<Button />}>Try Again</O.Close>
                </O.Footer>
              </O.Popup>
            </O.Viewport>
          </O.Portal>
        </O.Root>
      ))}
    </div>
  );
}
export function PortalExample({ alert = false }: { alert?: boolean }) {
  const O = alert ? AlertDialog : Modal;
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  return (
    <div {...stylex.props(s.column)}>
      <div>
        <p>
          Render {alert ? "alert dialogs" : "modals"} inside a custom container instead of{" "}
          <code>document.body</code>
        </p>
        <p {...stylex.props(s.muted)}>
          Apply <code>transform: translateZ(0)</code> to the container to create a new stacking
          context.
        </p>
      </div>
      <div ref={setContainer} data-overlay-portal-host="" {...stylex.props(s.portalHost)}>
        {container && (
          <O.Root>
            <O.Trigger render={<Button />}>Open {alert ? "Alert Dialog" : "Modal"}</O.Trigger>
            <O.Portal container={container}>
              <O.Backdrop xstyle={s.portalFill} />
              <O.Viewport xstyle={s.portalFill}>
                <O.Popup xstyle={s.portalPopup}>
                  <O.Close />
                  <O.Header>
                    {alert && <AlertDialog.Icon variant="accent" />}
                    <O.Title>Custom Portal</O.Title>
                  </O.Header>
                  <O.Body>
                    {[0, 1, 2].map((i) => (
                      <p key={i} {...stylex.props(s.muted)}>
                        {portalLorem}
                      </p>
                    ))}
                  </O.Body>
                  <O.Footer>
                    {alert && <O.Close render={<Button variant="tertiary" />}>Cancel</O.Close>}
                    <O.Close render={<Button variant={alert ? "primary" : "secondary"} />}>
                      {alert ? "Confirm" : "Close"}
                    </O.Close>
                  </O.Footer>
                </O.Popup>
              </O.Viewport>
            </O.Portal>
          </O.Root>
        )}
      </div>
    </div>
  );
}
