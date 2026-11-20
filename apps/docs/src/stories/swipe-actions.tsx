"use client";
import { useState } from "react";
import { Archive, Flag, TrashBin } from "@gravity-ui/icons";
import { Button, List, SwipeActions, type SwipeAction } from "@lenso/ui";
export interface SwipeActionsStoryProps {
  disabled: boolean;
  fullSwipe: boolean;
  labelPlacement?: SwipeAction["labelPlacement"];
}
const messages = ["Design review", "Travel plans", "Weekly notes"];
export function SwipeActionsStory({ disabled, fullSwipe, labelPlacement }: SwipeActionsStoryProps) {
  const [visible, setVisible] = useState(messages);
  const [flagged, setFlagged] = useState<string[]>([]);
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
                icon: <Archive width="100%" height="100%" />,
                labelPlacement,
                variant: "tint",
                fullSwipe,
                onAction: () => remove(name, "archived"),
              },
            ]}
            endActions={[
              {
                id: "flag",
                label: flagged.includes(name) ? "Unflag" : "Flag",
                icon: <Flag width="100%" height="100%" />,
                labelPlacement,
                onAction: () =>
                  setFlagged((rows) =>
                    rows.includes(name) ? rows.filter((row) => row !== name) : [...rows, name],
                  ),
              },
              {
                id: "delete",
                label: "Delete",
                icon: <TrashBin width="100%" height="100%" />,
                labelPlacement,
                variant: "danger",
                onAction: () => remove(name, "deleted"),
              },
            ]}
          >
            <List.Content>
              <List.Title>{name}</List.Title>
              <List.Description>
                {flagged.includes(name) ? "Flagged message" : "Demo message"}
              </List.Description>
            </List.Content>
          </SwipeActions>
        ))}
      </List>
      <output>{visible.length ? status : "Inbox is empty."}</output>
      <Button
        onClick={() => {
          setVisible(messages);
          setFlagged([]);
          setStatus("Inbox restored.");
        }}
      >
        Reset inbox
      </Button>
    </div>
  );
}
