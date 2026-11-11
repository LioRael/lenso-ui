import { BenchLink } from "./client";
export function ScopeControls({ page }) {
  return (
    <div lang={page.locale} data-benchmark-scope={page.scope}>
      <nav aria-label="Language">
        {page.locales.map((item) => (
          <BenchLink key={item.id} href={item.href} aria-current={item.current ? "true" : "false"}>
            {item.label}
          </BenchLink>
        ))}
      </nav>
      <nav aria-label="Version">
        {page.versions.map((item) => (
          <BenchLink key={item.id} href={item.href} aria-current={item.current ? "true" : "false"}>
            {item.label}
          </BenchLink>
        ))}
      </nav>
      {page.version === "v1" && <output>You are reading an archived version.</output>}
    </div>
  );
}
