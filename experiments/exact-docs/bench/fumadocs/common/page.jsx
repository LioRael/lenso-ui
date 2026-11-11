import { notFound } from "next/navigation";
import { getPage, pages } from "../source";
import { PageFrame } from "../frame";
export const dynamicParams = false;
export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.path === "/" ? [] : page.path.slice(1).split("/") }));
}
export async function generateMetadata({ params }) {
  const entry = getPage((await params).slug);
  if (!entry) return {};
  const { page } = entry;
  return {
    title: `${page.title} | Documentation comparison`,
    description: page.description,
    alternates: {
      canonical: `https://docs.example.test${page.path}`,
      languages: Object.fromEntries(
        page.locales.map((item) => [item.id, `https://docs.example.test${item.href}`]),
      ),
    },
  };
}
export default async function Page({ params }) {
  const entry = getPage((await params).slug);
  if (!entry) notFound();
  return <PageFrame {...entry} />;
}
