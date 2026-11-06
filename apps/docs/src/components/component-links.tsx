import { ChevronDown, Code, LogoGithub } from "@gravity-ui/icons";
import { buttonSizes, buttonStyles, buttonVariants } from "@lenso/tokens/button";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@/styles/notebook.stylex";
import { docsIndex } from "@/lib/source";
import { product } from "@/lib/product";
import { styles as docsStyles } from "@lenso/docs/presentation";

const referenceStyles = stylex.create({
  summary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "fit-content",
    paddingBlock: 4,
    fontSize: 13,
    color: "var(--docs-label-secondary, var(--lenso-label-secondary))",
    cursor: "pointer",
    listStyle: "none",
  },
  indicator: {
    transform: { default: "rotate(-90deg)", ":is(details[open] > summary > *)": "none" },
  },
});

export function ComponentLinks({ family, locale = "en" }: { family?: string; locale?: string }) {
  const cn = locale === "cn";
  if (!family || !Object.hasOwn(docsIndex.families, family)) return null;
  const metadata = docsIndex.families[family]!;
  if (metadata.source === undefined) throw new Error(`Missing component source: ${family}`);
  const implementation = metadata.source;
  const native = metadata.native;
  const base = native.find((module) => module.startsWith("@base-ui/react/"))?.split("/")[2];
  const entries = [
    {
      label: "Source",
      href: `${product.repository}/blob/main/${implementation}`,
      icon: LogoGithub,
    },
    {
      label: "Styles",
      href: `${product.repository}/blob/main/packages/styles/src/components/${family}/${family}.styles.ts`,
      icon: LogoGithub,
    },
    base && {
      label: "Base UI",
      href: `https://base-ui.com/react/components/${base}`,
      icon: Code,
    },
    native.some((module) => module.startsWith("react-aria")) && {
      label: "React Aria",
      href: "https://react-aria.adobe.com/",
      icon: Code,
    },
  ].filter((entry) => !!entry);
  return (
    <details>
      <summary {...stylex.props(referenceStyles.summary, docsStyles.disclosureFocus)}>
        <ChevronDown
          width={12}
          height={12}
          aria-hidden="true"
          {...stylex.props(referenceStyles.indicator)}
        />
        {cn ? "参考链接" : "References"}
      </summary>
      <nav
        aria-label={cn ? "组件参考链接" : "Component references"}
        {...stylex.props(notebook.sourceLinks)}
      >
        {entries.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            {...stylex.props(
              buttonStyles.root,
              buttonSizes.sm,
              buttonVariants.ghost,
              notebook.sourceLink,
            )}
          >
            <Icon width={16} height={16} aria-hidden="true" />{" "}
            {cn ? ({ Source: "源码", Styles: "样式" }[label] ?? label) : label}
          </a>
        ))}
      </nav>
    </details>
  );
}
