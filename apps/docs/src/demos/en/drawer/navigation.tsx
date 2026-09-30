"use client";

// Adapted from HeroUI v3.2.6 drawer-navigation (Apache-2.0).
import type { ComponentType, SVGProps } from "react";
import { Bars, Bell, Envelope, Gear, House, Magnifier, Person } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer } from "@lenso/ui";
import { styles } from "./styles";

export function Navigation() {
  const navItems: { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string }[] = [
    { icon: House, label: "Home" },
    { icon: Magnifier, label: "Search" },
    { icon: Bell, label: "Notifications" },
    { icon: Envelope, label: "Messages" },
    { icon: Person, label: "Profile" },
    { icon: Gear, label: "Settings" },
  ];
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="left">
        <Drawer.Trigger render={<Button variant="secondary" />}>
          <Button.Icon>
            <Bars />
          </Button.Icon>
          Menu
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Close
                  aria-label="Close drawer"
                  render={
                    <Button isIconOnly size="sm" variant="tertiary" xstyle={styles.cornerClose} />
                  }
                >
                  <CloseIcon />
                </Drawer.Close>
                <Drawer.Header>
                  <Drawer.Title>Navigation</Drawer.Title>
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
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
