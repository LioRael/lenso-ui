import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

import { styles } from "./live-playground.stylex";

export type PlaygroundLayout = "command-menu" | "default" | "sidebar" | "template";

interface LivePlaygroundProps {
  actions?: ReactNode;
  controls: ReactNode;
  layout?: PlaygroundLayout;
  preview: ReactNode;
  theme: "dark" | "light";
  title?: string;
}

export function LivePlayground({
  actions,
  controls,
  layout = "default",
  preview,
  theme,
  title = "Live playground",
}: LivePlaygroundProps) {
  return (
    <section {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.heading)}>
        <h2 {...stylex.props(styles.title)}>{title}</h2>
        {actions && <div {...stylex.props(styles.actions)}>{actions}</div>}
      </div>
      <div
        {...stylex.props(
          styles.body,
          layout === "template" && styles.templateBody,
          layout === "sidebar" && styles.sidebarBody,
          layout === "command-menu" && styles.commandMenuBody,
        )}
      >
        <article
          data-theme={theme}
          {...stylex.props(
            styles.stage,
            layout === "template" && styles.templateStage,
            layout === "sidebar" && styles.sidebarStage,
            layout === "command-menu" && styles.commandMenuStage,
          )}
        >
          {preview}
        </article>
        <aside
          aria-label="Playground controls"
          {...stylex.props(
            styles.inspector,
            layout === "template" && styles.templateInspector,
            layout === "sidebar" && styles.sidebarInspector,
            layout === "command-menu" && styles.commandMenuInspector,
          )}
        >
          {controls}
        </aside>
      </div>
    </section>
  );
}
