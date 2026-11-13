"use client";

import { Gear, Plus, TrashBin } from "@gravity-ui/icons";
import { Button, Input, Spinner, TextField, type ButtonRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useStoryLocale } from "./story-panel";
import { PlaygroundConsole, usePlaygroundConsole } from "./playground-console";

export interface ButtonStoryProps {
  variant?: ButtonRootProps["variant"];
  size?: ButtonRootProps["size"];
  disabled?: ButtonRootProps["disabled"];
  isLoading?: ButtonRootProps["isLoading"];
  fullWidth?: ButtonRootProps["fullWidth"];
  destructive?: ButtonRootProps["destructive"];
  tint?: ButtonRootProps["tint"];
  label: string;
  example?: "default" | "with-icon" | "icon-only" | "async" | "form" | "render";
}

const s = stylex.create({
  stack: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignSelf: "stretch",
    minWidth: 0,
  },
  scene: {
    flex: 1,
    minHeight: 240,
    padding: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 280 },
});

export function ButtonStory({ label, example = "default", ...props }: ButtonStoryProps) {
  const { entries, log, clear } = usePlaygroundConsole();
  const cn = useStoryLocale() === "cn";
  const button = (
    <Button
      {...props}
      type={example === "form" ? "submit" : "button"}
      isIconOnly={example === "icon-only"}
      aria-label={example === "icon-only" ? label : undefined}
      pendingAnnouncement={cn ? "正在保存" : "Saving"}
      render={
        example === "render"
          ? (props) => <button {...props} data-example="custom-button" />
          : undefined
      }
      onClick={
        example === "form"
          ? undefined
          : (_event, { source }) => {
              log(`${label} · ${source}`);
              if (example === "async") {
                log(cn ? "开始保存…" : "Saving…");
                return new Promise<void>((resolve) => setTimeout(resolve, 1200)).then(() => {
                  log(cn ? "保存完成" : "Saved");
                });
              }
            }
      }
    >
      {(state) => (
        <>
          {state.pending ? (
            <Spinner color="current" size="sm" aria-hidden="true" />
          ) : example === "icon-only" ? (
            <Button.Icon>
              <Gear />
            </Button.Icon>
          ) : example === "with-icon" ? (
            <Button.Icon>{props.destructive ? <TrashBin /> : <Plus />}</Button.Icon>
          ) : null}
          {example !== "icon-only" && label}
        </>
      )}
    </Button>
  );
  return (
    <div {...stylex.props(s.stack)}>
      <div {...stylex.props(s.scene)}>
        {example === "form" ? (
          <form
            {...stylex.props(s.form)}
            onSubmit={(event) => {
              event.preventDefault();
              const email = String(new FormData(event.currentTarget).get("email"));
              log(`${cn ? "已订阅" : "Subscribed"}: ${email}`);
            }}
          >
            <TextField name="email">
              <TextField.Label>{cn ? "邮箱" : "Email"}</TextField.Label>
              <Input name="email" type="email" defaultValue="ada@example.com" required />
            </TextField>
            {button}
          </form>
        ) : (
          button
        )}
      </div>
      <PlaygroundConsole
        entries={entries}
        clear={clear}
        label={cn ? "按钮触发记录" : "Button activations"}
        empty={cn ? "等待触发…" : "Waiting for an interaction…"}
      />
    </div>
  );
}
