"use client";
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
import { Toolbar } from "@lenso/ui";
import { useState, type ComponentProps } from "react";
import { styles } from "./source.stylex";
function TextStyle() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Toolbar.Group aria-label="Text style">
      {[
        { value: "bold", label: "Bold", icon: <Bold width={17} height={22} /> },
        { value: "italic", label: "Italic", icon: <Italic width={17} height={22} /> },
        { value: "underline", label: "Underline", icon: <Underline width={17} height={22} /> },
      ].map((item) => (
        <Toolbar.Button
          key={item.value}
          isIconOnly
          aria-label={item.label}
          aria-pressed={selected.includes(item.value)}
          onClick={() =>
            setSelected((current) =>
              current.includes(item.value)
                ? current.filter((value) => value !== item.value)
                : [...current, item.value],
            )
          }
          xstyle={selected.includes(item.value) && styles.selected}
        >
          {item.icon}
        </Toolbar.Button>
      ))}
    </Toolbar.Group>
  );
}
function Clipboard() {
  return (
    <Toolbar.Group aria-label="Clipboard">
      <Toolbar.Button isIconOnly aria-label="Copy">
        <Copy width={17} height={22} />
      </Toolbar.Button>
      <Toolbar.Button isIconOnly aria-label="Cut">
        <Scissors width={17} height={22} />
      </Toolbar.Button>
    </Toolbar.Group>
  );
}
export function Basic(props: ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar aria-label="Text formatting" {...props}>
      <Toolbar.Group aria-label="History">
        <Toolbar.Button isIconOnly aria-label="Undo">
          <ArrowUturnCcwLeft width={17} height={22} />
        </Toolbar.Button>
        <Toolbar.Button isIconOnly aria-label="Redo">
          <ArrowUturnCwRight width={17} height={22} />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group aria-label="Clipboard">
        <Toolbar.Button>Copy</Toolbar.Button>
        <Toolbar.Button>Paste</Toolbar.Button>
      </Toolbar.Group>
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
    <Toolbar aria-label="History" orientation="vertical">
      <Toolbar.Group aria-label="History">
        <Toolbar.Button isIconOnly aria-label="Undo">
          <ArrowUturnCcwLeft width={17} height={22} />
        </Toolbar.Button>
        <Toolbar.Button isIconOnly aria-label="Redo">
          <ArrowUturnCwRight width={17} height={22} />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  );
}
export function WithButtonGroup() {
  const [alignment, setAlignment] = useState("left");
  return (
    <Toolbar aria-label="Editor toolbar">
      <Toolbar.Group aria-label="History">
        <Toolbar.Button>
          <ArrowUturnCcwLeft width={17} height={22} />
          Undo
        </Toolbar.Button>
        <Toolbar.Button>
          <ArrowUturnCwRight width={17} height={22} />
          Redo
        </Toolbar.Button>
      </Toolbar.Group>
      <TextStyle />
      <Toolbar.Group aria-label="Alignment">
        {[
          { value: "left", label: "Align left", icon: <TextAlignLeft width={17} height={22} /> },
          {
            value: "center",
            label: "Align center",
            icon: <TextAlignCenter width={17} height={22} />,
          },
          { value: "right", label: "Align right", icon: <TextAlignRight width={17} height={22} /> },
        ].map((item) => (
          <Toolbar.Button
            key={item.value}
            isIconOnly
            aria-label={item.label}
            aria-pressed={alignment === item.value}
            onClick={() => setAlignment(item.value)}
            xstyle={alignment === item.value && styles.selected}
          >
            {item.icon}
          </Toolbar.Button>
        ))}
      </Toolbar.Group>
    </Toolbar>
  );
}
