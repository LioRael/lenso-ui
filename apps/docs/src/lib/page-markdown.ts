const files = import.meta.glob<string>("../../content/lenso/**/*.mdx", {
  query: "?raw",
  import: "default",
});

export function readMarkdown(file: string) {
  return files[`../../${file}`]!();
}
