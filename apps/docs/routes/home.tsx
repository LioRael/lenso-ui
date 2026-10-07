import { HomePage } from "@/components/home-page";
import type { Locale } from "@/lib/source";

export default function Home({ locale }: { locale: Locale }) {
  return <HomePage locale={locale} />;
}
