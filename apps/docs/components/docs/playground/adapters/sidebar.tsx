"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";

import { Sidebar } from "@lenso/primitives/sidebar";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter, PlaygroundTheme } from "../types";
import { stageStyles } from "./stage.stylex";
import { styles } from "./sidebar.stylex";

function SidebarPreview({ side, theme }: { side: "left" | "right"; theme: PlaygroundTheme }) {
  const [activeItem, setActiveItem] = useState<"overview" | "activity">("overview");

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
                    className={
                      stylex.props(styles.item, activeItem === "overview" && styles.selectedItem)
                        .className
                    }
                    onClick={() => setActiveItem("overview")}
                    selected={activeItem === "overview"}
                  >
                    Overview
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    className={
                      stylex.props(styles.item, activeItem === "activity" && styles.selectedItem)
                        .className
                    }
                    onClick={() => setActiveItem("activity")}
                    selected={activeItem === "activity"}
                  >
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
              {activeItem === "overview" ? "Workspace overview" : "Recent workspace activity"}
            </p>
          </Sidebar.Inset>
        </div>
      </Sidebar.Root>
    </ThemeScope>
  );
}

export const sidebarAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <SidebarPreview side={values.side === "right" ? "right" : "left"} theme={theme} />
);
