// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
} from "@gravity-ui/icons";
import { ToggleButton, ToggleButtonGroup } from "@lenso/ui";
import { useState, type ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/toggle-button-group/source.stylex";
type FormattingProps = ComponentProps<typeof ToggleButtonGroup> & {
  separators?: boolean;
  disableItalic?: boolean;
  custom?: boolean;
  short?: boolean;
};
function Formatting({
  separators = true,
  disableItalic = false,
  custom = false,
  short = false,
  ...props
}: FormattingProps) {
  return (
    <ToggleButtonGroup multiple {...props}>
      {[
        {
          value: "bold",
          label: "粗体",
          icon: <Bold />,
        },
        {
          value: "italic",
          label: "斜体",
          icon: <Italic />,
        },
        {
          value: "underline",
          label: "下划线",
          icon: <Underline />,
        },
        ...(!short
          ? [
              {
                value: "strikethrough",
                label: "删除线",
                icon: <Strikethrough />,
              },
            ]
          : []),
      ].map((item, index) => (
        <ToggleButton
          key={item.value}
          value={item.value}
          isIconOnly
          aria-label={item.label}
          disabled={disableItalic && item.value === "italic"}
          xstyle={custom && styles.toggle}
        >
          {index > 0 && separators && <ToggleButtonGroup.Separator />}
          <ToggleButton.Icon>{item.icon}</ToggleButton.Icon>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
function Alignment(props: ComponentProps<typeof ToggleButtonGroup>) {
  return (
    <ToggleButtonGroup {...props}>
      {[
        {
          value: "left",
          label: "左对齐",
          icon: <TextAlignLeft />,
        },
        {
          value: "center",
          label: "居中",
          icon: <TextAlignCenter />,
        },
        {
          value: "right",
          label: "右对齐",
          icon: <TextAlignRight />,
        },
      ].map((item, index) => (
        <ToggleButton key={item.value} value={item.value}>
          {index > 0 && <ToggleButtonGroup.Separator />}
          <ToggleButton.Icon>{item.icon}</ToggleButton.Icon>
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
export function Attached() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(styles.muted)}>Attached (default)</span>
        <Formatting />
      </div>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(styles.muted)}>Detached</span>
        <Formatting isDetached separators={false} />
      </div>
    </div>
  );
}
export function SelectionMode() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(styles.muted)}>Single selection</span>
        <Alignment defaultValue={["center"]} />
      </div>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(styles.muted)}>Multiple selection</span>
        <Formatting defaultValue={["bold", "underline"]} />
      </div>
    </div>
  );
}
export function FullWidth() {
  return (
    <div {...stylex.props(styles.full)}>
      <Formatting fullWidth />
      <Alignment fullWidth />
    </div>
  );
}
export function Sizes() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <div key={size} {...stylex.props(styles.section)}>
          <span {...stylex.props(styles.muted)}>{["Small", "Medium", "Large"][index]}</span>
          <Formatting size={size} />
        </div>
      ))}
    </div>
  );
}
export function Controlled() {
  const [selected, setSelected] = useState<string[]>(["bold"]);
  return (
    <div {...stylex.props(styles.controlled)}>
      <Formatting value={selected} onValueChange={setSelected} />
      <p {...stylex.props(styles.muted)}>
        Selected:{" "}
        <span {...stylex.props(styles.medium)}>
          {selected.length ? selected.join(", ") : "None"}
        </span>
      </p>
    </div>
  );
}
export function CustomStyles() {
  return (
    <Formatting
      short
      separators={false}
      custom
      aria-label="Text formatting"
      xstyle={styles.custom}
    />
  );
}
export function WithoutSeparator() {
  return <Formatting separators={false} />;
}
export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(styles.muted)}>All buttons disabled</span>
        <Formatting short disabled />
      </div>
      <div {...stylex.props(styles.section)}>
        <span {...stylex.props(styles.muted)}>Individual button disabled</span>
        <Formatting short disableItalic />
      </div>
    </div>
  );
}
export function Orientation() {
  return (
    <div {...stylex.props(styles.row)}>
      {(["horizontal", "vertical"] as const).map((orientation, index) => (
        <div key={orientation} {...stylex.props(styles.section)}>
          <span {...stylex.props(styles.muted)}>{["Horizontal", "Vertical"][index]}</span>
          <Formatting short orientation={orientation} />
        </div>
      ))}
    </div>
  );
}
