// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import {
  ArrowUturnCcwLeft,
  ArrowUturnCwRight,
  Bold,
  Copy,
  Italic,
  Scissors,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  Underline,
} from "@gravity-ui/icons";
import { Button, ButtonGroup, ToggleButton, ToggleButtonGroup, Toolbar } from "@lenso/ui";
import { styles } from "../../en/toolbar/source.stylex";
function TextStyle({ custom = false }: { custom?: boolean }) {
  return (
    <ToggleButtonGroup multiple aria-label="文本样式" xstyle={custom && styles.group}>
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
      ].map((item, index) => (
        <ToggleButton
          key={item.value}
          value={item.value}
          isIconOnly
          aria-label={item.label}
          xstyle={custom && styles.toggle}
        >
          {index > 0 && !custom && <ToggleButtonGroup.Separator />}
          <ToggleButton.Icon>{item.icon}</ToggleButton.Icon>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
function Clipboard() {
  return (
    <ButtonGroup variant="tertiary">
      <Button
        isIconOnly
        aria-label="Copy"
        render={<Toolbar.Button isIconOnly variant="tertiary" />}
      >
        <Button.Icon>
          <Copy />
        </Button.Icon>
      </Button>
      <Button isIconOnly aria-label="Cut" render={<Toolbar.Button isIconOnly variant="tertiary" />}>
        <ButtonGroup.Separator />
        <Button.Icon>
          <Scissors />
        </Button.Icon>
      </Button>
    </ButtonGroup>
  );
}
export function Basic() {
  return (
    <Toolbar aria-label="Text formatting">
      <TextStyle />
      <Toolbar.Separator />
      <Clipboard />
    </Toolbar>
  );
}
export function Attached() {
  return (
    <Toolbar isAttached aria-label="Text formatting">
      <TextStyle />
      <Toolbar.Separator />
      <Clipboard />
    </Toolbar>
  );
}
export function Vertical() {
  return (
    <Toolbar aria-label="Tools" orientation="vertical">
      <TextStyle />
      <Toolbar.Separator />
      <ButtonGroup variant="tertiary">
        <Button
          isIconOnly
          aria-label="撤销"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <Button.Icon>
            <ArrowUturnCcwLeft />
          </Button.Icon>
        </Button>
        <Button
          isIconOnly
          aria-label="重做"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ButtonGroup.Separator />
          <Button.Icon>
            <ArrowUturnCwRight />
          </Button.Icon>
        </Button>
      </ButtonGroup>
    </Toolbar>
  );
}
export function CustomStyles() {
  return (
    <Toolbar aria-label="Formatting toolbar" xstyle={styles.root}>
      <TextStyle custom />
    </Toolbar>
  );
}
export function WithButtonGroup() {
  return (
    <Toolbar aria-label="编辑器工具栏">
      <ButtonGroup variant="tertiary">
        <Button render={<Toolbar.Button variant="tertiary" />}>
          <Button.Icon>
            <ArrowUturnCcwLeft />
          </Button.Icon>
          撤销
        </Button>
        <Button render={<Toolbar.Button variant="tertiary" />}>
          <ButtonGroup.Separator />
          <Button.Icon>
            <ArrowUturnCwRight />
          </Button.Icon>
          重做
        </Button>
      </ButtonGroup>
      <Toolbar.Separator />
      <TextStyle />
      <Toolbar.Separator />
      <ButtonGroup variant="tertiary">
        {[
          {
            label: "左对齐",
            icon: <TextAlignLeft />,
          },
          {
            label: "居中",
            icon: <TextAlignCenter />,
          },
          {
            label: "右对齐",
            icon: <TextAlignRight />,
          },
        ].map((item, index) => (
          <Button
            key={item.label}
            isIconOnly
            aria-label={item.label}
            render={<Toolbar.Button isIconOnly variant="tertiary" />}
          >
            {index > 0 && <ButtonGroup.Separator />}
            <Button.Icon>{item.icon}</Button.Icon>
          </Button>
        ))}
      </ButtonGroup>
    </Toolbar>
  );
}
