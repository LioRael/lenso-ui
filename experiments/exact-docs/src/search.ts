import path from "node:path";
import type { Site } from "./index.ts";
import { sameScope } from "./variants.ts";

/** Literal imports give Exact's bundler a separate, lazily fetched module per scope. */
export async function writeDataEntry(site: Site, app: string) {
  const scopes = [
    ...new Map(
      site.documents.map((doc) => [JSON.stringify([doc.locale, doc.version]), doc]),
    ).values(),
  ];
  const branches: string[] = [];
  for (const [i, scope] of scopes.entries()) {
    const index = site.documents
      .filter((doc) => doc.search !== false && sameScope(doc, scope))
      .map((doc) => ({ title: doc.title, href: doc.path, text: doc.text.toLowerCase() }));
    await Bun.write(
      path.join(app, `docs-search/scope-${i}.ts`),
      `export default ${JSON.stringify(index)};\n`,
    );
    branches.push(
      `  if(locale === ${JSON.stringify(scope.locale)} && version === ${JSON.stringify(scope.version)}) index = (await import("./docs-search/scope-${i}.ts")).default;`,
    );
  }
  const module = site.config.root?.data;
  const user = module
    ? `import * as user from ${JSON.stringify(`./site/${module}`)};
export * from ${JSON.stringify(`./site/${module}`)};
const delegate: (...args: Parameters<Answer>) => ReturnType<Answer> = user.answer;`
    : 'export const grants = "";';
  await Bun.write(
    path.join(app, "app.ts"),
    `import type { Answer, Source, Args, Result } from "./app.contract.d.ts";
${user}
async function search(args: unknown[]) {
  const [query,locale,version]=args;
  if(typeof query!=="string"||typeof locale!=="string"||typeof version!=="string") throw new Error("Invalid documentation search arguments");
  const q=query.trim().toLowerCase();
  if(!q) return {items:[]};
  let index:{title:string;href:string;text:string}[]=[];
${branches.join("\n")}
  return {items:index.filter(item=>item.text.includes(q)).map(({title,href})=>({title,href}))};
}
export function answer<S extends Source>(source:S,args:Args<S>,store:Parameters<Answer>[2],storage:Parameters<Answer>[3],native?:Parameters<Answer>[4]):Result<S>|Promise<Result<S>>;
export function answer(...args:Parameters<Answer>):ReturnType<Answer> {
  if(args[0] === "docsSearchPages") return search(args[1]);
  ${module ? "return delegate(...args);" : "throw new Error(`Unknown source: ${args[0]}`);"}
}
`,
  );
}
