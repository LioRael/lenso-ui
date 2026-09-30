"use client";

// Adapted from HeroUI v3.2.6 custom-trigger, Apache-2.0; original avatar asset retained.
import { ArrowRightFromSquare, Gear, Persons } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Dropdown, MenuItem } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

const avatar = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg";

export function CustomTrigger() {
  return (
    <Dropdown>
      <Dropdown.Trigger xstyle={styles.round} aria-label="Account menu">
        <Avatar>
          <Avatar.Image alt="Junior Garcia" src={avatar} />
          <Avatar.Fallback delay={600}>JD</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Popup>
        <div {...stylex.props(styles.profile)}>
          <div {...stylex.props(styles.profileRow)}>
            <Avatar size="sm">
              <Avatar.Image alt="Jane" src={avatar} />
              <Avatar.Fallback delay={600}>JD</Avatar.Fallback>
            </Avatar>
            <div {...stylex.props(styles.text)}>
              <p {...stylex.props(styles.profileName)}>Jane Doe</p>
              <p {...stylex.props(styles.profileEmail)}>jane@example.com</p>
            </div>
          </div>
        </div>
        <ActionItem label="Dashboard" />
        <ActionItem label="Profile" />
        <Dropdown.Item label="Settings">
          <div {...stylex.props(styles.itemRow)}>
            <MenuItem.Label>Settings</MenuItem.Label>
            <Gear {...stylex.props(styles.smallIcon)} />
          </div>
        </Dropdown.Item>
        <Dropdown.Item label="New project">
          <div {...stylex.props(styles.itemRow)}>
            <MenuItem.Label>Create Team</MenuItem.Label>
            <Persons {...stylex.props(styles.smallIcon)} />
          </div>
        </Dropdown.Item>
        <Dropdown.Item label="Logout" variant="danger">
          <div {...stylex.props(styles.itemRow)}>
            <MenuItem.Label>Log Out</MenuItem.Label>
            <ArrowRightFromSquare {...stylex.props(styles.smallDangerIcon)} />
          </div>
        </Dropdown.Item>
      </Popup>
    </Dropdown>
  );
}
