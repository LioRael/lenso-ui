export function CodeExample({
  code,
  description = "Compose the component from its public parts and keep application content consumer-owned.",
  title = "Implementation",
}: {
  code: string;
  description?: string;
  title?: string;
}) {
  return (
    <section className="button-implementation mdx-code-example">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </section>
  );
}
