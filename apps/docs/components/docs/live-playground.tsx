import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

import { styles } from "./live-playground.stylex";

export type PlaygroundLayout = "command-menu" | "data" | "default" | "sidebar" | "template";

const bodyStyles = {
  "command-menu": styles.commandMenuBody,
  data: styles.dataBody,
  default: null,
  sidebar: styles.sidebarBody,
  template: styles.templateBody,
} as const;

const stageStyles = {
  "command-menu": styles.commandMenuStage,
  data: styles.dataStage,
  default: null,
  sidebar: styles.sidebarStage,
  template: styles.templateStage,
} as const;

const inspectorStyles = {
  "command-menu": styles.commandMenuInspector,
  data: styles.dataInspector,
  default: null,
  sidebar: styles.sidebarInspector,
  template: styles.templateInspector,
} as const;

interface LivePlaygroundProps {
  actions?: ReactNode;
  controls?: ReactNode;
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
          bodyStyles[layout],
          layout === "data" && Boolean(controls) && styles.dataBodyWithControls,
        )}
      >
        <article data-theme={theme} {...stylex.props(styles.stage, stageStyles[layout])}>
          {preview}
        </article>
        {controls && (
          <aside
            aria-label="Playground controls"
            {...stylex.props(styles.inspector, inspectorStyles[layout])}
          >
            {controls}
          </aside>
        )}
      </div>
    </section>
  );
}
