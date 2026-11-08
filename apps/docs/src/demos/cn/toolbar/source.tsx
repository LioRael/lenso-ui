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
import { styles } from "../../en/toolbar/source.stylex";
function TextStyle() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Toolbar.Group aria-label="文本样式">
      {[
        { value: "bold", label: "粗体", icon: <Bold width={17} height={22} /> },
        { value: "italic", label: "斜体", icon: <Italic width={17} height={22} /> },
        { value: "underline", label: "下划线", icon: <Underline width={17} height={22} /> },
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
    <Toolbar.Group aria-label="剪贴板">
      <Toolbar.Button isIconOnly aria-label="复制">
        <Copy width={17} height={22} />
      </Toolbar.Button>
      <Toolbar.Button isIconOnly aria-label="剪切">
        <Scissors width={17} height={22} />
      </Toolbar.Button>
    </Toolbar.Group>
  );
}
export function Basic(props: ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar aria-label="文本格式" {...props}>
      <Toolbar.Group aria-label="历史操作">
        <Toolbar.Button isIconOnly aria-label="撤销">
          <ArrowUturnCcwLeft width={17} height={22} />
        </Toolbar.Button>
        <Toolbar.Button isIconOnly aria-label="重做">
          <ArrowUturnCwRight width={17} height={22} />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group aria-label="剪贴板">
        <Toolbar.Button>复制</Toolbar.Button>
        <Toolbar.Button>粘贴</Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  );
}
export function Attached() {
  return (
    <Toolbar isAttached aria-label="文本格式">
      <TextStyle />
      <Toolbar.Separator />
      <Clipboard />
    </Toolbar>
  );
}
export function Vertical() {
  return (
    <Toolbar aria-label="历史操作" orientation="vertical">
      <Toolbar.Group aria-label="历史操作">
        <Toolbar.Button isIconOnly aria-label="撤销">
          <ArrowUturnCcwLeft width={17} height={22} />
        </Toolbar.Button>
        <Toolbar.Button isIconOnly aria-label="重做">
          <ArrowUturnCwRight width={17} height={22} />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  );
}
export function WithButtonGroup() {
  const [alignment, setAlignment] = useState("left");
  return (
    <Toolbar aria-label="编辑工具栏">
      <Toolbar.Group aria-label="历史操作">
        <Toolbar.Button>
          <ArrowUturnCcwLeft width={17} height={22} />
          撤销
        </Toolbar.Button>
        <Toolbar.Button>
          <ArrowUturnCwRight width={17} height={22} />
          重做
        </Toolbar.Button>
      </Toolbar.Group>
      <TextStyle />
      <Toolbar.Group aria-label="对齐">
        {[
          { value: "left", label: "左对齐", icon: <TextAlignLeft width={17} height={22} /> },
          { value: "center", label: "居中对齐", icon: <TextAlignCenter width={17} height={22} /> },
          { value: "right", label: "右对齐", icon: <TextAlignRight width={17} height={22} /> },
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
