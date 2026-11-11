"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function BenchLink(props) {
  return <Link {...props} prefetch={false} />;
}
export function useScope() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/zh") ? "zh-CN" : "en";
  const version = /(?:^|\/)v1(?:\/|$)/.test(pathname) ? "v1" : "v2";
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return { locale, version, index: (locale === "zh-CN" ? 2 : 0) + (version === "v1" ? 1 : 0) };
}
export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div data-benchmark-counter>
      <button data-testid="comparison-counter" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
export function PageActions({ markdown, href }) {
  return (
    <section aria-label="Page actions">
      <button onClick={() => navigator.clipboard.writeText(markdown)}>Copy Markdown</button>
      <a href={href} target="_blank">
        Open Markdown
      </a>
    </section>
  );
}
