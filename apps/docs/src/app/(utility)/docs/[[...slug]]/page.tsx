import { redirect } from "next/navigation";
import { source } from "@/lib/source";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { slug: [] },
    ...source.pages
      .filter((page) => page.locale === "en")
      .map((page) => ({ slug: page.slug.split("/") })),
  ];
}

export default async function DocsRedirect({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  redirect(`/en/docs/${slug?.join("/") || "react/getting-started"}`);
}
