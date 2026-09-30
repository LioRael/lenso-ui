// Adapted from HeroUI v3.2.6 alert.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Alert, Button, CloseButton, Spinner } from "@lenso/ui";

const styles = stylex.create({
  examples: { display: "grid", width: "100%", maxWidth: 576, gap: 16 },
  mobileAction: {
    marginTop: 8,
    display: { default: "inline-flex", "@media (min-width: 640px)": "none" },
  },
  desktopAction: { display: { default: "none", "@media (min-width: 640px)": "block" } },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 8,
    listStylePosition: "inside",
    listStyleType: "disc",
    fontSize: 14,
  },
});
const meta = {
  title: "Components/Feedback/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        story:
          "Pinned source visual compositions. The source action buttons are presentation samples, not application workflows.",
      },
    },
  },
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;
const actions = [
  {
    status: "accent",
    title: "Update available",
    description:
      "A new version of the application is available. Please refresh to get the latest features and bug fixes.",
    action: "Refresh",
    variant: "primary",
  },
  {
    status: "success",
    title: "Payment successful",
    description:
      "Your payment of $49.99 has been processed. A confirmation email has been sent to your inbox.",
    action: "View Receipt",
    variant: "secondary",
  },
  {
    status: "warning",
    title: "Storage almost full",
    description:
      "You're using 90% of your storage quota. Consider upgrading your plan or removing unused files to avoid service interruption.",
    action: "Manage Storage",
    variant: "secondary",
  },
] as const;
export const Default: Story = {
  render: () => (
    <div {...stylex.props(styles.examples)}>
      <Alert>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>New features available</Alert.Title>
          <Alert.Description>
            Check out our latest updates including dark mode support and improved accessibility
            features.
          </Alert.Description>
        </Alert.Content>
      </Alert>
      {actions.map((item) => (
        <Alert key={item.status} status={item.status}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{item.title}</Alert.Title>
            <Alert.Description>{item.description}</Alert.Description>
            <Button xstyle={styles.mobileAction} size="sm" variant={item.variant}>
              {item.action}
            </Button>
          </Alert.Content>
          <Button xstyle={styles.desktopAction} size="sm" variant={item.variant}>
            {item.action}
          </Button>
        </Alert>
      ))}
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Unable to connect to server</Alert.Title>
          <Alert.Description>
            We're experiencing connection issues. Please try the following:
            <ul {...stylex.props(styles.steps)}>
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
            </ul>
          </Alert.Description>
          <Button xstyle={styles.mobileAction} size="sm" variant="danger">
            Retry
          </Button>
        </Alert.Content>
        <Button xstyle={styles.desktopAction} size="sm" variant="danger">
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
  ),
};
