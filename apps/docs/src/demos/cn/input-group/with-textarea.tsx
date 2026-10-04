// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { ArrowUp, At, Microphone, PlugConnection, Plus } from "@gravity-ui/icons";
import { Button, InputGroup, Kbd, Spinner, TextField, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
const styles = stylex.create({
  field: {
    display: "flex",
    flexDirection: "column",
    width: {
      default: 384,
      "@media (min-width: 640px)": 512,
    },
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderRadius: 24,
    paddingBlock: 8,
  },
  prefix: {
    paddingInline: 12,
    paddingBlock: 0,
  },
  input: {
    width: "100%",
    resize: "none",
    paddingInline: 14,
    paddingBlock: 0,
  },
  suffix: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: 6,
    paddingInline: 12,
    paddingBlock: 0,
  },
  actions: {
    marginInlineStart: "auto",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tooltip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  hint: {
    fontSize: 12,
    lineHeight: "16px",
  },
  key: {
    height: 16,
    borderRadius: "var(--radius-sm)",
    paddingInline: 4,
  },
});
export function WithTextArea() {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = () => {
    if (!value.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setValue("");
    }, 1000);
  };
  return (
    <TextField fullWidth xstyle={styles.field} name="prompt">
      <InputGroup fullWidth xstyle={styles.group}>
        <InputGroup.Prefix xstyle={styles.prefix}>
          <Button aria-label="添加上下文" size="sm" variant="outline">
            <At aria-hidden="true" />
            添加上下文
          </Button>
        </InputGroup.Prefix>
        <InputGroup.TextArea
          aria-label="提示输入"
          xstyle={styles.input}
          placeholder="分配任务或提问…"
          rows={5}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Tooltip>
            <Tooltip.Trigger
              delay={0}
              render={<Button isIconOnly aria-label="附加文件" size="sm" variant="tertiary" />}
            >
              <Plus aria-hidden="true" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup>
                  <p {...stylex.props(styles.hint)}>添加文件等</p>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger
              delay={0}
              render={<Button isIconOnly aria-label="连接应用" size="sm" variant="tertiary" />}
            >
              <PlugConnection aria-hidden="true" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup>
                  <p {...stylex.props(styles.hint)}>连接应用</p>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip>
          <div {...stylex.props(styles.actions)}>
            <Tooltip>
              <Tooltip.Trigger
                delay={0}
                render={<Button isIconOnly aria-label="语音输入" size="sm" variant="ghost" />}
              >
                <Microphone aria-hidden="true" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Popup>
                    <p {...stylex.props(styles.hint)}>语音输入</p>
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger
                delay={0}
                render={
                  <Button
                    isIconOnly
                    aria-label="发送提示"
                    disabled={!value.trim()}
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                  />
                }
              >
                {isSubmitting ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <ArrowUp aria-hidden="true" />
                )}
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Popup xstyle={styles.tooltip}>
                    <p {...stylex.props(styles.hint)}>发送</p>
                    <Kbd xstyle={styles.key}>
                      <Kbd.Abbr keyValue="enter" />
                    </Kbd>
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip>
          </div>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
