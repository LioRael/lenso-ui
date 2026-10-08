import type { ReactNode } from "react";
import { getDocumentationComponents } from "./mdx";
import { DocumentationPageLayout } from "./page-layout";

export { DocumentationRoot } from "./root";

// Public generic page facade supplies the built-in MDX components. Custom
// document hosts import the layout directly and supply their own compiled content.
export function DocumentationPage({
  customComponents = {},
  ...props
}: Parameters<typeof DocumentationPageLayout>[0]): ReactNode {
  return (
    <DocumentationPageLayout
      {...props}
      customComponents={getDocumentationComponents(props.config.basePath ?? "", customComponents)}
    />
  );
}
