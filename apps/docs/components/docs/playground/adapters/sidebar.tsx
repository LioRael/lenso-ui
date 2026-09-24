"use client";

import * as stylex from "@stylexjs/stylex";

import { Sidebar } from "@lenso/primitives/sidebar";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter } from "../types";
import { stageStyles } from "./stage.stylex";
import { styles } from "./sidebar.stylex";

export const sidebarAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const side = values.side === "right" ? "right" : "left";

  return (
    <ThemeScope theme={theme} xstyle={stageStyles.canvas}>
      <Sidebar.Root
        className={stylex.props(styles.root).className}
        defaultOpen
        key={side}
        side={side}
      >
        <div {...stylex.props(styles.frame, side === "right" && styles.rightFrame)}>
          <Sidebar.Panel
            aria-label="Workspace navigation"
            className={stylex.props(styles.panel, side === "right" && styles.rightPanel).className}
          >
            <Sidebar.Header className={stylex.props(styles.header).className}>
              WORKSPACE
            </Sidebar.Header>
            <Sidebar.Content className={stylex.props(styles.content).className}>
              <Sidebar.Menu className={stylex.props(styles.menu).className}>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    className={stylex.props(styles.item, styles.selectedItem).className}
                    selected
                  >
                    Overview
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item className={stylex.props(styles.item).className}>
                    Activity
                  </Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.Content>
          </Sidebar.Panel>
          <Sidebar.Inset className={stylex.props(styles.inset).className}>
            <Sidebar.Trigger className={stylex.props(styles.trigger).className}>
              Toggle sidebar
            </Sidebar.Trigger>
            <p {...stylex.props(styles.note)}>
              The primitive owns behavior; these styles belong to the example.
            </p>
          </Sidebar.Inset>
        </div>
      </Sidebar.Root>
    </ThemeScope>
  );
};
