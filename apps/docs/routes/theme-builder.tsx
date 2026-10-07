import { ThemeBuilder } from "@/components/theme-builder";
import type { Locale } from "@/lib/source";

export default function ThemeBuilderRoute({ locale }: { locale: Locale }) {
  return <ThemeBuilder locale={locale} />;
}
