// HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
// Modified: Base UI swipeDirection, Root/Portal/Viewport/Popup/Content/Close.
import type { Meta } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { Drawer, Button } from "@lenso/ui";
import { overlayStyles as s } from "./overlay.stylex";
import { OverlayForm, OverlayIcon, cap, lorem } from "./overlay.fixtures";

export default {
  argTypes: {},
  component: Drawer,
  parameters: { layout: "centered" },
  title: "Components/Overlays/Drawer",
} as Meta<typeof Drawer>;

function Example({
  trigger,
  title,
  children,
  placement = "bottom",
  backdrop,
  cancel = "Cancel",
  confirm = "Confirm",
  handle = true,
  close = false,
}: {
  trigger: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  placement?: "bottom" | "top" | "left" | "right";
  backdrop?: "opaque" | "blur" | "transparent";
  cancel?: string | false;
  confirm?: string | false;
  handle?: boolean;
  close?: boolean;
}) {
  return (
    <Drawer.Root
      swipeDirection={placement === "bottom" ? "down" : placement === "top" ? "up" : placement}
    >
      <Drawer.Trigger render={<Button variant="secondary" />}>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop variant={backdrop} />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              {handle && placement === "bottom" && <Drawer.Handle />}
              {close && <Drawer.Close />}
              <Drawer.Header>
                <Drawer.Title>{title}</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>{children}</Drawer.Body>
              {(cancel || confirm) && (
                <Drawer.Footer>
                  {cancel && (
                    <Drawer.Close render={<Button variant="secondary" />}>{cancel}</Drawer.Close>
                  )}
                  {confirm && (
                    <Drawer.Close render={<Button fullWidth={!cancel} />}>{confirm}</Drawer.Close>
                  )}
                </Drawer.Footer>
              )}
              {handle && placement === "top" && <Drawer.Handle />}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
export const Default = () => (
  <Example trigger="Open Drawer" title="Drawer Title">
    <p>
      This is a bottom drawer built with React Aria's Modal component. It slides up from the bottom
      of the screen with a smooth CSS transition.
    </p>
  </Example>
);
export const Placements = () => (
  <div {...stylex.props(s.row)}>
    {(["bottom", "top", "left", "right"] as const).map((placement) => (
      <Example
        key={placement}
        placement={placement}
        trigger={cap(placement)}
        title={`${cap(placement)} Drawer`}
        close
        confirm="Done"
      >
        <p>
          This drawer slides in from the <strong>{placement}</strong> edge of the screen.
        </p>
      </Example>
    ))}
  </div>
);
export const BackdropVariants = () => (
  <div {...stylex.props(s.row)}>
    {(["opaque", "blur", "transparent"] as const).map((backdrop) => (
      <Example
        key={backdrop}
        trigger={cap(backdrop)}
        title={`Backdrop: ${cap(backdrop)}`}
        backdrop={backdrop}
        close
        cancel={false}
        confirm="Close"
      >
        <p>
          This drawer uses the <code>{backdrop}</code> backdrop variant.
        </p>
      </Example>
    ))}
  </div>
);
export const WithForm = () => (
  <Example
    trigger="Edit Profile"
    title="Edit Profile"
    placement="right"
    close
    handle={false}
    confirm="Save Changes"
  >
    <OverlayForm />
  </Example>
);
export const WithScrollableContent = () => (
  <Example
    trigger="Terms & Conditions"
    title="Terms & Conditions"
    close
    cancel="Decline"
    confirm="Accept"
  >
    {Array.from({ length: 20 }, (_, i) => (
      <p key={i} {...stylex.props(s.paragraph)}>
        Paragraph {i + 1}: {lorem}
      </p>
    ))}
  </Example>
);
export const NavigationDrawer = () => {
  const items = [
    { icon: "house", label: "Home" },
    { icon: "magnifier", label: "Search" },
    { icon: "bell", label: "Notifications" },
    { icon: "envelope", label: "Messages" },
    { icon: "person", label: "Profile" },
    { icon: "gear", label: "Settings" },
  ];
  return (
    <Example
      trigger={
        <>
          <OverlayIcon name="bars" />
          Menu
        </>
      }
      title="Navigation"
      placement="left"
      close
      handle={false}
      cancel={false}
      confirm={false}
    >
      <nav {...stylex.props(s.navigation)}>
        {items.map(({ icon, label }) => (
          <button key={label} type="button" {...stylex.props(s.navItem)}>
            <OverlayIcon name={icon} />
            {label}
          </button>
        ))}
      </nav>
    </Example>
  );
};
export const NonDismissable = () => (
  <Drawer.Root
    onOpenChange={(_, details) => {
      if (details.reason === "outside-press" || details.reason === "swipe") details.cancel();
    }}
  >
    <Drawer.Trigger render={<Button variant="secondary" />}>Important Action</Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Backdrop />
      <Drawer.Viewport>
        <Drawer.Popup>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Confirm Action</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <p>
                This drawer cannot be dismissed by clicking outside. You must use one of the buttons
                below.
              </p>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close render={<Button variant="secondary" />}>Cancel</Drawer.Close>
              <Drawer.Close render={<Button />}>Confirm</Drawer.Close>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>
);
export const Controlled = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div {...stylex.props(s.column)}>
      <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="right">
        <div {...stylex.props(s.compactRow)}>
          <Drawer.Trigger render={<Button variant="secondary" />}>Open Drawer</Drawer.Trigger>
          <p {...stylex.props(s.muted)}>
            Status: <span>{open ? "open" : "closed"}</span>
          </p>
        </div>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Close />
                <Drawer.Header>
                  <Drawer.Title>Controlled Drawer</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p>This drawer is controlled externally via React state.</p>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>Close</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
};
