export function CodeExample({ code, title = "Implementation" }: { code: string; title?: string }) {
  return (
    <section className="button-implementation mdx-code-example">
      <div>
        <h2>{title}</h2>
        <p>
          Compose the component from its public parts and keep application content consumer-owned.
        </p>
      </div>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </section>
  );
}
