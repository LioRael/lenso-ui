import path from "node:path";
import type { DocsPlatform, Site } from "./index.ts";
import { sameScope } from "./variants.ts";
import type { PageContent } from "./body.ts";
import type { Heading } from "./content.ts";
import type { Choice } from "./variants.ts";

export type PageData = PageContent & {
  description: string;
  canonical: string;
  robots: string;
  seo: string;
  toc: Heading[];
  locales: Choice[];
  versions: Choice[];
  previous: { title: string; href: string }[];
  next: { title: string; href: string }[];
};

export function searchScopes(site: Site) {
  return [
    ...new Map(
      site.documents.map((doc) => [JSON.stringify([doc.locale, doc.version]), doc]),
    ).values(),
  ];
}

/** Literal imports give Exact's bundler a separate, lazily fetched module per scope. */
export async function writeDataEntry(
  site: Site,
  app: string,
  pages: Map<string, PageData>,
  platform: DocsPlatform = "web",
) {
  const scopes = searchScopes(site);
  const branches: string[] = [];
  const imports: string[] = [];
  for (const [i, scope] of scopes.entries()) {
    const index = site.documents
      .filter((doc) => doc.search !== false && sameScope(doc, scope))
      .map((doc) => ({ title: doc.title, href: doc.path, text: doc.text.toLowerCase() }));
    await Bun.write(
      path.join(app, `docs-search/scope-${i}.ts`),
      `export default ${JSON.stringify(index)};\n`,
    );
    if (platform !== "web") imports.push(`import scope${i} from "./docs-search/scope-${i}.ts";`);
    branches.push(
      `  if(locale === ${JSON.stringify(scope.locale)} && version === ${JSON.stringify(scope.version)}) index = ${platform === "web" ? `(await import("./docs-search/scope-${i}.ts")).default` : `scope${i}`};`,
    );
  }
  const module = site.config.root?.data;
  const bodies: string[] = [];
  for (const [i, [url, content]] of [...pages].entries()) {
    await Bun.write(
      path.join(app, `docs-content/body-${i}.ts`),
      `export default ${JSON.stringify(content)};\n`,
    );
    if (platform !== "web") imports.push(`import body${i} from "./docs-content/body-${i}.ts";`);
    bodies.push(
      `[${JSON.stringify(url)}, () => ${platform === "web" ? `import("./docs-content/body-${i}.ts").then(module => module.default)` : `Promise.resolve(body${i})`}]`,
    );
  }
  const nativeStack =
    platform === "web"
      ? ""
      : `const routePaths = new Map<string,string>(${JSON.stringify([...pages.keys()].map((path, i) => [`page${i}`, path]))});
function readStack(args: unknown[]) {
  const [names] = args;
  if(!Array.isArray(names) || !names.every(name => typeof name === "string")) throw new Error("Invalid documentation stack arguments");
  return Promise.all(names.flatMap(name => {
    const path = routePaths.get(name);
    return path === undefined ? [] : [Promise.resolve(readPage([path])).then(content => ({route:name,content}))];
  }));
}`;
  const user = module
    ? `import * as user from ${JSON.stringify(`./site/${module}`)};
export * from ${JSON.stringify(`./site/${module}`)};
const delegate: (...args: Parameters<Answer>) => ReturnType<Answer> = user.answer;
const userKept: unknown = Reflect.get(user, "kept");`
    : 'export const grants = "";';
  await Bun.write(
    path.join(app, "app.ts"),
    `import type { Answer, Source, Args, Result } from "./app.contract.d.ts";
${user}
${imports.join("\n")}
type KeptArgs = {[S in Source]: [source:S,args:Args<S>,value:Result<S>]}[Source];
const contentCache = new Map<string,Result<"docsReadPage">>();
const contentLoads = new Map<string,()=>Promise<Result<"docsReadPage">>>([
${bodies.join(",\n")}
]);
export function kept(...args:KeptArgs) {
  const [source,,value] = args;
  if(source === "docsReadPage") contentCache.set(value.path,value);
  ${module ? 'if(typeof userKept === "function") userKept(...args);' : ""}
}
function readPage(args: unknown[]) {
  const [path] = args;
  if(typeof path!=="string") throw new Error("Invalid documentation content arguments");
  if(path === "") return {path,markdown:"",blocks:[],description:"",canonical:"",robots:"noindex,follow",seo:"",toc:[],locales:[],versions:[],previous:[],next:[]};
  const cached = contentCache.get(path);
  if(cached) return cached;
  const load = contentLoads.get(path);
  if(!load) throw new Error("Unknown documentation page: " + path);
  return load().then(value => {contentCache.set(path,value);return value;});
}
${nativeStack}
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
  if(args[0] === "docsReadPage") return readPage(args[1]);
  ${platform === "web" ? "" : 'if(args[0] === "docsReadStack") return readStack(args[1]);'}
  ${module ? "return delegate(...args);" : "throw new Error(`Unknown source: ${args[0]}`);"}
}
`,
  );
}
