"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0. Native anchors supply real navigation.
import { Tabs } from "@lenso/ui";
import Link from "next/link";
import { styles } from "./source.stylex";
export function RenderFunction() {
  return (
    <Tabs
      defaultValue="getting-started"
      xstyle={styles.root}
      render={(props) => <div {...props} data-custom="foo" />}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Options">
          <Tabs.Tab
            value="getting-started"
            nativeButton={false}
            render={<Link href="/docs/react/getting-started" />}
          >
            Getting Started
          </Tabs.Tab>
          <Tabs.Tab
            value="components"
            nativeButton={false}
            render={<Link href="/docs/react/components" />}
          >
            Components
          </Tabs.Tab>
          <Tabs.Tab
            value="releases"
            nativeButton={false}
            render={<Link href="/docs/react/releases" />}
          >
            Releases
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel value="overview" xstyle={styles.panel}>
        <p>View your project overview and recent activity.</p>
      </Tabs.Panel>
      <Tabs.Panel value="analytics" xstyle={styles.panel}>
        <p>Track your metrics and analyze performance data.</p>
      </Tabs.Panel>
      <Tabs.Panel value="reports" xstyle={styles.panel}>
        <p>Generate and download detailed reports.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
