"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Alert, Button, CloseButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const styles = stylex.create({
  alert: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--warning) 20%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--warning) 30%, transparent)",
    },
    backgroundImage: {
      default:
        "linear-gradient(to bottom right in oklab, color-mix(in oklab, var(--warning) 10%, transparent), var(--surface), var(--surface-secondary))",
      ':is([data-theme="dark"] *)':
        "linear-gradient(to bottom right in oklab, color-mix(in oklab, var(--warning) 15%, transparent), var(--surface), color-mix(in oklab, var(--warning) 5%, transparent))",
    },
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
  glow: {
    pointerEvents: "none",
    position: "absolute",
    top: -32,
    right: -32,
    width: 112,
    height: 112,
    borderRadius: 9999,
    backgroundColor: {
      default: "color-mix(in oklab, var(--warning) 15%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--warning) 25%, transparent)",
    },
    filter: "blur(40px)",
  },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(s.maxXl)}>
      <Alert xstyle={styles.alert} status="warning">
        <div aria-hidden="true" {...stylex.props(styles.glow)} />
        <Alert.Indicator xstyle={[s.relative, s.warning]} />
        <Alert.Content xstyle={s.relative}>
          <Alert.Title>Payment method expires soon</Alert.Title>
          <Alert.Description>
            Your Visa ending in 4242 expires on March 28. Update billing to avoid interrupting your
            Pro subscription.
          </Alert.Description>
          <Button xstyle={s.mobile3} size="sm" variant="tertiary">
            Update billing
          </Button>
        </Alert.Content>
        <Button xstyle={s.desktopInline} size="sm" variant="tertiary">
          Update billing
        </Button>
        <CloseButton xstyle={s.relative} />
      </Alert>
    </div>
  );
}
