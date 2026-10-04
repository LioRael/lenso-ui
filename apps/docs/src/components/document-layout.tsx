import type { Metadata } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import * as stylex from "@stylexjs/stylex";
import "fumadocs-ui/style.css";
import "@/styles/global.css";
import { Providers } from "@/components/providers";
import { styles } from "@/styles/docs.stylex";
import { env } from "../../env";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Lenso UI", template: "%s · Lenso UI" },
  description:
    "Lenso UI components with StyleX, native Base UI interactions, and React Aria date, time, and color models.",
};

export default function DocumentLayout({
  children,
  lang = "en",
}: {
  children: ReactNode;
  lang?: string;
}) {
  preload("/fonts/Inter-Variable.ttf", {
    as: "font",
    type: "font/ttf",
    crossOrigin: "anonymous",
  });
  return (
    <html lang={lang} suppressHydrationWarning>
      <body {...stylex.props(styles.body)}>
        <Providers locale={lang === "zh-CN" ? "cn" : "en"}>
          <a href="#main-content" {...stylex.props(styles.skip)}>
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
