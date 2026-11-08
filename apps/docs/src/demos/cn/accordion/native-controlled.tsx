"use client";
// content and interaction modified for Lenso UI.
import { ChevronDown, ChevronUp } from "@gravity-ui/icons";
import { GlassButton, Button, Accordion, Separator } from "@lenso/ui";
import { Fragment, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { nativeReferenceStyles as styles } from "../../en/accordion/native-reference.stylex";

export function NativeReferenceGroup({ withNavigation = true }: { withNavigation?: boolean }) {
  const [expanded, setExpanded] = useState<unknown[]>(["preview"]);
  const items = [
    { id: "preview", label: "使用提示", body: "使用键盘在控件之间移动，并按 Enter 或空格键操作。" },
    { id: "download", label: "主题与外观", body: "选择浅色或深色主题，让界面适合你的环境。" },
  ];
  const index = items.findIndex((item) => expanded.includes(item.id));
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(withNavigation ? styles.card : styles.basicCard)}>
        {withNavigation && (
          <div {...stylex.props(styles.heading)}>
            <h3 {...stylex.props(styles.title)}>界面指南</h3>
            <div {...stylex.props(styles.actions)}>
              <GlassButton
                aria-label="上一个折叠项"
                disabled={index <= 0}
                size="sm"
                onClick={() => setExpanded([items[index - 1]?.id])}
              >
                <GlassButton.Icon>
                  <ChevronUp />
                </GlassButton.Icon>
              </GlassButton>
              <GlassButton
                aria-label="下一个折叠项"
                disabled={index >= items.length - 1}
                size="sm"
                onClick={() => setExpanded([items[index + 1]?.id])}
              >
                <GlassButton.Icon>
                  <ChevronDown />
                </GlassButton.Icon>
              </GlassButton>
            </div>
          </div>
        )}
        <Accordion value={expanded} onValueChange={setExpanded}>
          {items.map((item, itemIndex) => (
            <Fragment key={item.id}>
              {itemIndex > 0 && <Separator xstyle={styles.separator} />}
              <Accordion.Item value={item.id} aria-label={item.label}>
                <Accordion.Heading>
                  <Accordion.Trigger
                    render={
                      <Button
                        variant={expanded.includes(item.id) ? "bordered" : "borderless"}
                        xstyle={[styles.trigger, !expanded.includes(item.id) && styles.closed]}
                      />
                    }
                  >
                    <span {...stylex.props(styles.label)}>{item.label}</span>
                    <Accordion.Indicator xstyle={styles.indicator} />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body xstyle={styles.body}>
                    <p {...stylex.props(styles.muted)}>{item.body}</p>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Fragment>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
export function Controlled() {
  return <NativeReferenceGroup />;
}
