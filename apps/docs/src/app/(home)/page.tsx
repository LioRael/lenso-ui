import { HomePage } from "@/components/home-page";
import { homeMetadata } from "@/lib/home-metadata";

export const metadata = homeMetadata("en");

export default function Home() {
  return <HomePage locale="en" />;
}
