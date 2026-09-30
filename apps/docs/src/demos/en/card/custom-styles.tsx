"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Check, Star } from "@gravity-ui/icons";
import { Button, Card } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

const PRO_FEATURES = [
  "Unlimited projects and collaborators",
  "Priority support with 24h response",
  "Advanced analytics and exports",
] as const;
const styles = stylex.create({
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 448,
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--accent) 20%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--accent) 30%, transparent)",
    },
    backgroundImage: {
      default:
        "linear-gradient(to bottom right in oklab, color-mix(in oklab, var(--accent) 12%, transparent), var(--surface), var(--surface-secondary))",
      ':is([data-theme="dark"] *)':
        "linear-gradient(to bottom right in oklab, color-mix(in oklab, var(--accent) 20%, transparent), var(--surface), color-mix(in oklab, var(--accent) 8%, transparent))",
    },
    boxShadow: {
      default:
        "0 10px 15px -3px color-mix(in oklab, var(--accent) 10%, transparent), 0 4px 6px -4px color-mix(in oklab, var(--accent) 10%, transparent)",
      ':is([data-theme="dark"] *)':
        "0 10px 15px -3px color-mix(in oklab, var(--accent) 5%, transparent), 0 4px 6px -4px color-mix(in oklab, var(--accent) 5%, transparent)",
    },
  },
  topGlow: {
    pointerEvents: "none",
    position: "absolute",
    top: -48,
    right: -48,
    width: 160,
    height: 160,
    borderRadius: 9999,
    filter: "blur(64px)",
    backgroundColor: {
      default: "color-mix(in oklab, var(--accent) 20%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--accent) 30%, transparent)",
    },
  },
  bottomGlow: {
    pointerEvents: "none",
    position: "absolute",
    bottom: -32,
    left: -32,
    width: 112,
    height: 112,
    borderRadius: 9999,
    filter: "blur(40px)",
    backgroundColor: {
      default: "color-mix(in oklab, var(--accent) 10%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--accent) 20%, transparent)",
    },
  },
  recommended: {
    width: "fit-content",
    borderRadius: 9999,
    paddingInline: 10,
    paddingBlock: 2,
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 500,
    letterSpacing: "0.025em",
    backgroundColor: {
      default: "color-mix(in oklab, var(--accent) 15%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--accent) 25%, transparent)",
    },
    color: {
      default: "var(--accent)",
      ':is([data-theme="dark"] *)': "var(--accent-soft-foreground)",
    },
  },
  star: {
    display: "flex",
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: {
      default: "color-mix(in oklab, var(--accent) 15%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--accent) 20%, transparent)",
    },
    color: {
      default: "var(--accent)",
      ':is([data-theme="dark"] *)': "var(--accent-soft-foreground)",
    },
  },
  footer: {
    position: "relative",
    flexDirection: { default: "column", "@media (min-width: 640px)": "row" },
    gap: 8,
  },
  upgrade: {
    width: "100%",
    boxShadow:
      "0 4px 6px -1px color-mix(in oklab, var(--accent) 20%, transparent), 0 2px 4px -2px color-mix(in oklab, var(--accent) 20%, transparent)",
  },
});
export function CustomStyles() {
  return (
    <Card xstyle={styles.card}>
      <div aria-hidden="true" {...stylex.props(styles.topGlow)} />
      <div aria-hidden="true" {...stylex.props(styles.bottomGlow)} />
      <Card.Header xstyle={[s.relative, s.gap3]}>
        <span {...stylex.props(styles.recommended)}>Recommended</span>
        <div {...stylex.props(s.startRow3)}>
          <div {...stylex.props(styles.star)}>
            <Star aria-hidden="true" {...stylex.props(s.icon5)} />
          </div>
          <div {...stylex.props(s.column1)}>
            <Card.Title>Upgrade to Pro</Card.Title>
            <Card.Description>
              Unlock team workflows and insights built for growing products.
            </Card.Description>
          </div>
        </div>
      </Card.Header>
      <Card.Content xstyle={s.relative}>
        <ul {...stylex.props(s.column2)}>
          {PRO_FEATURES.map((feature) => (
            <li key={feature} {...stylex.props(s.row2, s.textSm, s.muted)}>
              <Check aria-hidden="true" {...stylex.props(s.icon4, s.shrink0, s.accent)} />
              {feature}
            </li>
          ))}
        </ul>
      </Card.Content>
      <Card.Footer xstyle={styles.footer}>
        <Button xstyle={styles.upgrade}>Upgrade now</Button>
        <Button xstyle={s.full} variant="secondary">
          Compare plans
        </Button>
      </Card.Footer>
    </Card>
  );
}
