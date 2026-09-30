"use client";

// Adapted from HeroUI v3.2.6 tooltip-custom-trigger (Apache-2.0).
import { CircleCheckFill, CircleQuestion } from "@gravity-ui/icons";
import { Avatar, Chip, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { tokens } from "@lenso/tokens/tokens.stylex.const";

const ping = stylex.keyframes({
  "75%": { transform: "scale(2)", opacity: 0 },
  "100%": { transform: "scale(2)", opacity: 0 },
});
const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 24 },
  profile: { display: "flex", flexDirection: "column", gap: 0, paddingBlock: 4 },
  strong: { fontWeight: 600 },
  email: { fontSize: 12, color: tokens.muted },
  status: { display: "flex", alignItems: "center", gap: 6 },
  dot: { position: "relative", display: "flex", width: 8, height: 8 },
  pulse: {
    position: "absolute",
    display: "inline-flex",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: tokens.success,
    opacity: 0.75,
    animationName: { default: ping, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "1s",
    animationTimingFunction: "cubic-bezier(0, 0, .2, 1)",
    animationIterationCount: "infinite",
  },
  dotCenter: {
    position: "relative",
    display: "inline-flex",
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: tokens.success,
  },
  iconBackground: { borderRadius: "50%", backgroundColor: tokens.accentSoft, padding: 8 },
  icon: { color: tokens.accentSoftForeground },
  help: { maxWidth: 320, paddingInline: 4, paddingBlock: 6 },
  helpHeading: { marginBottom: 4, fontWeight: 600 },
  helpText: { fontSize: 14, color: tokens.muted },
});

export function TooltipCustomTrigger() {
  const avatarId = useId();
  const statusId = useId();
  const infoId = useId();
  return (
    <div {...stylex.props(styles.row)}>
      <Tooltip>
        <Tooltip.Trigger delay={0} aria-label="User avatar" aria-describedby={avatarId}>
          <Avatar size="sm">
            <Avatar.Image
              alt="Jane Doe"
              src="https://img.heroui.chat/image/avatar?w=400&h=400&u=4"
            />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={7}>
            <Tooltip.Popup id={avatarId}>
              <Tooltip.Arrow />
              <div {...stylex.props(styles.profile)}>
                <p {...stylex.props(styles.strong)}>Jane Doe</p>
                <p {...stylex.props(styles.email)}>jane@example.com</p>
              </div>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger delay={0} aria-label="Status chip" aria-describedby={statusId}>
          <Chip color="success">
            <CircleCheckFill width={12} />
            <Chip.Label>Active</Chip.Label>
          </Chip>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup id={statusId} xstyle={styles.status}>
              <span {...stylex.props(styles.dot)} aria-hidden="true">
                <span {...stylex.props(styles.pulse)} />
                <span {...stylex.props(styles.dotCenter)} />
              </span>
              <p>Jane is currently online</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger delay={0} aria-label="Info icon" aria-describedby={infoId}>
          <div {...stylex.props(styles.iconBackground)}>
            <CircleQuestion {...stylex.props(styles.icon)} />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={7}>
            <Tooltip.Popup id={infoId}>
              <Tooltip.Arrow />
              <div {...stylex.props(styles.help)}>
                <p {...stylex.props(styles.helpHeading)}>Help Information</p>
                <p {...stylex.props(styles.helpText)}>
                  This is a helpful tooltip with more detailed information about this feature.
                </p>
              </div>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
    </div>
  );
}
