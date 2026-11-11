"use client";
import { lazy } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { BenchLink, Counter, useScope } from "./client";
const DefaultDialog = lazy(() => import("fumadocs-ui/components/dialog/search-default"));
function ScopedDialog(props) {
  return <DefaultDialog key={props.api} {...props} />;
}
export function Providers({ children }) {
  const { locale, index } = useScope();
  return (
    <RootProvider
      components={{ Link: BenchLink }}
      i18n={{
        locale,
        locales: [
          { locale: "en", name: "English" },
          { locale: "zh-CN", name: "中文" },
        ],
      }}
      search={{
        SearchDialog: ScopedDialog,
        options: { type: "static", api: `/_search/${index}.json` },
      }}
    >
      <Counter />
      {children}
    </RootProvider>
  );
}
