"use client";

// original avatar asset retained.
import { ArrowRightFromSquare, Gear, Persons } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Menu } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

const avatar = "/assets/demo/avatars/orange.svg";

export function CustomTrigger() {
  return (
    <Menu>
      <Menu.Trigger xstyle={styles.round} aria-label="Account menu">
        <Avatar>
          <Avatar.Image alt="Junior Garcia" src={avatar} />
          <Avatar.Fallback delay={600}>JD</Avatar.Fallback>
        </Avatar>
      </Menu.Trigger>
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
        <Menu.Item label="Settings">
          <div {...stylex.props(styles.itemRow)}>
            <Menu.Item.Label>Settings</Menu.Item.Label>
            <Gear {...stylex.props(styles.smallIcon)} />
          </div>
        </Menu.Item>
        <Menu.Item label="New project">
          <div {...stylex.props(styles.itemRow)}>
            <Menu.Item.Label>Create Team</Menu.Item.Label>
            <Persons {...stylex.props(styles.smallIcon)} />
          </div>
        </Menu.Item>
        <Menu.Item label="Logout" variant="danger">
          <div {...stylex.props(styles.itemRow)}>
            <Menu.Item.Label>Log Out</Menu.Item.Label>
            <ArrowRightFromSquare {...stylex.props(styles.smallDangerIcon)} />
          </div>
        </Menu.Item>
      </Popup>
    </Menu>
  );
}
