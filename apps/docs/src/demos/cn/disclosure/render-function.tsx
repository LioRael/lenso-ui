// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// React adaptation of HeroUI v3.2.6 (e385ac2), Apache-2.0. Native preview content is a reference, not an embedded Native runtime.
import { QrCode } from "@gravity-ui/icons";
import { Button, Disclosure } from "@lenso/ui";
import { Icon } from "@iconify/react";
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
          <Disclosure.Trigger render={<Button variant="secondary" />}>
            <Button.Icon>
              <QrCode />
            </Button.Icon>
            预览 HeroUI Native
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content
          render={composed ? (props) => <div {...props} data-custom="bar" /> : undefined}
        >
          <Disclosure.Body xstyle={styles.body}>
            <p {...stylex.props(styles.muted)}>
              使用手机相机扫描此二维码，即可预览 HeroUI Native 组件。
            </p>
            <img
              alt="Expo Go 二维码"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
              {...stylex.props(styles.qr)}
            />
            <p {...stylex.props(styles.muted)}>设备需已安装 Expo。</p>
            <Button variant="primary" xstyle={styles.action}>
              <Button.Icon>
                <Icon icon="tabler:brand-apple-filled" />
              </Button.Icon>
              在 App Store 下载
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
