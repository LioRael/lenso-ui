"use client";
// content modified for Lenso UI.
import { GlassButton, Disclosure } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { nativeReferenceStyles as styles } from "../../en/disclosure/native-reference.stylex";

export function PreviewDisclosure({ composed = false }: { composed?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div {...stylex.props(styles.root)}>
      <Disclosure
        open={open}
        onOpenChange={setOpen}
        render={composed ? <div data-custom="foo" /> : undefined}
      >
        <Disclosure.Heading>
          <Disclosure.Trigger render={<GlassButton variant="default" />}>
            使用提示
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content
          render={composed ? (props) => <div {...props} data-custom="bar" /> : undefined}
        >
          <Disclosure.Body xstyle={styles.body}>
            <p {...stylex.props(styles.muted)}>使用键盘在控件之间移动，并按 Enter 或空格键操作。</p>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
export function RenderFunction() {
  return <PreviewDisclosure composed />;
}
