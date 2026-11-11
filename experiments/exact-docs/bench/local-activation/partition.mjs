import { parseSync, transformFromAstSync } from "@babel/core";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const opts = { configFile: false, babelrc: false };
const parse = (s) => parseSync(s, opts);
const print = (n) => transformFromAstSync(n, "", opts).code;
// Partition lexical owners, not output filenames: each mutable binding has one shared cell.
export async function partition(gen) {
  const file = path.join(gen, "rt.js"),
    ast = parse(
      (await Bun.file(file).text()).replace("const ADOPT_MS = 16,", "const ADOPT_MS = 0,"),
    );
  const late = [];
  for (const row of ast.program.body) {
    const n = row.declaration ?? row;
    if (n.type === "VariableDeclaration")
      for (const d of n.declarations)
        if (d.id.name === "commit") {
          late.push(
            parse(
              `Object.defineProperties(commitHost,Object.getOwnPropertyDescriptors(${print({ type: "File", program: { type: "Program", sourceType: "module", body: [{ type: "ExpressionStatement", expression: d.init.arguments[1] }] } }).replace(/;\s*$/, "")}));`,
            ).program.body[0],
          );
          d.init.arguments[1] = { type: "Identifier", name: "commitHost" };
        }
  }
  ast.program.body.push(
    ...parse(
      `export const commitHost={time,tick,routerValid:()=>true,unpark:()=>{},KeyEvent:null,Propagating:null,command:()=>{throw Error('Host activation required')},Before,Pres:null,gains:()=>[],Views:[],openTabs:()=>{},settled:()=>{for(const f of After)f()},Open,closeLetGo,Sounds,Booting:false,autofocus:()=>{},Input:null,Sh:null,navigation:{traversing:false},After,drive:()=>{throw Error('Scheduling requires host activation')},armedAt};`,
    ).program.body,
  );
  const bindings = new Map(),
    mutable = new Set(),
    originalImports = new Map(),
    aliases = [],
    extras = [],
    units = [];
  for (const row of ast.program.body) {
    if (row.type === "ImportDeclaration") {
      for (const spec of row.specifiers) originalImports.set(spec.local.name, { row, spec });
      continue;
    }
    const n = row.declaration ?? row;
    if (n.type === "VariableDeclaration")
      for (const d of n.declarations) {
        assert.equal(d.id.type, "Identifier");
        if (n.kind === "let" || n.kind === "var") mutable.add(d.id.name);
        bindings.set(
          d.id.name,
          `unit-${createHash("sha256").update(d.id.name).digest("hex").slice(0, 12)}.js`,
        );
      }
    else if (["FunctionDeclaration", "ClassDeclaration"].includes(n.type))
      bindings.set(
        n.id.name,
        `unit-${createHash("sha256").update(n.id.name).digest("hex").slice(0, 12)}.js`,
      );
  }
  const cell = (n) => `_cell_${n.replaceAll("$", "_d")}`;
  transformFromAstSync(ast, "", {
    ...opts,
    cloneInputAst: false,
    plugins: [
      () => ({
        visitor: {
          Identifier(p) {
            const name = p.node.name;
            if (!mutable.has(name)) return;
            const b = p.scope.getBinding(name);
            if (!b?.scope.path.isProgram()) return;
            if (
              p.isBindingIdentifier() &&
              !p.parentPath.isAssignmentExpression() &&
              !p.parentPath.isUpdateExpression()
            )
              return;
            if (p.parentPath.isMemberExpression() && p.key === "property" && !p.parent.computed)
              return;
            if (
              (p.parentPath.isObjectProperty() || p.parentPath.isObjectMethod()) &&
              p.key === "key" &&
              !p.parent.computed
            )
              return;
            if (p.parentPath.isExportSpecifier()) return;
            p.replaceWith({
              type: "MemberExpression",
              object: { type: "Identifier", name: cell(name) },
              property: { type: "Identifier", name: "value" },
              computed: false,
            });
            p.skip();
          },
        },
      }),
    ],
  });
  for (const row of ast.program.body) {
    if (row.type === "ImportDeclaration") continue;
    const n = row.declaration ?? row;
    if (n.type === "VariableDeclaration") {
      for (const d of n.declarations) {
        const name = d.id.name;
        const decl = mutable.has(name)
          ? parse(`export const ${cell(name)}={value:null};`).program.body[0]
          : {
              type: "ExportNamedDeclaration",
              declaration: { ...n, declarations: [d] },
              specifiers: [],
              source: null,
            };
        if (mutable.has(name))
          decl.declaration.declarations[0].init.properties[0].value = d.init ?? {
            type: "Identifier",
            name: "undefined",
          };
        units.push({ name, node: decl });
      }
    } else if (["FunctionDeclaration", "ClassDeclaration"].includes(n.type))
      units.push({
        name: n.id.name,
        node: { type: "ExportNamedDeclaration", declaration: n, specifiers: [], source: null },
      });
    else if (row.type === "ExportNamedDeclaration" || row.type === "ExportAllDeclaration")
      extras.push(row);
    else if (
      row.type === "ExpressionStatement" &&
      row.expression.type === "CallExpression" &&
      row.expression.callee.type === "MemberExpression" &&
      row.expression.callee.object.name === "Object" &&
      row.expression.callee.property.name === "assign" &&
      ["Link", "budgetHost"].includes(row.expression.arguments[0]?.name)
    ) {
      late.push(row);
      aliases.push(
        ...parse(
          row.expression.arguments[0].name === "Link"
            ? "Object.assign(Link,{clock,commit,journal});"
            : "Object.assign(budgetHost,{say});",
        ).program.body,
      );
    } else if (row.type === "IfStatement") {
      late.push(row);
    } else aliases.push(row);
  }
  const owners = new Map(
    [...bindings].map(([name, module]) => [mutable.has(name) ? cell(name) : name, module]),
  );
  async function emit(body, filename) {
    const program = { type: "File", program: { type: "Program", sourceType: "module", body } },
      needed = new Set();
    transformFromAstSync(program, "", {
      ...opts,
      plugins: [
        () => ({
          visitor: {
            ReferencedIdentifier(p) {
              if (!p.scope.getBinding(p.node.name)) needed.add(p.node.name);
            },
          },
        }),
      ],
    });
    transformFromAstSync(program, "", {
      ...opts,
      cloneInputAst: false,
      plugins: [
        () => ({
          visitor: {
            Identifier(p) {
              if (
                !p.isReferencedIdentifier() &&
                !p.parentPath.isAssignmentExpression() &&
                !p.parentPath.isUpdateExpression()
              )
                return;
              if (
                (p.parentPath.isObjectProperty() || p.parentPath.isObjectMethod()) &&
                p.key === "key" &&
                !p.parent.computed
              )
                return;
              if (p.parentPath.isMemberExpression() && p.key === "property" && !p.parent.computed)
                return;
              const name = p.node.name;
              if (mutable.has(name) && !p.scope.getBinding(name)) {
                p.replaceWith({
                  type: "MemberExpression",
                  object: { type: "Identifier", name: cell(name) },
                  property: { type: "Identifier", name: "value" },
                  computed: false,
                });
                needed.delete(name);
                needed.add(cell(name));
                p.skip();
              }
            },
          },
        }),
      ],
    });
    const imports = [];
    for (const name of needed) {
      if (owners.has(name) && owners.get(name) !== filename)
        imports.push(parse(`import {${name}} from './${owners.get(name)}';`).program.body[0]);
      else if (originalImports.has(name)) {
        const { row, spec } = originalImports.get(name);
        imports.push({ ...structuredClone(row), specifiers: [structuredClone(spec)] });
      }
    }
    program.program.body.unshift(...imports);
    await Bun.write(path.join(gen, filename), print(program));
  }
  for (const { name, node } of units) await emit([node], bindings.get(name));
  await emit(aliases, "unit-setup.js");
  const installer = parse("export function installFullRuntime(){}").program.body[0];
  installer.declaration.body.body = late;
  await emit([installer], "unit-full-setup.js");
  const barrel = [parse("import './unit-setup.js';").program.body[0]];
  for (const row of extras) {
    if (row.source || row.type === "ExportAllDeclaration") {
      barrel.push(row);
      continue;
    }
    for (const spec of row.specifiers) {
      const name = spec.local.name;
      if (owners.has(name)) continue;
      const original = originalImports.get(name);
      if (original) {
        barrel.push({
          type: "ExportNamedDeclaration",
          declaration: null,
          source: original.row.source,
          specifiers: [
            {
              type: "ExportSpecifier",
              local: original.spec.imported ?? original.spec.local,
              exported: spec.exported,
            },
          ],
        });
      }
    }
  }
  for (const [name, module] of owners)
    barrel.push(parse(`export {${name}} from './${module}';`).program.body[0]);
  await Bun.write(
    file,
    print({ type: "File", program: { type: "Program", sourceType: "module", body: barrel } }),
  );
  const dataFile = path.join(gen, "ts-data.js");
  let dataCode = await Bun.file(dataFile).text();
  dataCode = dataCode.replace("commit, drive, inflight", "commit, inflight");
  dataCode =
    "import {commitHost} from './rt.js'; const drive=(...args)=>commitHost.drive(...args);\n" +
    dataCode;
  await Bun.write(dataFile, dataCode);
  const fullData = parse(await Bun.file(dataFile).text());
  const sourceImport = fullData.program.body.find(
    (n) =>
      n.type === "ImportDeclaration" &&
      n.specifiers.some((s) => s.type === "ImportNamespaceSpecifier" && s.local.name === "source"),
  );
  const original = await Bun.file(dataFile).text();
  const conversions = original.slice(
    original.indexOf("const same ="),
    original.indexOf("// The app's page module"),
  );
  assert.ok(conversions.includes("const checked =") && conversions.includes("const conv ="));
  const sourceFile = path.join(gen, "typescript/app.ts");
  const sourceCode = await Bun.file(sourceFile).text();
  assert.ok(
    sourceCode.includes('export const grants = "";'),
    "Only grant-free generated documentation data is qualified",
  );
  const sourceAst = parseSync(sourceCode, { ...opts, parserOpts: { plugins: ["typescript"] } });
  for (const row of sourceAst.program.body)
    if (row.type === "ImportDeclaration" && row.importKind !== "type")
      assert.equal(
        row.source.value,
        "./docs-routes.ts",
        "Data extensions require the full native data adapter; this optimization only qualifies generated documentation sources",
      );
  transformFromAstSync(sourceAst, sourceCode, {
    ...opts,
    plugins: [
      () => ({
        visitor: {
          CallExpression(p) {
            if (p.node.callee.type === "Import")
              assert.match(
                p.node.arguments[0]?.value ?? "",
                /^\.\/docs-(?:content\/body-\d+|search\/scope-\d+)\.ts$/,
                "Unqualified dynamic data import",
              );
          },
        },
      }),
    ],
  });
  const slim = `import * as source from ${JSON.stringify(sourceImport.source.value)};import{sourceTypes}from './names.js';import{checkpoint,Resources}from './rt.js';import{Shaped}from './shape.js';${conversions}
 export function install(data){if(source.grants!==''||Object.keys(source).some(name=>!['answer','grants','kept'].includes(name)))throw Error('Unqualified source capability');let seeded=false;const denied=new Proxy({}, {get(){throw Error('This data specialization does not support store, host or module capabilities')}});data.answer=(name,args,store,target)=>{if(!seeded){seeded=true;const page=checkpoint().kept;if(source.kept)for(const r of Resources){const row=page?.get(r.name),types=sourceTypes[r.source];if(row&&types)try{source.kept(r.source,row[0].map((a,i)=>named(a,types[0][i])),named(row[1],types[1]));}catch{}}}
 if(!['docsReadRoute','docsReadPage','docsSearchPages'].includes(name))throw Error('Unqualified data source');const [params,result]=sourceTypes[name];const convert=value=>conv(checked(name,value,result),result,target??name);const answer=source.answer(name,args.map((arg,i)=>named(arg,params[i])),denied,denied,denied);return answer&&typeof answer.then==='function'?{promise:Promise.resolve(answer).then(convert)}:{v:convert(answer)};};for(const f of data.q.splice(0))f();}`;
  await Bun.write(path.join(gen, "pure-data.js"), slim);
}
