import * as stylex from "@stylexjs/stylex";
import type { BundledLanguage } from "shiki/bundle/web";

import { CodeBlock } from "./code-block";
import { docsHeadingId } from "./heading";
import { styles } from "./code-example.stylex";

export function CodeExample({
  code,
  description = "Compose the component from its public parts and keep application content consumer-owned.",
  language = "tsx",
  title = "Implementation",
}: {
  code: string;
  description?: string;
  language?: BundledLanguage;
  title?: string;
}) {
  return (
    <section {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.heading)}>
        <h2 data-toc-heading id={docsHeadingId(title)} {...stylex.props(styles.title)}>
          {title}
        </h2>
        <p {...stylex.props(styles.description)}>{description}</p>
      </div>
      <CodeBlock code={code} language={language} />
    </section>
  );
}
