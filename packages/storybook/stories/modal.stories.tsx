// HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
// Modified: native Base UI anatomy, onClick, controlled open/onOpenChange.
import type { Meta } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { Modal, Button, Surface, Radio, RadioGroup } from "@lenso/ui";
import { overlayStyles as s } from "./overlay.stylex";
import {
  AnimationExamples,
  CloseExamples,
  ControlledExamples,
  DismissExamples,
  ModalExample,
  OverlayForm,
  OverlayIcon,
  PortalExample,
  cap,
  lorem,
} from "./overlay.fixtures";

export default {
  argTypes: {},
  component: Modal,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Overlays/Modal",
} as Meta<typeof Modal>;

export const Default = () => (
  <ModalExample trigger="Open Modal" title="Welcome to HeroUI">
    <p>
      A beautiful, fast, and modern React UI library for building accessible and customizable web
      applications with ease.
    </p>
  </ModalExample>
);

export const Placements = () => (
  <div {...stylex.props(s.row)}>
    {(["auto", "top", "center", "bottom"] as const).map((placement) => (
      <ModalExample
        key={placement}
        trigger={cap(placement)}
        placement={placement}
        title={`Placement: ${cap(placement)}`}
      >
        <p>
          This modal uses the <code>{placement}</code> placement option. Try different placements to
          see how the modal positions itself on the screen.
        </p>
      </ModalExample>
    ))}
  </div>
);

export const BackdropVariants = () => (
  <div {...stylex.props(s.row)}>
    {(["opaque", "blur", "transparent"] as const).map((backdrop) => (
      <ModalExample
        key={backdrop}
        trigger={cap(backdrop)}
        backdrop={backdrop}
        title={`Backdrop: ${cap(backdrop)}`}
      >
        <p>
          This modal uses the <code>{backdrop}</code> backdrop variant. Compare the different visual
          effects: opaque provides full opacity, blur adds a backdrop filter, and transparent
          removes the background.
        </p>
      </ModalExample>
    ))}
  </div>
);

export const Sizes = () => (
  <div {...stylex.props(s.row)}>
    {(["xs", "sm", "md", "lg", "cover", "full"] as const).map((size) => (
      <ModalExample
        key={size}
        trigger={cap(size)}
        size={size}
        title={`Size: ${cap(size)}`}
        cancel="Cancel"
        confirm="Confirm"
        noWidth
      >
        <p>
          {size === "cover" ? (
            <>
              This modal uses the <code>cover</code> size variant. It spans the full screen with
              margins: 16px on mobile and 40px on desktop. Maintains rounded corners and standard
              padding. Perfect for cover-style content that needs maximum width while preserving
              modal aesthetics.
            </>
          ) : size === "full" ? (
            <>
              This modal uses the <code>full</code> size variant. It occupies the entire viewport
              without any margins, rounded corners, or shadows, creating a true fullscreen
              experience. Ideal for immersive content or full-page interactions.
            </>
          ) : (
            <>
              This modal uses the <code>{size}</code> size variant. On mobile devices, all sizes
              adapt to near full-width for optimal viewing. On desktop, each size provides a
              different maximum width to suit various content needs.
            </>
          )}
        </p>
      </ModalExample>
    ))}
  </div>
);

export const CustomBackdrop = () => (
  <Modal.Root>
    <Modal.Trigger render={<Button variant="secondary" />}>Custom Backdrop</Modal.Trigger>
    <Modal.Portal>
      <Modal.Backdrop variant="blur" xstyle={s.gradient} />
      <Modal.Viewport>
        <Modal.Popup xstyle={s.modalWidth}>
          <Modal.Header xstyle={s.centered}>
            <Modal.Icon xstyle={s.accent}>
              <OverlayIcon name="sparkles" />
            </Modal.Icon>
            <Modal.Title>Premium Backdrop</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This backdrop features a sophisticated gradient that transitions from a dark color at
              the bottom to complete transparency at the top, combined with a smooth blur effect.
              The gradient automatically adapts its intensity for optimal contrast in both light and
              dark modes.
            </p>
          </Modal.Body>
          <Modal.Footer xstyle={s.reverse}>
            <Modal.Close render={<Button fullWidth />}>Amazing!</Modal.Close>
            <Modal.Close render={<Button fullWidth variant="secondary" />}>Close</Modal.Close>
          </Modal.Footer>
          <Modal.Close />
        </Modal.Popup>
      </Modal.Viewport>
    </Modal.Portal>
  </Modal.Root>
);

