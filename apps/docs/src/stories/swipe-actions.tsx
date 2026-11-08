"use client";
import { useState } from "react";
import { Button, List, SwipeActions } from "@lenso/ui";
export interface SwipeActionsStoryProps {
  disabled: boolean;
  fullSwipe: boolean;
}
const messages = ["Design review", "Travel plans", "Weekly notes"];
export function SwipeActionsStory({ disabled, fullSwipe }: SwipeActionsStoryProps) {
  const [visible, setVisible] = useState(messages);
  const [status, setStatus] = useState("Swipe a row or use its action buttons.");
  const remove = (name: string, action: string) => {
    setVisible((rows) => rows.filter((row) => row !== name));
    setStatus(`${name}: ${action}`);
  };
  return (
    <div style={{ width: 420, maxWidth: "100%" }}>
      <List aria-label="Demo inbox">
        {visible.map((name) => (
          <SwipeActions
            key={name}
            render={<li />}
            disabled={disabled}
            startActionsLabel={`Archive actions for ${name}`}
            endActionsLabel={`Delete actions for ${name}`}
            startActions={[
              {
                id: "archive",
                label: "Archive",
                variant: "tint",
                fullSwipe,
                onAction: () => remove(name, "archived"),
              },
            ]}
            endActions={[
              {
                id: "delete",
                label: "Delete",
                variant: "danger",
                onAction: () => remove(name, "deleted"),
              },
            ]}
          >
            <List.Content>
              <List.Title>{name}</List.Title>
              <List.Description>Demo message</List.Description>
            </List.Content>
          </SwipeActions>
        ))}
      </List>
      <output>{visible.length ? status : "Inbox is empty."}</output>
      <Button
        onClick={() => {
          setVisible(messages);
          setStatus("Inbox restored.");
        }}
      >
        Reset inbox
      </Button>
    </div>
  );
}
