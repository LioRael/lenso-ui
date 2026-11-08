"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface AlertStoryProps extends Pick<StoryComponentProps<typeof Alert>, "status"> {}
export const initialArgs: AlertStoryProps = /* story-args:start */ {
  status: "default",
}; /* story-args:end */

import { Alert, Button, CloseButton, Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../en/card/display.stylex";

export function Basic(overrides: AlertStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(s.alertStack)}>
      <Alert {...args}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>New features available</Alert.Title>
          <Alert.Description>
            Check out our latest updates including dark mode support and improved accessibility
            features.
          </Alert.Description>
        </Alert.Content>
      </Alert>
      <Alert status="accent">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Update available</Alert.Title>
          <Alert.Description>
            A new version of the application is available. Please refresh to get the latest features
            and bug fixes.
          </Alert.Description>
          <Button xstyle={s.mobile2} size="sm" variant="prominent">
            Refresh
          </Button>
        </Alert.Content>
        <Button xstyle={s.desktopBlock} size="sm" variant="prominent">
          Refresh
        </Button>
      </Alert>
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Unable to connect to server</Alert.Title>
          <Alert.Description>
            We're experiencing connection issues. Please try the following:
            <ul {...stylex.props(s.list)}>
              <li>Check your internet connection</li>
              <li {...stylex.props(s.space1)}>Refresh the page</li>
              <li {...stylex.props(s.space1)}>Clear your browser cache</li>
            </ul>
          </Alert.Description>
          <Button destructive xstyle={s.mobile2} size="sm" variant="prominent">
            Retry
          </Button>
        </Alert.Content>
        <Button destructive xstyle={s.desktopBlock} size="sm" variant="prominent">
          Retry
        </Button>
      </Alert>
      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Profile updated successfully</Alert.Title>
        </Alert.Content>
        <CloseButton />
      </Alert>
      <Alert status="accent">
        <Alert.Indicator>
          <Spinner size="sm" />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Processing your request</Alert.Title>
          <Alert.Description>
            Please wait while we sync your data. This may take a few moments.
          </Alert.Description>
        </Alert.Content>
      </Alert>
      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Scheduled maintenance</Alert.Title>
          <Alert.Description>
            Our services will be unavailable on Sunday, March 15th from 2:00 AM to 6:00 AM UTC for
            scheduled maintenance.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}
