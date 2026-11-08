"use client";
// content modified for Lenso UI.
import { GlassButton, Disclosure } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { nativeReferenceStyles as styles } from "./native-reference.stylex";

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
            Getting started
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content
          render={composed ? (props) => <div {...props} data-custom="bar" /> : undefined}
        >
          <Disclosure.Body xstyle={styles.body}>
            <p {...stylex.props(styles.muted)}>
              Use the keyboard to move between controls, then press Enter or Space to activate them.
            </p>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
export function RenderFunction() {
  return <PreviewDisclosure composed />;
}
