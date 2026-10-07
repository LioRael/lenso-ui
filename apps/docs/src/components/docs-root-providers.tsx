"use client";

import type { ReactNode } from "react";
import { Providers } from "./providers";

export function DocsRootProviders({ children, locale }: { children: ReactNode; locale: string }) {
  if (locale !== "en" && locale !== "cn") throw new Error(`Unsupported Lenso locale: ${locale}`);
  return <Providers locale={locale}>{children}</Providers>;
}
