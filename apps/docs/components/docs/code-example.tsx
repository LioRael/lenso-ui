import { CodeBlock } from "./code-block";
import { docsHeadingId } from "./heading";

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
        <h2 data-toc-heading id={docsHeadingId(title)}>
          {title}
        </h2>
        <p>{description}</p>
      </div>
      <CodeBlock code={code} />
    </section>
  );
}
