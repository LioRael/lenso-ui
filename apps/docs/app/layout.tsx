import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@lenso/tokens/styles.css";
import "@lenso/ui/styles.css";
import "dialkit/styles.css";
import "./styles.css";

export const metadata: Metadata = {
  description: "An independent React design system built with Base UI and StyleX.",
  title: "Lenso UI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
