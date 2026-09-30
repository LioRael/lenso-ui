import { redirect } from "next/navigation";

export default async function DocsRedirect({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  redirect(`/en/docs/${slug?.join("/") || "react/getting-started"}`);
}
