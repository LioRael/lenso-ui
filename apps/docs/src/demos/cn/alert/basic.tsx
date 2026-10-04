// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Alert, Button, CloseButton, Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function Basic() {
  return (
    <div {...stylex.props(s.alertStack)}>
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
          <Button xstyle={s.mobile2} size="sm" variant="primary">
            刷新
          </Button>
        </Alert.Content>
        <Button xstyle={s.desktopBlock} size="sm" variant="primary">
          刷新
        </Button>
      </Alert>
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>无法连接到服务器</Alert.Title>
          <Alert.Description>
            当前遇到连接问题，请尝试以下操作：
            <ul {...stylex.props(s.list)}>
              <li>检查网络连接</li>
              <li {...stylex.props(s.space1)}>刷新页面</li>
              <li {...stylex.props(s.space1)}>清除浏览器缓存</li>
            </ul>
          </Alert.Description>
          <Button xstyle={s.mobile2} size="sm" variant="danger">
            重试
          </Button>
        </Alert.Content>
        <Button xstyle={s.desktopBlock} size="sm" variant="danger">
          重试
        </Button>
      </Alert>
      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>个人资料已更新</Alert.Title>
        </Alert.Content>
        <CloseButton />
      </Alert>
      <Alert status="accent">
        <Alert.Indicator>
          <Spinner size="sm" />
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
            我们将于 UTC 时间 3 月 15 日（周日）凌晨 2:00 至上午 6:00
            进行计划维护，期间服务将暂时不可用。
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}
