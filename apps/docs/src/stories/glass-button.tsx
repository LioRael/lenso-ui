"use client";

import { useState } from "react";
import { GlassButton, type GlassButtonRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useStoryLocale } from "./story-panel";

export interface GlassButtonStoryProps {
  variant?: GlassButtonRootProps["variant"];
  size?: GlassButtonRootProps["size"];
  disabled?: GlassButtonRootProps["disabled"];
  isLoading?: GlassButtonRootProps["isLoading"];
  fullWidth?: GlassButtonRootProps["fullWidth"];
  destructive?: GlassButtonRootProps["destructive"];
  tint?: GlassButtonRootProps["tint"];
  elastic?: GlassButtonRootProps["elastic"];
  label: string;
}

const s = stylex.create({
  stack: { width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 },
  message: { fontSize: 13, color: "#fff", minHeight: 20 },
});

export function GlassButtonStory({ label, ...props }: GlassButtonStoryProps) {
  const [count, setCount] = useState(0);
  const cn = useStoryLocale() === "cn";
  return (
    <div {...stylex.props(s.stack)}>
      <GlassButton {...props} onClick={() => setCount((value) => value + 1)}>
        {label}
      </GlassButton>
      <output {...stylex.props(s.message)}>
        {count > 0 ? `${cn ? "触发次数" : "Activations"}: ${count}` : ""}
      </output>
    </div>
  );
}
