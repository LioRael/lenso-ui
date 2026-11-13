"use client";
import { useState } from "react";
import { List, RefreshControl } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  root: { height: 340, width: 300, maxWidth: "100%" },
  header: { padding: 12 },
});
export interface RefreshControlStoryProps {
  disabled: boolean;
}
export function RefreshControlStory({ disabled }: RefreshControlStoryProps) {
  const [count, setCount] = useState(0);
  return (
    <RefreshControl
      disabled={disabled}
      xstyle={s.root}
      onRefresh={async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setCount((value) => value + 1);
      }}
    >
      <div {...stylex.props(s.header)}>
        <RefreshControl.Trigger />· {count}updates
      </div>
      <RefreshControl.Viewport>
        <List aria-label="Reading list">
          {["Accessibility", "Animation", "Architecture", "Books"].map((title) => (
            <List.Item key={title} height="tall">
              <List.Content>
                <List.Title>{title}</List.Title>
                <List.Description>
                  {count ? "Updated just now" : "Pull down to update"}
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </RefreshControl.Viewport>
    </RefreshControl>
  );
}