export const DismissBehavior = () => <DismissExamples />;
export const CloseMethods = () => <CloseExamples />;

export const ScrollComparison = () => {
  const [scroll, setScroll] = React.useState<"inside" | "outside">("inside");
  return (
    <div {...stylex.props(s.column)}>
      <RadioGroup
        value={scroll}
        onValueChange={(value) => setScroll(value as "inside" | "outside")}
        xstyle={s.compactRow}
      >
        {(["inside", "outside"] as const).map((value) => (
          <Radio key={value} value={value}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <span>{cap(value)}</span>
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>
      <Modal.Root scroll={scroll}>
        <Modal.Trigger render={<Button variant="secondary" />}>
          Open Modal ({cap(scroll)})
        </Modal.Trigger>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Viewport>
            <Modal.Popup xstyle={s.modalWidth}>
              <Modal.Header>
                <Modal.Title>Scroll: {cap(scroll)}</Modal.Title>
                <p {...stylex.props(s.muted)}>
                  Compare scroll behaviors - inside keeps content scrollable within the modal,
                  outside allows page scrolling
                </p>
              </Modal.Header>
              <Modal.Body>
                {Array.from({ length: 30 }, (_, i) => (
                  <p key={i} {...stylex.props(s.paragraph)}>
                    Paragraph {i + 1}: {lorem}
                  </p>
                ))}
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
                <Modal.Close render={<Button />}>Confirm</Modal.Close>
              </Modal.Footer>
              <Modal.Close />
            </Modal.Popup>
          </Modal.Viewport>
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
};

export const Controlled = () => <ControlledExamples />;
export const WithForm = () => (
  <Modal.Root>
    <Modal.Trigger render={<Button variant="secondary" />}>Open Contact Form</Modal.Trigger>
    <Modal.Portal>
      <Modal.Backdrop />
      <Modal.Viewport>
        <Modal.Popup placement="auto">
          <Modal.Close />
          <Modal.Header>
            <Modal.Icon xstyle={s.accent}>
              <OverlayIcon name="envelope" />
            </Modal.Icon>
            <Modal.Title>Contact Us</Modal.Title>
            <p {...stylex.props(s.muted)}>
              Fill out the form below and we'll get back to you. The modal adapts automatically when
              the keyboard appears on mobile.
            </p>
          </Modal.Header>
          <Modal.Body>
            <Surface variant="default">
              <OverlayForm contact />
            </Surface>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
            <Modal.Close render={<Button />}>Send Message</Modal.Close>
          </Modal.Footer>
        </Modal.Popup>
      </Modal.Viewport>
    </Modal.Portal>
  </Modal.Root>
);

export const CustomTrigger = () => (
  <Modal.Root>
    <Modal.Trigger xstyle={s.customTrigger}>
      <div {...stylex.props(s.triggerIcon, s.accent)}>
        <OverlayIcon name="gear" />
      </div>
      <div {...stylex.props(s.triggerText)}>
        <p {...stylex.props(s.triggerTitle)}>Settings</p>
        <p {...stylex.props(s.small)}>Manage your preferences</p>
      </div>
    </Modal.Trigger>
    <Modal.Portal>
      <Modal.Backdrop />
      <Modal.Viewport>
        <Modal.Popup xstyle={s.modalWidth}>
          <Modal.Close />
          <Modal.Header>
            <Modal.Icon xstyle={s.accent}>
              <OverlayIcon name="gear" />
            </Modal.Icon>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Use <code>Modal.Trigger</code> to create custom trigger elements beyond standard
              buttons. This example shows a card-style trigger with icons and descriptive text.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
            <Modal.Close render={<Button />}>Save</Modal.Close>
          </Modal.Footer>
        </Modal.Popup>
      </Modal.Viewport>
    </Modal.Portal>
  </Modal.Root>
);
export const CustomAnimations = () => <AnimationExamples />;
export const CustomPortal = () => <PortalExample />;
