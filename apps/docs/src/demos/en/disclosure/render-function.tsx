"use client";
// React adaptation of HeroUI v3.2.6 (e385ac2), Apache-2.0. Native preview content is a reference, not an embedded Native runtime.
import { QrCode } from "@gravity-ui/icons";
import { Button, Disclosure } from "@lenso/ui";
import { Icon } from "@iconify/react";
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
          <Disclosure.Trigger render={<Button variant="secondary" />}>
            <Button.Icon>
              <QrCode />
            </Button.Icon>
            Preview HeroUI Native
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content
          render={composed ? (props) => <div {...props} data-custom="bar" /> : undefined}
        >
          <Disclosure.Body xstyle={styles.body}>
            <p {...stylex.props(styles.muted)}>
              Scan this QR code with your camera app to preview the HeroUI native components.
            </p>
            <img
              alt="Expo Go QR Code"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
              {...stylex.props(styles.qr)}
            />
            <p {...stylex.props(styles.muted)}>Expo must be installed on your device.</p>
            <Button variant="primary" xstyle={styles.action}>
              <Button.Icon>
                <Icon icon="tabler:brand-apple-filled" />
              </Button.Icon>
              Download on App Store
            </Button>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
export function RenderFunction() {
  return <PreviewDisclosure composed />;
}
