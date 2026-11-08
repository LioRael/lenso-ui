"use client";
import { useState } from "react";
import { ListLibrary } from "../shared/list-library";
import { List, Switch } from "@lenso/ui";
export interface ListStoryProps {
  tall: boolean;
  interactive?: boolean;
}
export function ListStory({ tall, interactive }: ListStoryProps) {
  const [wifi, setWifi] = useState(true);
  if (interactive) return <ListLibrary />;
  return (
    <List style={{ width: 300, maxWidth: "100%" }} aria-label="Network settings">
      <List.Item height={tall ? "tall" : "regular"}>
        <List.Content>
          <List.Title>Wi-Fi</List.Title>
          {tall && <List.Description>Connect to nearby networks</List.Description>}
        </List.Content>
        <List.Trailing>
          <Switch aria-label="Wi-Fi" checked={wifi} onCheckedChange={setWifi}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </List.Trailing>
      </List.Item>
      <List.Separator />
      <List.Item height="tall">
        <List.Content>
          <List.Title>Current network</List.Title>
          <List.Description>{wifi ? "Studio" : "Not connected"}</List.Description>
        </List.Content>
      </List.Item>
    </List>
  );
}
