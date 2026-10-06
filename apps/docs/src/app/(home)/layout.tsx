import type { ReactNode } from "react";
import DocumentLayout from "@/components/document-layout";

export { metadata } from "@/components/document-layout";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <DocumentLayout>{children}</DocumentLayout>;
}
