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
    width: { default: 384, "@media (min-width: 640px)": 512 },
  },
  group: { display: "flex", flexDirection: "column", gap: 8, borderRadius: 24, paddingBlock: 8 },
  prefix: { paddingInline: 12, paddingBlock: 0 },
  input: { width: "100%", resize: "none", paddingInline: 14, paddingBlock: 0 },
  suffix: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: 6,
    paddingInline: 12,
    paddingBlock: 0,
  },
  actions: { marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 6 },
  tooltip: { display: "flex", alignItems: "center", gap: 4 },
  hint: { fontSize: 12, lineHeight: "16px" },
  key: { height: 16, borderRadius: "var(--radius-sm)", paddingInline: 4 },
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
          <Button aria-label="Add context" size="sm" variant="outline">
            <At aria-hidden="true" />
            Add Context
          </Button>
        </InputGroup.Prefix>
        <InputGroup.TextArea
          aria-label="Prompt input"
          xstyle={styles.input}
          placeholder="Assign tasks or ask anything..."
          rows={5}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Tooltip>
            <Tooltip.Trigger
              delay={0}
              render={<Button isIconOnly aria-label="Attach file" size="sm" variant="tertiary" />}
            >
              <Plus aria-hidden="true" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup>
                  <p {...stylex.props(styles.hint)}>Add a files and more</p>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger
              delay={0}
              render={<Button isIconOnly aria-label="Connect Apps" size="sm" variant="tertiary" />}
            >
              <PlugConnection aria-hidden="true" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup>
                  <p {...stylex.props(styles.hint)}>Connect apps</p>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip>
          <div {...stylex.props(styles.actions)}>
            <Tooltip>
              <Tooltip.Trigger
                delay={0}
                render={<Button isIconOnly aria-label="Voice input" size="sm" variant="ghost" />}
              >
                <Microphone aria-hidden="true" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Popup>
                    <p {...stylex.props(styles.hint)}>Voice input</p>
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
                    aria-label="Send prompt"
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
                    <p {...stylex.props(styles.hint)}>Send</p>
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
