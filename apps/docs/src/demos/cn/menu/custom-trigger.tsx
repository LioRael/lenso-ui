// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 custom-trigger, Apache-2.0; original avatar asset retained.
import { ArrowRightFromSquare, Gear, Persons } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Menu, MenuItem } from "@lenso/ui";
import { ActionItem, Popup, styles } from "../../en/menu/_shared";
const avatar = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg";
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
        <ActionItem label="仪表盘" />
        <ActionItem label="个人资料" />
        <Menu.Item label="设置">
          <div {...stylex.props(styles.itemRow)}>
            <MenuItem.Label>设置</MenuItem.Label>
            <Gear {...stylex.props(styles.smallIcon)} />
          </div>
        </Menu.Item>
        <Menu.Item label="新建项目">
          <div {...stylex.props(styles.itemRow)}>
            <MenuItem.Label>创建团队</MenuItem.Label>
            <Persons {...stylex.props(styles.smallIcon)} />
          </div>
        </Menu.Item>
        <Menu.Item label="退出登录" variant="danger">
          <div {...stylex.props(styles.itemRow)}>
            <MenuItem.Label>退出登录</MenuItem.Label>
            <ArrowRightFromSquare {...stylex.props(styles.smallDangerIcon)} />
          </div>
        </Menu.Item>
      </Popup>
    </Menu>
  );
}
