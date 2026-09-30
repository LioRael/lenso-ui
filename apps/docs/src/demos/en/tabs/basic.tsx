"use client";

import { Tabs } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ root: { width: "100%", maxWidth: 448 }, panel: { paddingTop: 16 } });
export function Basic() {
  return (
    <Tabs defaultValue="overview" xstyle={styles.root}>
      <Tabs.ListContainer>
        <Tabs.List activateOnFocus aria-label="Options">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="analytics">Analytics</Tabs.Tab>
          <Tabs.Tab value="reports">Reports</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel xstyle={styles.panel} value="overview">
        <p>View your project overview and recent activity.</p>
      </Tabs.Panel>
      <Tabs.Panel xstyle={styles.panel} value="analytics">
        <p>Track your metrics and analyze performance data.</p>
      </Tabs.Panel>
      <Tabs.Panel xstyle={styles.panel} value="reports">
        <p>Generate and download detailed reports.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
