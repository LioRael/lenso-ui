"use client";
import { useState } from "react";
import { EmptyState, GlassButton } from "@lenso/ui";
import { Tray } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
export interface EmptyStateStoryProps {
  variant: "symbol" | "circle" | "text";
  title: string;
  description: string;
  withAction: boolean;
}
const styles = stylex.create({
  root: { maxWidth: 402, minHeight: 360 },
  action: { minHeight: 52 },
});
export function EmptyStateStory({ variant, title, description, withAction }: EmptyStateStoryProps) {
  const [created, setCreated] = useState(false);
  return (
    <EmptyState xstyle={styles.root}>
      <EmptyState.Content>
        {variant !== "text" && (
          <EmptyState.Icon variant={variant}>
            <Tray width="1em" height="1em" aria-hidden="true" />
          </EmptyState.Icon>
        )}
        <EmptyState.Message>
          <EmptyState.Title>{created ? "Collection created" : title}</EmptyState.Title>
          <EmptyState.Description>
            {created ? "Your new collection is ready." : description}
          </EmptyState.Description>
        </EmptyState.Message>
      </EmptyState.Content>
      {withAction && (
        <EmptyState.Actions>
          <GlassButton fullWidth xstyle={styles.action} onClick={() => setCreated(!created)}>
            {created ? "Reset example" : "Create collection"}
          </GlassButton>
        </EmptyState.Actions>
      )}
    </EmptyState>
  );
}
