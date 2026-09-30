// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Alert, Button, Spinner } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  grid: {
    display: "grid",
    width: "100%",
    maxWidth: 576,
    gap: 16,
  },
});
export function Basic() {
  const [attempts, setAttempts] = useState(0);
  return (
    <div {...stylex.props(styles.grid)}>
      <Alert>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>新功能已上线</Alert.Title>
          <Alert.Description>
            查看我们的最新更新，包括深色模式支持与改进的无障碍体验。
          </Alert.Description>
        </Alert.Content>
      </Alert>
      <Alert status="accent">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>有可用更新</Alert.Title>
          <Alert.Description>
            应用有新版本可用。请刷新页面以获取最新功能与问题修复。
          </Alert.Description>
        </Alert.Content>
        <Button size="sm" onClick={() => window.location.reload()}>
          刷新
        </Button>
      </Alert>
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>无法连接到服务器</Alert.Title>
          <Alert.Description>
            We're experiencing connection issues. Check your internet connection or refresh the
            page.
          </Alert.Description>
          {attempts > 0 && (
            <output>
              Retry activated {attempts} time{attempts === 1 ? "" : "s"} in this demonstration.
            </output>
          )}
        </Alert.Content>
        <Button size="sm" variant="danger" onClick={() => setAttempts((value) => value + 1)}>
          重试
        </Button>
      </Alert>
      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>个人资料已更新</Alert.Title>
        </Alert.Content>
      </Alert>
      <Alert status="accent">
        <Alert.Indicator>
          <Spinner size="sm" aria-label="Processing" />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>正在处理你的请求</Alert.Title>
          <Alert.Description>正在同步你的数据，请稍候，这可能需要一点时间。</Alert.Description>
        </Alert.Content>
      </Alert>
      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>计划维护</Alert.Title>
          <Alert.Description>
            Our services will be unavailable during the scheduled maintenance window.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}
