import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

import { docsHeadingId } from "./heading";
import { styles } from "./guidance.stylex";

export function Guidance({ children }: { children: ReactNode }) {
  return <section {...stylex.props(styles.root)}>{children}</section>;
}

export function GuidanceBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <article {...stylex.props(styles.block)}>
      <h2 data-toc-heading id={docsHeadingId(title)} {...stylex.props(styles.title)}>
        {title}
      </h2>
      <div {...stylex.props(styles.content)}>{children}</div>
    </article>
  );
}
