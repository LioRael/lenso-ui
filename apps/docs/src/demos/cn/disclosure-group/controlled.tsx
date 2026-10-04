// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// React adaptation of HeroUI v3.2.6 (e385ac2), Apache-2.0. Native preview content is a reference, not an embedded Native runtime.
import { ChevronDown, ChevronUp, QrCode } from "@gravity-ui/icons";
import { Button, Disclosure, DisclosureGroup, Separator } from "@lenso/ui";
import { Icon } from "@iconify/react";
import { Fragment, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { nativeReferenceStyles as styles } from "../../en/disclosure-group/native-reference.stylex";
export function NativeReferenceGroup({ withNavigation = true }: { withNavigation?: boolean }) {
  const [expanded, setExpanded] = useState<unknown[]>(["preview"]);
  const ids = ["preview", "download"];
  const index = ids.findIndex((id) => expanded.includes(id));
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(withNavigation ? styles.card : styles.basicCard)}>
        {withNavigation && (
          <div {...stylex.props(styles.heading)}>
            <h3 {...stylex.props(styles.title)}>HeroUI Native</h3>
            <div {...stylex.props(styles.actions)}>
              <Button
                aria-label="上一个折叠项"
                disabled={index <= 0}
                size="sm"
                variant="secondary"
                onClick={() => setExpanded([ids[index - 1]])}
              >
                <Button.Icon>
                  <ChevronUp />
                </Button.Icon>
              </Button>
              <Button
                aria-label="下一个折叠项"
                disabled={index >= ids.length - 1}
                size="sm"
                variant="secondary"
                onClick={() => setExpanded([ids[index + 1]])}
              >
                <Button.Icon>
                  <ChevronDown />
                </Button.Icon>
              </Button>
            </div>
          </div>
        )}
        <DisclosureGroup value={expanded} onValueChange={setExpanded}>
          {ids.map((id, itemIndex) => (
            <Fragment key={id}>
              {itemIndex > 0 && <Separator xstyle={styles.separator} />}
              <Disclosure
                value={id}
                aria-label={id === "preview" ? "预览 HeroUI Native" : "下载 HeroUI Native"}
              >
                <Disclosure.Heading>
                  <Disclosure.Trigger
                    render={
                      <Button
                        variant={expanded.includes(id) ? "secondary" : "tertiary"}
                        xstyle={[styles.trigger, !expanded.includes(id) && styles.closed]}
                      />
                    }
                  >
                    <span {...stylex.props(styles.label)}>
                      <Button.Icon>
                        {id === "preview" ? <QrCode /> : <Icon icon="tabler:brand-apple-filled" />}
                      </Button.Icon>
                      {id === "preview"
                        ? "预览 HeroUI Native"
                        : withNavigation
                          ? "下载 HeroUI Native"
                          : "下载应用"}
                    </span>
                    <Disclosure.Indicator xstyle={styles.indicator} />
                  </Disclosure.Trigger>
                </Disclosure.Heading>
                <Disclosure.Content>
                  <Disclosure.Body xstyle={styles.body}>
                    <p {...stylex.props(styles.muted)}>
                      {id === "download" && !withNavigation
                        ? "下载 HeroUI Native 应用，即可在设备上直接体验我们的移动端组件。"
                        : "使用手机相机扫描此二维码，即可预览 HeroUI Native 组件。"}
                    </p>
                    <img
                      alt={
                        id === "download" && !withNavigation ? "App Store 二维码" : "Expo Go 二维码"
                      }
                      src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
                      {...stylex.props(styles.qr)}
                    />
                    <p {...stylex.props(styles.muted)}>
                      {id === "download" && !withNavigation
                        ? "支持 iOS 和 Android 设备。"
                        : "设备需已安装 Expo。"}
                    </p>
                    <Button variant="primary" xstyle={styles.action}>
                      <Button.Icon>
                        <Icon
                          icon={id === "preview" ? "logos:expo-icon" : "tabler:brand-apple-filled"}
                          {...stylex.props(id === "preview" && styles.expo)}
                        />
                      </Button.Icon>
                      {id === "preview" ? "在 Expo Go 预览" : "在 App Store 下载"}
                    </Button>
                  </Disclosure.Body>
                </Disclosure.Content>
              </Disclosure>
            </Fragment>
          ))}
        </DisclosureGroup>
      </div>
    </div>
  );
}
export function Controlled() {
  return <NativeReferenceGroup />;
}
