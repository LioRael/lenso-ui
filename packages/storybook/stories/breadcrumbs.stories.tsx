// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs, BreadcrumbsItem } from "@lenso/ui";
import { NavigationIcon } from "./navigation-icons";

const meta = {
  component: Breadcrumbs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Navigation/Breadcrumbs",
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;
function Four({ disabled = false, custom = false }) {
  return (
    <Breadcrumbs
      disabled={disabled}
      separator={custom ? <NavigationIcon icon="gravity-ui:caret-right" /> : undefined}
    >
      <BreadcrumbsItem href="#">Home</BreadcrumbsItem>
      <BreadcrumbsItem href="#">Products</BreadcrumbsItem>
      <BreadcrumbsItem href="#">Electronics</BreadcrumbsItem>
      <BreadcrumbsItem>Laptop</BreadcrumbsItem>
    </Breadcrumbs>
  );
}
export const Default: Story = { render: () => <Four /> };
export const Level3: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbsItem href="#">Home</BreadcrumbsItem>
      <BreadcrumbsItem href="#">Category</BreadcrumbsItem>
      <BreadcrumbsItem>Current Page</BreadcrumbsItem>
    </Breadcrumbs>
  ),
};
export const Level2: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbsItem href="#">Home</BreadcrumbsItem>
      <BreadcrumbsItem>Current Page</BreadcrumbsItem>
    </Breadcrumbs>
  ),
};
export const CustomSeparator: Story = { render: () => <Four custom /> };
export const Disabled: Story = { render: () => <Four disabled /> };
