// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { navigation as s } from "./navigation.stylex";
const meta = {
  argTypes: {},
  component: Link,
  parameters: { layout: "centered" },
  title: "Components/Navigation/Link",
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {},
  render: () => (
    <div {...stylex.props(s.row)}>
      <Link href="#">
        Call to action
        <Link.Icon />
      </Link>
      <Link disabled href="#">
        Call to action
        <Link.Icon />
      </Link>
      <Link
        href="https://heroui.com"
        rel="noopener noreferrer"
        target="_blank"
        xstyle={[buttonStyles.root, buttonSizes.md, buttonVariants.tertiary, s.linkButton]}
      >
        HeroUI
        <Link.Icon xstyle={s.icon8} />
      </Link>
    </div>
  ),
};
export const CustomIcon: Story = {
  args: {},
  render: () => (
    <div {...stylex.props(s.row)}>
      <Link href="#">
        External Link
        <Link.Icon>
          <svg {...stylex.props(s.icon12)} viewBox="0 0 7 7" fill="none" aria-hidden="true">
            <path
              d="M1.20592 6.84333L0.379822 6.01723L4.52594 1.8672H1.37819L1.38601 0.731812H6.48742V5.83714H5.34421L5.35203 2.6933L1.20592 6.84333Z"
              fill="currentColor"
            />
          </svg>
        </Link.Icon>
      </Link>
      <Link href="#">
        <Link.Icon>
          <svg {...stylex.props(s.icon)} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
        </Link.Icon>
        Info Link
      </Link>
    </div>
  ),
};
export const IconPlacement: Story = {
  args: {},
  render: () => (
    <div {...stylex.props(s.column)}>
      <Link href="#">
        Icon at end (default)
        <Link.Icon />
      </Link>
      <Link href="#">
        <Link.Icon />
        Icon at start
      </Link>
    </div>
  ),
};
export const UnderlineVariants: Story = {
  args: {},
  render: () => (
    <div {...stylex.props(s.linkSections)}>
      <div {...stylex.props(s.linkSection)}>
        <p {...stylex.props(s.muted)}>Default hover underline</p>
        <Link href="#">
          Hover to see the underline
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(s.linkSection)}>
        <p {...stylex.props(s.muted)}>Always visible underline</p>
        <Link href="#" xstyle={s.underline}>
          Underline always visible
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(s.linkSection)}>
        <p {...stylex.props(s.muted)}>No underline</p>
        <Link href="#" xstyle={s.noUnderline}>
          Link without any underline
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(s.linkSection)}>
        <p {...stylex.props(s.muted)}>Changing the underline offset</p>
        <div {...stylex.props(s.offsets)}>
          {[s.offset1, s.offset2, s.offset3, s.offset4].map((offset, index) => (
            <Link key={index} href="#" xstyle={offset}>
              Offset {index + 1} ({index + 1}px space)
              <Link.Icon />
            </Link>
          ))}
        </div>
      </div>
    </div>
  ),
};
