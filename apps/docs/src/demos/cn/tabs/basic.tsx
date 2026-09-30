// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Tabs } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: "100%",
    maxWidth: 448,
  },
  panel: {
    paddingTop: 16,
  },
});
export function Basic() {
  return (
    <Tabs defaultValue="overview" xstyle={styles.root}>
      <Tabs.ListContainer>
        <Tabs.List aria-label="选项">
          <Tabs.Tab value="overview">概览</Tabs.Tab>
          <Tabs.Tab value="analytics">分析</Tabs.Tab>
          <Tabs.Tab value="reports">报告</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel xstyle={styles.panel} value="overview">
        <p>查看项目概览与近期活动。</p>
      </Tabs.Panel>
      <Tabs.Panel xstyle={styles.panel} value="analytics">
        <p>跟踪指标并分析性能数据。</p>
      </Tabs.Panel>
      <Tabs.Panel xstyle={styles.panel} value="reports">
        <p>生成并下载详细报告。</p>
      </Tabs.Panel>
    </Tabs>
  );
}
