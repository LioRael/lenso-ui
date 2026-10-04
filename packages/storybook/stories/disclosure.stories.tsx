// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
// HeroUI Native text is source fixture content, not a Lenso runtime claim.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Chip, Disclosure } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { navigation as s } from "./navigation.stylex";
import { NavigationIcon } from "./navigation-icons";

type Args = { disabled?: boolean; open?: boolean; isDisabled?: boolean; isExpanded?: boolean };
const meta = {
  argTypes: {
    isDisabled: { control: { type: "boolean" } },
    isExpanded: { control: { type: "boolean" } },
  },
  component: Disclosure,
  parameters: { layout: "centered" },
  title: "Components/Navigation/Disclosure",
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
const defaultArgs = { isDisabled: false, isExpanded: false };
function Template({ isDisabled, isExpanded, ...props }: Args) {
  const [open, setOpen] = useState(isExpanded ?? false);
  return (
    <div {...stylex.props(s.width)}>
      <Disclosure {...props} disabled={isDisabled} open={open} onOpenChange={setOpen}>
        <Disclosure.Heading>
          <Disclosure.Trigger render={<Button variant="secondary" />}>
            <NavigationIcon icon="gravity-ui:qr-code" />
            Preview HeroUI Native
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body xstyle={s.standaloneBody}>
            <p {...stylex.props(s.muted)}>
              Scan this QR code with your camera app to preview the HeroUI native components.
            </p>
            <img
              alt="Expo Go QR Code"
              {...stylex.props(s.qr)}
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
            />
            <p {...stylex.props(s.muted)}>Expo must be installed on your device.</p>
            <Button xstyle={s.action} variant="primary">
              <NavigationIcon icon="tabler:brand-apple-filled" />
              Download on App Store
            </Button>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
function ControlledTemplate({ isDisabled, isExpanded: _isExpanded, ...props }: Args) {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(s.width, s.column)}>
      <div {...stylex.props(s.row)}>
        <Button variant="primary" onClick={() => setOpen(!open)}>
          {open ? "Collapse" : "Expand"} from outside
        </Button>
        <Chip color={open ? "success" : "default"}>State: {open ? "Expanded" : "Collapsed"}</Chip>
      </div>
      <Disclosure {...props} disabled={isDisabled} open={open} onOpenChange={setOpen}>
        <Disclosure.Trigger xstyle={s.borderedTrigger}>
          <span>Toggle content</span>
          <NavigationIcon icon={open ? "gravity-ui:chevron-up" : "gravity-ui:chevron-down"} />
        </Disclosure.Trigger>
        <Disclosure.Content>
          <Disclosure.Body xstyle={s.borderBody}>
            <p {...stylex.props(s.muted)}>
              This disclosure is controlled from outside. You can toggle it using the button above
              or by clicking the trigger.
            </p>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
function ProductDetailsTemplate({ isDisabled, isExpanded: _isExpanded, ...props }: Args) {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(s.width)}>
      <Disclosure {...props} disabled={isDisabled} open={open} onOpenChange={setOpen}>
        <Disclosure.Trigger xstyle={s.borderedTrigger}>
          <span {...stylex.props(s.smallRow)}>
            <NavigationIcon icon="gravity-ui:box" />
            View product details
          </span>
          <NavigationIcon icon={open ? "gravity-ui:chevron-up" : "gravity-ui:chevron-down"} />
        </Disclosure.Trigger>
        <Disclosure.Content>
          <Disclosure.Body xstyle={s.paddingTop}>
            <div {...stylex.props(s.product)}>
              <h3 {...stylex.props(s.heading)}>Product Details</h3>
              <div {...stylex.props(s.grid)}>
                {[
                  ["Material:", "100% Cotton"],
                  ["Size:", "Medium (38-40)"],
                  ["Color:", "Navy Blue"],
                  ["Care:", "Machine wash cold"],
                ].map(([label, value]) => (
                  <div key={label} {...stylex.props(s.between)}>
                    <span {...stylex.props(s.muted)}>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div {...stylex.props(s.smallRow, s.paddingTop)}>
                <Chip color="success">Free Shipping</Chip>
                <Chip color="accent">1 Year Warranty</Chip>
                <Chip color="warning">Eco-Friendly</Chip>
              </div>
            </div>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
export const Default: Story = { args: defaultArgs, render: Template };
export const Controlled: Story = { args: defaultArgs, render: ControlledTemplate };
export const ProductDetails: Story = { args: defaultArgs, render: ProductDetailsTemplate };
export const InitiallyExpanded: Story = {
  args: { ...defaultArgs, isExpanded: true },
  render: Template,
};
export const Disabled: Story = { args: { ...defaultArgs, isDisabled: true }, render: Template };
