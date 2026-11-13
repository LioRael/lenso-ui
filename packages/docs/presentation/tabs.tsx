"use client";

import { Tabs as LensoTabs } from "@lenso/ui/tabs";
import { Children, isValidElement, type ReactNode, type ReactElement } from "react";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  root: { marginBlock: 24, minWidth: 0 },
  panel: { paddingTop: 12, outlineColor: "var(--lenso-focus-ring)" },
});
interface TabProps {
  title?: string;
  value?: string;
  children?: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

export function Tabs({
  children,
  items,
  defaultValue,
}: {
  children?: ReactNode;
  items?: string[];
  defaultValue?: string;
}) {
  const panels = Children.toArray(children).filter(isValidElement) as ReactElement<TabProps>[];
  return (
    <LensoTabs defaultValue={defaultValue ?? panels[0]?.props.value ?? "0"} xstyle={styles.root}>
      <LensoTabs.ListContainer>
        <LensoTabs.List aria-label="Code examples">
          {panels.map((panel, index) => (
            <LensoTabs.Tab key={index} value={panel.props.value ?? String(index)}>
              {panel.props.title ?? items?.[index] ?? `Example ${index + 1}`}
            </LensoTabs.Tab>
          ))}
          <LensoTabs.Indicator />
        </LensoTabs.List>
      </LensoTabs.ListContainer>
      {panels.map((panel, index) => (
        <LensoTabs.Panel
          key={index}
          value={panel.props.value ?? String(index)}
          xstyle={styles.panel}
        >
          {panel.props.children}
        </LensoTabs.Panel>
      ))}
    </LensoTabs>
  );
}
