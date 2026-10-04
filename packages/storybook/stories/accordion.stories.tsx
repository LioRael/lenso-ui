// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion, type AccordionRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { navigation as s } from "./navigation.stylex";
import { NavigationIcon } from "./navigation-icons";

type SourceArgs = AccordionRootProps & { allowsMultipleExpanded?: boolean; isDisabled?: boolean };
const meta = {
  argTypes: {
    allowsMultipleExpanded: { control: { type: "boolean" } },
    isDisabled: { control: { type: "boolean" } },
  },
  component: Accordion,
  parameters: { layout: "centered" },
  title: "Components/Navigation/Accordion",
} satisfies Meta<SourceArgs>;
export default meta;
type Story = StoryObj<SourceArgs>;
const defaultArgs = { allowsMultipleExpanded: false, isDisabled: false };
const order =
  "Browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information to complete your purchase.";
const items = [
  { title: "How do I place an order?", content: order, icon: "gravity-ui:shopping-bag" },
  {
    title: "Can I modify or cancel my order?",
    content:
      "Yes, you can modify or cancel your order before it's shipped. Once your order is processed, you can't make changes.",
    icon: "gravity-ui:receipt",
  },
  {
    title: "What payment methods do you accept?",
    content: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
    icon: "gravity-ui:credit-card",
  },
  {
    title: "How much does shipping cost?",
    content:
      "Shipping costs vary based on your location and the size of your order. We offer free shipping for orders over $50.",
    icon: "gravity-ui:box",
  },
  {
    title: "Do you ship internationally?",
    content:
      "Yes, we ship to most countries. Please check our shipping rates and policies for more information.",
    icon: "gravity-ui:planet-earth",
  },
  {
    title: "How do I request a refund?",
    content:
      "If you're not satisfied with your purchase, you can request a refund within 30 days of purchase. Please contact our customer support team for assistance.",
    icon: "gravity-ui:arrows-rotate-left",
  },
];
const categories = [
  { title: "General", items: items.slice(0, 2).map(({ title }) => ({ title, content: order })) },
  {
    title: "Licensing",
    items: [
      "How do I purchase a license?",
      "What is the difference between a standard and a pro license?",
    ].map((title) => ({ title, content: order })),
  },
  {
    title: "Usage",
    items: ["How do I use the HeroUI icon set?", "Can I use it with Tailwind CSS?"].map(
      (title) => ({ title, content: order }),
    ),
  },
  { title: "Support", items: [{ title: "How do I get support?", content: order }] },
  { title: "Other", items: [{ title: "How do I get support?", content: order }] },
];
function Template({ allowsMultipleExpanded, isDisabled, ...props }: SourceArgs) {
  return (
    <div {...stylex.props(s.width)}>
      <Accordion multiple={allowsMultipleExpanded} disabled={isDisabled} {...props}>
        {items.map((item) => (
          <Accordion.Item key={item.title} value={item.title}>
            <Accordion.Heading>
              <Accordion.Trigger>
                <NavigationIcon {...stylex.props(s.itemIcon)} icon={item.icon} />
                {item.title}
                <Accordion.Indicator>
                  <NavigationIcon icon="gravity-ui:chevron-down" />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>{item.content}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}
function CustomTemplate({ allowsMultipleExpanded, isDisabled, ...props }: SourceArgs) {
  return (
    <div {...stylex.props(s.faq)}>
      <div {...stylex.props(s.faqInner)}>
        <h2 {...stylex.props(s.faqTitle)}>Frequently Asked Questions</h2>
        <p {...stylex.props(s.faqSubtitle)}>
          Everything you need to know about licensing and usage.
        </p>
        <div {...stylex.props(s.categories)}>
          {categories.map((category) => (
            <div key={category.title}>
              <p {...stylex.props(s.categoryTitle)}>{category.title}</p>
              <Accordion
                multiple={allowsMultipleExpanded}
                disabled={isDisabled}
                {...props}
                variant="surface"
              >
                {category.items.map((item) => (
                  <Accordion.Item key={item.title} value={item.title}>
                    <Accordion.Heading>
                      <Accordion.Trigger>
                        {item.title}
                        <Accordion.Indicator>
                          <NavigationIcon icon="gravity-ui:chevron-down" />
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body>{item.content}</Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export const Default: Story = {
  args: { ...defaultArgs, allowsMultipleExpanded: true },
  render: Template,
};
export const SurfaceVariant: Story = {
  args: { ...defaultArgs, variant: "surface", allowsMultipleExpanded: true },
  render: (args) => (
    <section {...stylex.props(s.screen)}>
      <Template {...args} />
    </section>
  ),
};
export const Custom: Story = {
  args: { ...defaultArgs, allowsMultipleExpanded: true },
  render: (args) => (
    <section {...stylex.props(s.screen)}>
      <CustomTemplate {...args} />
    </section>
  ),
};
export const WithoutSeparator: Story = {
  args: { ...defaultArgs, allowsMultipleExpanded: true },
  render: (args) => <Template hideSeparator {...args} />,
};
