"use client";

import { useState } from "react";
import { Button, type ButtonRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useStoryLocale } from "./story-panel";

export interface ButtonStoryProps {
  variant?: ButtonRootProps["variant"];
  size?: ButtonRootProps["size"];
  disabled?: ButtonRootProps["disabled"];
  isLoading?: ButtonRootProps["isLoading"];
  fullWidth?: ButtonRootProps["fullWidth"];
  destructive?: ButtonRootProps["destructive"];
  tint?: ButtonRootProps["tint"];
  label: string;
}

const s = stylex.create({
  stack: { width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 },
  message: { fontSize: 13, color: "var(--lenso-label-primary)", minHeight: 20 },
});

export function ButtonStory({ label, ...props }: ButtonStoryProps) {
  const [count, setCount] = useState(0);
  const cn = useStoryLocale() === "cn";
  return (
    <div {...stylex.props(s.stack)}>
      <Button {...props} onClick={() => setCount((value) => value + 1)}>
        {label}
      </Button>
      <output {...stylex.props(s.message)}>
        {count > 0 ? `${cn ? "触发次数" : "Activations"}: ${count}` : ""}
      </output>
    </div>
  );
}
