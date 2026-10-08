import { Code, LogoGithub } from "@gravity-ui/icons";
import { buttonSizes, buttonStyles, buttonVariants } from "@lenso/tokens/button";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@/styles/notebook.stylex";
import { docsIndex } from "@/lib/source";
import { product } from "@/lib/product";

export function ComponentLinks({ family }: { family?: string }) {
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
    <nav aria-label="Component references" {...stylex.props(notebook.sourceLinks)}>
      {entries.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          {...stylex.props(
            buttonStyles.root,
            buttonSizes.sm,
            buttonVariants.tertiary,
            notebook.sourceLink,
          )}
        >
          <Icon width={16} height={16} aria-hidden="true" /> {label}
        </a>
      ))}
    </nav>
  );
}
