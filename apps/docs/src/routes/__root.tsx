import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { styles } from "@lenso/docs/presentation";
import { getDocumentationMessages, resolveDocumentationLocale } from "@lenso/docs/client";
import { documentationLocales } from "../lib/locale";
import { Providers } from "../components/providers";
import { DevStyleX } from "../components/dev-stylex";
import globalCSS from "../styles/global.css?url";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lenso UI" },
      { name: "description", content: "React components with StyleX and native interactions." },
    ],
    links: [{ rel: "stylesheet", href: globalCSS }],
  }),
  component: Root,
});
function Root() {
  const locale = useRouterState({
    select: (state) => (state.location.pathname.split("/")[1] === "cn" ? "cn" : "en"),
  });
  const body = stylex.props(styles.body);
  const language = resolveDocumentationLocale(locale, documentationLocales).language;
  return (
    <html lang={language} dir="ltr" suppressHydrationWarning style={{ overflow: "auto" }}>
      <head>
        <HeadContent />
        <DevStyleX />
      </head>
      <body {...body} className={`${body.className} lenso-docs`}>
        <a href="#main-content" {...stylex.props(styles.skip)}>
          {getDocumentationMessages(language).skip}
        </a>
        <Providers locale={locale}>
          <Outlet />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
