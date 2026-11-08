"use client";
import { useState } from "react";
import { Notification, Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Comment } from "@gravity-ui/icons";
export interface NotificationStoryProps {
  stackCount: 1 | 2 | 3;
  preview?: boolean;
}
const styles = stylex.create({ image: { width: "100%", height: "100%", objectFit: "cover" } });
export function NotificationStory({ stackCount, preview = false }: NotificationStoryProps) {
  const [read, setRead] = useState(false);
  return (
    <Notification stackCount={stackCount}>
      <Notification.Trigger aria-label="Expand message from Alex">
        <Notification.Icon>
          <Comment width={30} height={30} />
        </Notification.Icon>
        <Notification.Content>
          <Notification.Title>Alex</Notification.Title>
          <Notification.Description>
            {read ? "Marked as read" : "Your photos are ready."}
          </Notification.Description>
        </Notification.Content>
        <Notification.Time dateTime="2026-10-29T10:00:00">now</Notification.Time>
      </Notification.Trigger>
      <Notification.Panel>
        {preview && (
          <Notification.Preview>
            <img
              src="/assets/demo/illustrations/landscape.svg"
              alt="Landscape illustration from the shared album"
              {...stylex.props(styles.image)}
            />
          </Notification.Preview>
        )}
        <Notification.Body>The shared album contains the photos from our trip.</Notification.Body>
        <Notification.Actions>
          <Button onClick={() => setRead(!read)}>{read ? "Mark unread" : "Mark read"}</Button>
        </Notification.Actions>
      </Notification.Panel>
    </Notification>
  );
}
