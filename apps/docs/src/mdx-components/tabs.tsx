"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Children, isValidElement, type ReactNode, type ReactElement } from "react";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  root: { marginBlock: 24, minWidth: 0 },
  list: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--border)",
  },
  tab: {
    color: { default: "var(--muted)", ":is([data-active])": "var(--foreground)" },
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingBlock: 12,
    paddingInline: 16,
    cursor: "pointer",
    font: "inherit",
    fontWeight: 500,
    outlineColor: "var(--focus)",
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: { default: "transparent", ":is([data-active])": "var(--accent)" },
  },
  panel: { paddingTop: 12, outlineColor: "var(--focus)" },
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
    <BaseTabs.Root
      defaultValue={defaultValue ?? panels[0]?.props.value ?? "0"}
      {...stylex.props(styles.root)}
    >
      <BaseTabs.List aria-label="Code examples" {...stylex.props(styles.list)}>
        {panels.map((panel, index) => (
          <BaseTabs.Tab
            key={index}
            value={panel.props.value ?? String(index)}
            {...stylex.props(styles.tab)}
          >
            {panel.props.title ?? items?.[index] ?? `Example ${index + 1}`}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {panels.map((panel, index) => (
        <BaseTabs.Panel
          key={index}
          value={panel.props.value ?? String(index)}
          {...stylex.props(styles.panel)}
        >
          {panel.props.children}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
