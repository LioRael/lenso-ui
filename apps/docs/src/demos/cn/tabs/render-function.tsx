"use client";

// Native anchors supply real navigation.
import { Tabs } from "@lenso/ui";
import Link from "fumadocs-core/link";
import { styles } from "../../en/tabs/source.stylex";
export function RenderFunction() {
  return (
    <Tabs
      defaultValue="getting-started"
      xstyle={styles.root}
      render={(props) => <div {...props} data-custom="foo" />}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="选项">
          <Tabs.Tab
            value="getting-started"
            nativeButton={false}
            render={<Link href="/docs/react/getting-started" />}
          >
            快速入门
          </Tabs.Tab>
          <Tabs.Tab
            value="components"
            nativeButton={false}
            render={<Link href="/docs/react/components" />}
          >
            组件
          </Tabs.Tab>
          <Tabs.Tab
            value="releases"
            nativeButton={false}
            render={<Link href="/docs/react/releases" />}
          >
            发布说明
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel value="overview" xstyle={styles.panel}>
        <p>查看项目概览与近期活动。</p>
      </Tabs.Panel>
      <Tabs.Panel value="analytics" xstyle={styles.panel}>
        <p>跟踪指标并分析性能数据。</p>
      </Tabs.Panel>
      <Tabs.Panel value="reports" xstyle={styles.panel}>
        <p>生成并下载详细报告。</p>
      </Tabs.Panel>
    </Tabs>
  );
}
