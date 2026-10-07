import * as stylex from "@stylexjs/stylex";
import { source } from "@/lib/source";
import liveManifest from "@/demos/live-manifest.json";
import { styles } from "@/styles/docs.stylex";

export default function CoveragePage() {
  const live = new Set(Object.keys(liveManifest.en));
  const chinese = Object.values(liveManifest.cn);
  const translated = chinese.filter((file) => file.startsWith("cn/")).length;
  const equivalent = chinese.filter((file) => file.startsWith("en/")).length;
  const missingChinese = Object.keys(source.examples.cn).filter(
    (name) => !Object.hasOwn(liveManifest.cn, name),
  );
  const families = new Map<string, { source: number; live: number }>();
  for (const [name, example] of Object.entries(source.examples.en)) {
    const family = example.source.split("/")[5] ?? "unknown";
    const count = families.get(family) ?? { source: 0, live: 0 };
    count.source += 1;
    count.live += Number(live.has(name));
    families.set(family, count);
  }
  return (
    <main id="main-content" tabIndex={-1} {...stylex.props(styles.content)}>
      <article {...stylex.props(styles.article)}>
        <h1 {...stylex.props(styles.title)}>Documentation coverage</h1>
        <p {...stylex.props(styles.description)}>
          Public authored placement and live registration are not exhaustive browser proof.
        </p>
        <p>
          Lenso {source.lensoVersion} publishes {source.pages.length} authored documentation pages:{" "}
          {source.pages.filter((page) => page.locale === "en").length} English and{" "}
          {source.pages.filter((page) => page.locale === "cn").length} Chinese. Guides, current
          native API and runnable component scenarios share one public index.
        </p>
        <p>
          {Object.keys(source.examples.en).length} English scenario references and{" "}
          {Object.keys(source.examples.cn).length} Chinese references have authored component-page
          placements. Multiple references may share a local implementation; a reference count is not
          a unique-module count.
        </p>
        <p>
          {live.size} English references resolve to local component and StyleX adaptations. Chinese
          registration contains {translated} maintained Chinese modules and {equivalent} explicitly
          selected English-module reuses.{" "}
          {missingChinese.length ? (
            <>
              The remaining {missingChinese.length} Chinese references fall back to English and are
              not counted as localized.{" "}
            </>
          ) : (
            <>All Chinese references have a registered local implementation. </>
          )}
          Registration does not certify complete textual, behavioral or visual parity.
        </p>
        <p>
          <a href="/coverage.json">Download the authored placement and runtime coverage report.</a>
        </p>
        <p>
          Native applications, paid-product surfaces, authentication, analytics, and publishing
          integrations are outside this local docs application. The immutable reference archive
          remains private provenance, not public release history or migration instructions.
        </p>
        <h2 {...stylex.props(styles.h2)}>English live preview coverage</h2>
        <table {...stylex.props(styles.table)}>
          <thead>
            <tr>
              <th scope="col" {...stylex.props(styles.cell)}>
                Lenso family
              </th>
              <th scope="col" {...stylex.props(styles.cell)}>
                Authored scenarios
              </th>
              <th scope="col" {...stylex.props(styles.cell)}>
                Local live examples
              </th>
            </tr>
          </thead>
          <tbody>
            {[...families]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([family, count]) => (
                <tr key={family}>
                  <th scope="row" {...stylex.props(styles.cell)}>
                    {family}
                  </th>
                  <td {...stylex.props(styles.cell)}>{count.source}</td>
                  <td {...stylex.props(styles.cell)}>{count.live}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <h2 {...stylex.props(styles.h2)}>Reproduce public coverage</h2>
        <pre {...stylex.props(styles.pre)}>
          <code>{`pnpm --filter @lenso/ui-docs build\npnpm --filter @lenso/ui-docs test:examples`}</code>
        </pre>
        <p>
          Generation derives native API and authored placements from maintained local examples
          without rewriting their source. The full example proof rejects missing modules and
          noncanonical placements; a scoped run is not complete coverage.
        </p>
      </article>
    </main>
  );
}
