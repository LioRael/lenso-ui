import * as stylex from "@stylexjs/stylex";
import { styles } from "@/styles/docs.stylex";

export function LocalInstallation() {
  return (
    <section aria-label="Local Lenso UI installation">
      <h2 {...stylex.props(styles.h2)}>Local runtime setup</h2>
      <p>
        Install the React components, compiled styles, and StyleX. This local derivation does not
        use the upstream Tailwind or HeroUI MCP installation flow.
      </p>
      <pre {...stylex.props(styles.pre)}>
        <code>pnpm add @lenso/ui @lenso/tokens @stylexjs/stylex</code>
      </pre>
      <p>Import the compiled stylesheet once in your application entry or root layout:</p>
      <pre {...stylex.props(styles.pre)}>
        <code>{`import "@lenso/tokens";`}</code>
      </pre>
      <p>Use native interaction contracts. For example:</p>
      <pre {...stylex.props(styles.pre)}>
        <code>{`"use client";\nimport { Button } from "@lenso/ui";\n\nexport function SaveButton() {\n  return <Button onClick={() => console.log("Save activated")}>Save</Button>;\n}`}</code>
      </pre>
      <p>
        Configure your bundler's StyleX compiler for authored overrides. This documentation app uses{" "}
        <code>next build --webpack</code> and <code>next dev --webpack</code> with{" "}
        <code>@stylexjs/unplugin</code>, with CSS layers disabled.
      </p>
      <pre {...stylex.props(styles.pre)}>
        <code>{`import * as stylex from "@stylexjs/stylex";\nimport { tokens } from "@lenso/tokens/tokens.stylex.const";\n\nconst styles = stylex.create({\n  panel: {\n    backgroundColor: tokens.surface,\n    color: tokens.surfaceForeground,\n    borderRadius: tokens.radius,\n    padding: 24,\n  },\n});`}</code>
      </pre>
      <p>
        Ordinary controls use <code>disabled</code>, <code>onClick</code>, and native Base UI value
        contracts. Date, time, and color controls retain their explicit local React Aria parts; use{" "}
        <code>DateField.Label</code>, <code>TimeField.Label</code>, or <code>ColorField.Label</code>{" "}
        rather than the ordinary Field label.
      </p>
      <h2 {...stylex.props(styles.h2)}>Pinned upstream reference</h2>
    </section>
  );
}
