import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "Field Notes",
  description: "A practical guide to building with Lenso.",
  siteUrl: "https://docs.example.com",
  contentDir: "content",
  components: "docs-components.tsx",
  language: "en",
  navigation: [
    { title: "Start here", pages: ["index", "guides/index", "guides/content"] },
    { title: "Reference", pages: ["components/counter", "api/messages"] },
  ],
  links: {
    GitHub: "https://github.com/",
  },
});
