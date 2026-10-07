import { compileDocument } from "@lenso/docs/server";
import type { DocumentationCustomizationContext } from "@lenso/docs/react";
import type { MDXComponents } from "mdx/types";
import { getMDXComponents, headingId } from "./src/mdx-components";
import { NativeApiReference } from "./src/components/native-api-reference";
import { nativeApiFamily, replaceNativeApiSection } from "./src/lib/native-api-section";
import { isLocale } from "./src/lib/source";
import reference from "./src/generated/api-reference.json";

function localeOf(code: string) {
  if (!isLocale(code)) throw new Error(`Unsupported Lenso locale: ${code}`);
  return code;
}

export function getComponents(
  { page }: DocumentationCustomizationContext,
  overrides: MDXComponents = {},
) {
  return { ...getMDXComponents(localeOf(page.locale), overrides), NativeApiReference };
}

export async function getDocument(
  context: DocumentationCustomizationContext,
  overrides: MDXComponents = {},
) {
  const { page } = context;
  const locale = localeOf(page.locale);
  const candidate = nativeApiFamily(page.slug);
  const family = candidate && Object.hasOwn(reference.families, candidate) ? candidate : undefined;
  const nativeSection = () => (tree: Parameters<typeof replaceNativeApiSection>[0]) => {
    if (family) replaceNativeApiSection(tree, family, locale === "cn" ? "zh" : "en");
  };
  return compileDocument({
    markdown: page.markdown,
    components: getComponents(context, overrides),
    remarkPlugins: [nativeSection],
    headingPolicy: {
      id: headingId,
      include: (title, depth) =>
        depth >= 2 && depth <= 4 && (depth !== 4 || title.includes("[!toc]")),
      additional: (node) =>
        node.name === "NativeApiReference"
          ? [
              {
                title: locale === "cn" ? "API 参考" : "API Reference",
                id: `native-api-${family}`,
                depth: 2,
              },
            ]
          : [],
    },
  });
}
