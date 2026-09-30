"use client";
// React adaptation of HeroUI v3.2.6 (e385ac2), Apache-2.0. Native preview content is a reference, not an embedded Native runtime.
import { ChevronDown, ChevronUp, QrCode } from "@gravity-ui/icons";
import { Button, Disclosure, DisclosureGroup, Separator } from "@lenso/ui";
import { Icon } from "@iconify/react";
import { Fragment, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { nativeReferenceStyles as styles } from "./native-reference.stylex";
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
                aria-label="Previous disclosure"
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
                aria-label="Next disclosure"
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
                aria-label={id === "preview" ? "Preview HeroUI Native" : "Download HeroUI Native"}
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
                        ? "Preview HeroUI Native"
                        : withNavigation
                          ? "Download HeroUI Native"
                          : "Download App"}
                    </span>
                    <Disclosure.Indicator xstyle={styles.indicator} />
                  </Disclosure.Trigger>
                </Disclosure.Heading>
                <Disclosure.Content>
                  <Disclosure.Body xstyle={styles.body}>
                    <p {...stylex.props(styles.muted)}>
                      {id === "download" && !withNavigation
                        ? "Download the HeroUI native app to explore our mobile components directly on your device."
                        : "Scan this QR code with your camera app to preview the HeroUI native components."}
                    </p>
                    <img
                      alt={
                        id === "download" && !withNavigation
                          ? "App Store QR Code"
                          : "Expo Go QR Code"
                      }
                      src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
                      {...stylex.props(styles.qr)}
                    />
                    <p {...stylex.props(styles.muted)}>
                      {id === "download" && !withNavigation
                        ? "Available on iOS and Android devices."
                        : "Expo must be installed on your device."}
                    </p>
                    <Button variant="primary" xstyle={styles.action}>
                      <Button.Icon>
                        <Icon
                          icon={id === "preview" ? "logos:expo-icon" : "tabler:brand-apple-filled"}
                          {...stylex.props(id === "preview" && styles.expo)}
                        />
                      </Button.Icon>
                      {id === "preview" ? "Preview on Expo Go" : "Download on App Store"}
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
