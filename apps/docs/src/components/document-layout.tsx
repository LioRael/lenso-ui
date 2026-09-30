import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import * as stylex from "@stylexjs/stylex";
import "@lenso/tokens/styles.css";
import { Providers } from "@/components/providers";
import { styles } from "@/styles/docs.stylex";
import { env } from "../../env";

const inter = localFont({
  src: [{ path: "../../public/fonts/Inter-Variable.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Lenso UI", template: "%s · Lenso UI" },
  description: "Source-backed Lenso UI documentation, derived from HeroUI v3.2.6.",
};

export default function DocumentLayout({
  children,
  lang = "en",
}: {
  children: ReactNode;
  lang?: string;
}) {
  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <body {...stylex.props(styles.body)}>
        <Providers>
          <a href="#main-content" {...stylex.props(styles.skip)}>
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
