// Adapted from HeroUI v3.2.6 kbd.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Kbd, type KbdKey } from "@lenso/ui";

const styles = stylex.create({
  shortcuts: { display: "flex", flexDirection: "column", gap: 16 },
  shortcut: { display: "flex", alignItems: "center", gap: 8 },
  navigation: { display: "flex", alignItems: "center", gap: 16 },
  keys: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  inline: { display: "flex", flexDirection: "column", gap: 8 },
  paragraph: { fontSize: 14 },
});
const meta = {
  title: "Components/Typography/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: { variant: { control: "select", options: ["default", "light"] } },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

function Shortcut({
  label,
  modifiers,
  content,
  variant,
}: {
  label?: string;
  modifiers: readonly KbdKey[];
  content?: string;
  variant?: "default" | "light";
}) {
  const key = (
    <Kbd variant={variant}>
      {modifiers.map((keyValue) => (
        <Kbd.Abbr key={keyValue} keyValue={keyValue} />
      ))}
      {content && <Kbd.Content>{content}</Kbd.Content>}
    </Kbd>
  );
  return label ? (
    <div {...stylex.props(styles.shortcut)}>
      <span>{label}:</span>
      {key}
    </div>
  ) : (
    key
  );
}

export const Default: Story = { render: () => <Shortcut modifiers={["command"]} content="K" /> };
export const WithSingleKey: Story = {
  render: () => <Shortcut modifiers={["command"]} content="K" />,
};
export const WithMultipleKeys: Story = {
  render: () => <Shortcut modifiers={["command", "shift"]} content="K" />,
};
function Combinations({ variant }: { variant?: "default" | "light" }) {
  return (
    <div {...stylex.props(styles.shortcuts)}>
      <Shortcut label="Copy" modifiers={["command"]} content="C" variant={variant} />
      <Shortcut label="Paste" modifiers={["command"]} content="V" variant={variant} />
      <Shortcut label="Cut" modifiers={["command"]} content="X" variant={variant} />
      <Shortcut label="Undo" modifiers={["command"]} content="Z" variant={variant} />
      <Shortcut label="Redo" modifiers={["command", "shift"]} content="Z" variant={variant} />
    </div>
  );
}
export const KeyCombinations: Story = { render: () => <Combinations /> };
export const LightVariant: Story = { render: () => <Combinations variant="light" /> };
export const NavigationKeys: Story = {
  render: () => (
    <div {...stylex.props(styles.navigation)}>
      {(["up", "down", "left", "right"] as const).map((key) => (
        <Shortcut key={key} modifiers={[key]} />
      ))}
    </div>
  ),
};
export const SpecialKeys: Story = {
  render: () => (
    <div {...stylex.props(styles.keys)}>
      {(
        [
          "enter",
          "delete",
          "escape",
          "tab",
          "capslock",
          "space",
          "pageup",
          "pagedown",
          "home",
          "end",
          "help",
          "fn",
        ] as const
      ).map((key) => (
        <Shortcut key={key} modifiers={[key]} />
      ))}
    </div>
  ),
};
export const ComplexShortcuts: Story = {
  render: () => (
    <div {...stylex.props(styles.shortcuts)}>
      <Shortcut label="Open Spotlight" modifiers={["command", "space"]} />
      <Shortcut label="Force Quit" modifiers={["command", "option", "escape"]} />
      <Shortcut label="Screenshot" modifiers={["command", "shift"]} content="3" />
      <Shortcut label="Switch Apps" modifiers={["command", "tab"]} />
    </div>
  ),
};
export const InlineUsage: Story = {
  render: () => (
    <div {...stylex.props(styles.inline)}>
      <p {...stylex.props(styles.paragraph)}>
        Press{" "}
        <Kbd>
          <Kbd.Content>Esc</Kbd.Content>
        </Kbd>{" "}
        to close the dialog.
      </p>
      <p {...stylex.props(styles.paragraph)}>
        Use <Shortcut modifiers={["command"]} content="K" /> to open the command palette.
      </p>
      <p {...stylex.props(styles.paragraph)}>
        Navigate with <Shortcut modifiers={["up"]} /> and <Shortcut modifiers={["down"]} /> arrow
        keys.
      </p>
    </div>
  ),
};
export const CustomContent: Story = {
  render: () => (
    <div {...stylex.props(styles.shortcuts)}>
      <Shortcut label="Select word" modifiers={["option", "left"]} />
      <Shortcut label="Delete line" modifiers={["ctrl"]} content="K" />
      <Shortcut label="Multiple modifiers" modifiers={["command", "option", "shift"]} content="4" />
    </div>
  ),
};
