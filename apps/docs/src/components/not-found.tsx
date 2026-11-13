import { useDocumentationMessages } from "@lenso/docs/client";

export function NotFound() {
  const messages = useDocumentationMessages();
  return (
    <main>
      <h1>{messages.notFound}</h1>
      <a href="/">Lenso UI</a>
    </main>
  );
}
