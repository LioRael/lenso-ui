"use client";
import { useState } from "react";
import { EmptyState, Button, Description } from "@lenso/ui";
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
      <div>
        {variant !== "text" && (
          <span data-variant={variant}>
            <Tray width="1em" height="1em" aria-hidden="true" />
          </span>
        )}
        <div>
          <h3>{created ? "Collection created" : title}</h3>
          <Description>{created ? "Your new collection is ready." : description}</Description>
        </div>
      </div>
      {withAction && (
        <div>
          <Button fullWidth xstyle={styles.action} onClick={() => setCreated(!created)}>
            {created ? "Reset example" : "Create collection"}
          </Button>
        </div>
      )}
    </EmptyState>
  );
}
