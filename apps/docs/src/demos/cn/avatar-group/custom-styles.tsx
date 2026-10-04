// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// oxlint-disable jsx-a11y/prefer-tag-over-role -- AvatarGroup is a div-based visual group, not a form fieldset.
import { Person } from "@gravity-ui/icons";
import { Avatar, AvatarGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
import { users } from "../../en/avatar-group/users";
const styles = stylex.create({
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--border) 70%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--border) 80%, transparent)",
    },
    backgroundColor: {
      default: "color-mix(in oklab, var(--surface) 95%, transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab, var(--surface) 90%, transparent)",
    },
    paddingBlock: 4,
    paddingRight: 12,
    paddingLeft: 4,
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.04)",
      ':is([data-theme="dark"] *)':
        "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px rgb(255 255 255 / 0.1)",
    },
  },
  group: {
    "--avatar-group-overlap": "0.7rem",
    "--avatar-group-seam": "2px",
  },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(styles.pill)}>
      <AvatarGroup aria-label="指派人" xstyle={styles.group} overlap="clip" role="group" size="sm">
        {users.slice(0, 3).map((user) => (
          <Avatar key={user.id}>
            <Avatar.Image alt={user.name} src={user.image} />
            <Avatar.Fallback>
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </Avatar.Fallback>
          </Avatar>
        ))}
        <Avatar>
          <Avatar.Fallback>
            <Person {...stylex.props(s.icon4, s.shrink0)} />
          </Avatar.Fallback>
        </Avatar>
        <AvatarGroup.Count>+3</AvatarGroup.Count>
      </AvatarGroup>
      <span {...stylex.props(s.textSm, s.medium, s.foreground)}>指派人</span>
    </div>
  );
}
