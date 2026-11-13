"use client";

import type { ComponentType, SVGProps } from "react";
import { Bars, Bell, Envelope, Gear, House, Magnifier, Person } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
export function Navigation() {
  const navItems: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
  }[] = [
    {
      icon: House,
      label: "首页",
    },
    {
      icon: Magnifier,
      label: "搜索",
    },
    {
      icon: Bell,
      label: "通知",
    },
    {
      icon: Envelope,
      label: "消息",
    },
    {
      icon: Person,
      label: "个人资料",
    },
    {
      icon: Gear,
      label: "设置",
    },
  ];
  return (
    <Drawer side="left">
      <Drawer.Trigger render={<Button />}>
        <Button.Icon>
          <Bars />
        </Button.Icon>
        菜单
      </Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Content>
        <Drawer.Layout>
          <Drawer.Close aria-label="Close drawer" />
          <Drawer.Header>
            <Drawer.Title>导航</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <nav {...stylex.props(styles.navigation)}>
              {navItems.map((item) => (
                <button key={item.label} {...stylex.props(styles.navButton)} type="button">
                  <item.icon {...stylex.props(styles.icon)} />
                  {item.label}
                </button>
              ))}
            </nav>
          </Drawer.Body>
        </Drawer.Layout>
      </Drawer.Content>
    </Drawer>
  );
}
