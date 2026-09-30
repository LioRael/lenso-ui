import { readFile, writeFile, mkdir, access, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parse } from "@babel/parser";
import generateModule from "@babel/generator";

const generate = generateModule.default ?? generateModule;
const root = fileURLToPath(new URL("../", import.meta.url));
const revision = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
const ignored = new Set([
  "start",
  "end",
  "loc",
  "extra",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "tokens",
  "errors",
]);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const ast = (code) => parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
const normalize = (value) => value.replace(/\s+/g, " ").trim();
const isPresentationContext = (context) =>
  context === "text" ||
  /^attribute:(label|title|description|textValue|aria-label|aria-description|alt|placeholder)$/.test(
    context,
  ) ||
  /^property:(children|label|name|title|description|content|text|caption|textValue)$/.test(context);

function children(node) {
  return Object.entries(node).filter(([key]) => !ignored.has(key));
}

function literals(tree) {
  const result = [];
  const stylexNames = new Set(["stylex"]);
  for (const statement of tree.program.body) {
    if (statement.type === "ImportDeclaration" && statement.source.value === "@stylexjs/stylex") {
      for (const specifier of statement.specifiers) stylexNames.add(specifier.local.name);
    }
  }
  function visit(node, ancestors, location) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node
        .filter((child) => child?.type !== "JSXText" || normalize(child.value))
        .forEach((child, index) => {
          const declaration = child?.type === "ExportNamedDeclaration" ? child.declaration : child;
          const name =
            ancestors.at(-1)?.type === "Program"
              ? (declaration?.id?.name ?? declaration?.declarations?.[0]?.id?.name)
              : undefined;
          visit(child, ancestors, `${location}/${name ? `declaration:${name}` : index}`);
        });
      return;
    }
    if (node.type === "ExportNamedDeclaration" && node.declaration) {
      visit(node.declaration, ancestors, location);
      return;
    }
    const parent = ancestors.at(-1);
    const attributeIndex = ancestors.findLastIndex((item) => item.type === "JSXAttribute");
    const jsxIndex = ancestors.findLastIndex(
      (item) => item.type === "JSXElement" || item.type === "JSXFragment",
    );
    const propertyIndex = ancestors.findLastIndex((item) => item.type === "ObjectProperty");
    const attribute =
      attributeIndex > jsxIndex && attributeIndex > propertyIndex
        ? ancestors[attributeIndex]
        : undefined;
    const property = propertyIndex > jsxIndex ? ancestors[propertyIndex] : undefined;
    const forbidden =
      ancestors.some(
        (item) =>
          /^(Import|Directive|TS)/.test(item.type) ||
          (item.type === "CallExpression" &&
            (item.callee?.type === "Import" || item.callee?.name === "require")) ||
          (item.type === "CallExpression" && stylexNames.has(item.callee?.object?.name)),
      ) ||
      ancestors.some(
        (item) =>
          item.type === "JSXAttribute" &&
          ["className", "style", "xstyle"].includes(item.name?.name),
      ) ||
      (parent?.type === "ObjectProperty" && parent.key === node);
    let value;
    if (node.type === "StringLiteral") value = node.value;
    if (node.type === "JSXText") value = normalize(node.value);
    if (node.type === "TemplateElement") value = node.value.cooked;
    if (!forbidden && value?.trim()) {
      const context = attribute
        ? `attribute:${attribute.name.name}`
        : property
          ? `property:${property.key.name ?? property.key.value}`
          : node.type === "TemplateElement"
            ? "template"
            : "text";
      const jsx = ancestors.findLast(
        (item) => item.type === "JSXElement" || item.type === "JSXFragment",
      );
      const signature =
        node.type === "JSXText" && jsx
          ? JSON.stringify(
              jsx.children
                .filter((child) => child.type !== "JSXText" || normalize(child.value))
                .map((child) =>
                  child.type === "JSXElement"
                    ? [child.type, shape(child.openingElement.name)]
                    : child.type === "JSXExpressionContainer"
                      ? [child.type, child.expression.type]
                      : child.type,
                ),
            )
          : node.type;
      result.push({ node, parent, value, context, location, signature });
    }
    for (const [key, child] of children(node)) {
      if (typeof child === "object") visit(child, [...ancestors, node], `${location}/${key}`);
    }
  }
  visit(tree, [], "");
  return result;
}

function shape(node) {
  if (Array.isArray(node)) return node.map(shape);
  if (!node || typeof node !== "object") return node;
  if (["StringLiteral", "JSXText", "TemplateElement"].includes(node.type))
    return { type: node.type };
  return Object.fromEntries(children(node).map(([key, value]) => [key, shape(value)]));
}

function differences(en, cn, location = "") {
  if (JSON.stringify(en) === JSON.stringify(cn)) return [];
  if (!en || !cn || typeof en !== "object" || typeof cn !== "object") {
    const describe = (value) =>
      value && typeof value === "object"
        ? {
            type: value.type ?? (Array.isArray(value) ? "Array" : "Object"),
            name: value.id?.name,
            hash: digest(JSON.stringify(value)),
          }
        : value;
    return [{ location, en: describe(en), cn: describe(cn) }];
  }
  const keys = new Set([...Object.keys(en), ...Object.keys(cn)]);
  return [...keys]
    .filter((key) => !ignored.has(key))
    .flatMap((key) => differences(en[key], cn[key], `${location}/${key}`));
}

function nodes(tree, type) {
  const result = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === type) result.push(node);
    for (const [, child] of children(node)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (typeof child === "object") visit(child);
    }
  }
  visit(tree);
  return result;
}

function presentationMaps(tree) {
  const displays = displayedExpressions(tree).map((node) => node.expression);
  return nodes(tree, "VariableDeclarator")
    .map((node) => ({
      ...node,
      init: node.init?.type === "TSAsExpression" ? node.init.expression : node.init,
    }))
    .filter(
      (node) =>
        node.id.type === "Identifier" &&
        node.init?.type === "ObjectExpression" &&
        node.init.properties.length &&
        node.init.properties.every(
          (property) =>
            property.type === "ObjectProperty" &&
            !property.computed &&
            ["Identifier", "StringLiteral"].includes(property.key.type) &&
            property.value.type === "StringLiteral",
        ) &&
        displays.some(
          (expression) =>
            expression.type === "MemberExpression" && expression.object.name === node.id.name,
        ),
    )
    .map((node) => ({
      name: node.id.name,
      initializer: node.init,
      labels: Object.fromEntries(
        node.init.properties.map((property) => [
          property.key.name ?? property.key.value,
          property.value.value,
        ]),
      ),
      expressions: displays.filter(
        (expression) =>
          expression.type === "MemberExpression" &&
          expression.computed &&
          expression.object.name === node.id.name &&
          expression.property.type === "Identifier",
      ),
      applied: 0,
    }));
}

function projectedChineseLiterals(tree, maps) {
  const projected = structuredClone(tree);
  for (const node of nodes(projected, "JSXExpressionContainer")) {
    const expression = node.expression;
    if (
      expression.type !== "MemberExpression" ||
      expression.computed ||
      expression.property.type !== "Identifier"
    )
      continue;
    const map = maps.find((item) => item.name === expression.object.name);
    const value = map?.labels[expression.property.name];
    if (typeof value !== "string") continue;
    // Static map members are exactly source-evidenced text, not translated control values.
    node.type = "JSXText";
    node.value = value;
    delete node.expression;
  }
  // Attribute containers must remain attribute values rather than JSX child text.
  for (const node of nodes(projected, "JSXAttribute")) {
    if (node.value?.type === "JSXText")
      node.value = { type: "StringLiteral", value: node.value.value };
  }
  return literals(projected);
}

function displayedExpressions(tree) {
  return [...nodes(tree, "JSXElement"), ...nodes(tree, "JSXFragment")].flatMap((node) =>
    node.children.filter((child) => child.type === "JSXExpressionContainer"),
  );
}

function localizeAddedAccessibleAttributes(en, cn, adapted) {
  const allowed = new Set(["alt", "aria-label", "placeholder", "title", "aria-description"]);
  const english = nodes(en, "JSXOpeningElement");
  const chinese = nodes(cn, "JSXOpeningElement");
  const tags = new Set(chinese.map((node) => JSON.stringify(shape(node.name))));
  const report = [];
  for (const tag of tags) {
    const enElements = english.filter((node) => JSON.stringify(shape(node.name)) === tag);
    const cnElements = chinese.filter((node) => JSON.stringify(shape(node.name)) === tag);
    if (!enElements.length || enElements.length !== cnElements.length) continue;
    for (const attribute of allowed) {
      if (enElements.some((node) => node.attributes.some((item) => item.name?.name === attribute)))
        continue;
      const values = cnElements.map(
        (node) => node.attributes.find((item) => item.name?.name === attribute)?.value,
      );
      if (
        values.some((node) => node?.type !== "StringLiteral") ||
        new Set(values.map((node) => node.value)).size !== 1
      )
        continue;
      const entry = {
        tag: generate(cnElements[0].name).code,
        attribute,
        value: values[0].value,
        applied: 0,
        blockedExpressions: 0,
      };
      for (const node of nodes(adapted, "JSXOpeningElement").filter(
        (item) => JSON.stringify(shape(item.name)) === tag,
      )) {
        const existing = node.attributes.find((item) => item.name?.name === attribute);
        if (existing && existing.value?.type !== "StringLiteral") {
          entry.blockedExpressions++;
          continue;
        }
        if (existing) existing.value = structuredClone(values[0]);
        else
          node.attributes.push({
            type: "JSXAttribute",
            name: { type: "JSXIdentifier", name: attribute },
            value: structuredClone(values[0]),
          });
        entry.applied++;
      }
      report.push(entry);
    }
  }
  return report;
}

/** Translate only literal pairs evidenced at the same AST location in the pinned sources. */
export function localizeModule(englishSource, chineseSource, adaptedCode) {
  const en = ast(englishSource);
  const cn = ast(chineseSource);
  const adapted = ast(adaptedCode);
  const englishLiterals = literals(en);
  const chineseLiterals = literals(cn);
  const adaptedLiterals = literals(adapted);
  const pairs = [];
  const labelMaps = presentationMaps(cn);
  const chinese = new Map(
    projectedChineseLiterals(cn, labelMaps).map((item) => [item.location, item]),
  );
  for (const item of englishLiterals) {
    const counterpart = chinese.get(item.location);
    if (
      counterpart &&
      counterpart.context === item.context &&
      counterpart.signature === item.signature &&
      counterpart.value !== item.value
    ) {
      pairs.push({
        from: item.value,
        to: counterpart.value,
        context: item.context,
        location: item.location,
        applied: 0,
      });
    }
  }
  for (const item of englishLiterals.filter((literal) => literal.node.type === "JSXText")) {
    if (pairs.some((pair) => pair.location === item.location)) continue;
    const matches = labelMaps.flatMap((map) =>
      Object.entries(map.labels)
        .filter(([key]) => key.toLowerCase() === item.value.toLowerCase())
        .map(([key, to]) => ({ map: map.name, key, to })),
    );
    if (new Set(matches.map((match) => match.to)).size === 1) {
      pairs.push({
        from: item.value,
        to: matches[0].to,
        context: item.context,
        location: item.location,
        basis: { map: matches[0].map, key: matches[0].key },
        applied: 0,
      });
    }
  }
  const ambiguities = [];
  for (const item of adaptedLiterals) {
    let candidates = pairs.filter(
      (pair) => pair.from === item.value && pair.context === item.context,
    );
    if (!candidates.length && isPresentationContext(item.context))
      candidates = pairs.filter(
        (pair) => pair.from === item.value && isPresentationContext(pair.context),
      );
    const targets = new Set(candidates.map((pair) => pair.to));
    if (targets.size > 1) {
      // An unchanged AST location is stronger evidence than a repeated English word.
      candidates =
        JSON.stringify(shape(en)) === JSON.stringify(shape(adapted))
          ? candidates.filter((pair) => pair.location === item.location)
          : [];
    }
    if (new Set(candidates.map((pair) => pair.to)).size !== 1) {
      if (targets.size > 1)
        ambiguities.push({
          value: item.value,
          context: item.context,
          location: item.location,
          targets: [...targets],
        });
      continue;
    }
    const translated = candidates[0].to;
    if (item.node.type === "TemplateElement") {
      item.node.value = {
        cooked: translated,
        raw: translated.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${"),
      };
    } else {
      item.node.value = translated;
      delete item.node.extra;
      if (item.parent?.type === "JSXAttribute" && /["<\\\n\r]/.test(translated)) {
        item.parent.value = { type: "JSXExpressionContainer", expression: item.node };
      }
    }
    candidates.forEach((pair) => pair.applied++);
  }
  const englishDisplays = displayedExpressions(en)
    .filter((node) => node.expression.type === "Identifier")
    .map((node) => node.expression.name);
  const identifiers = new Set(nodes(adapted, "Identifier").map((node) => node.name));
  const presentationAmbiguities = [];
  for (const container of displayedExpressions(adapted)) {
    if (container.expression.type !== "Identifier") continue;
    const name = container.expression.name;
    const matches = labelMaps
      .filter(
        (map) =>
          englishDisplays.includes(name) ||
          Object.keys(map.labels).every((key) =>
            englishLiterals.some(
              (item) =>
                item.node.type === "JSXText" && item.value.toLowerCase() === key.toLowerCase(),
            ),
          ),
      )
      .flatMap((map) =>
        map.expressions
          .filter((expression) => expression.property.name === name)
          .map((expression) => ({ map, expression })),
      );
    const mapNames = new Set(matches.map((match) => match.map.name));
    if (mapNames.size !== 1 || identifiers.has(matches[0].map.name)) {
      if (matches.length)
        presentationAmbiguities.push({
          identifier: name,
          maps: [...mapNames],
          reason: mapNames.size !== 1 ? "ambiguous-map" : "adapted-identifier-collision",
        });
      continue;
    }
    container.expression = structuredClone(matches[0].expression);
    matches[0].map.applied++;
  }
  for (const map of labelMaps.filter((item) => item.applied)) {
    const insertion = adapted.program.body.findIndex((node) => node.type !== "ImportDeclaration");
    adapted.program.body.splice(insertion === -1 ? adapted.program.body.length : insertion, 0, {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: map.name },
          init: structuredClone(map.initializer),
        },
      ],
    });
  }
  const addedAccessibleAttributes = localizeAddedAccessibleAttributes(en, cn, adapted);
  return {
    code: generate(adapted, { comments: true, jsescOption: { minimal: true } }).code + "\n",
    translations: pairs,
    ambiguities,
    presentationMaps: labelMaps.map(({ name, labels, applied }) => ({ name, labels, applied })),
    presentationAmbiguities,
    addedAccessibleAttributes,
    unresolved: pairs.filter((pair) => !pair.applied),
    structuralDifference: JSON.stringify(shape(en)) !== JSON.stringify(shape(cn)),
    structuralDifferences: differences(shape(en), shape(cn)),
    unmatchedChineseLiterals: chineseLiterals
      .filter((item) => {
        const counterpart = englishLiterals.find(
          (other) =>
            other.location === item.location &&
            other.context === item.context &&
            other.signature === item.signature,
        );
        return !counterpart;
      })
      .map(({ value, context, location }) => ({ value, context, location })),
    adaptedOnlyLiterals: literals(ast(adaptedCode))
      .filter((item) => !englishLiterals.some((other) => other.value === item.value))
      .map(({ value, context, location }) => ({ value, context, location })),
    identicalSource: englishSource === chineseSource,
    equivalentSourceAst: differences(en, cn).length === 0,
  };
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function moduleSpecifiers(tree) {
  const result = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (
      [
        "ImportDeclaration",
        "ExportNamedDeclaration",
        "ExportAllDeclaration",
        "ImportExpression",
      ].includes(node.type) &&
      node.source
    )
      result.push(node.source);
    if (
      node.type === "CallExpression" &&
      (node.callee.type === "Import" || node.callee.name === "require") &&
      node.arguments[0]?.type === "StringLiteral"
    )
      result.push(node.arguments[0]);
    for (const [, child] of children(node)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (typeof child === "object") visit(child);
    }
  }
  visit(tree);
  return result;
}

async function reachableAdaptation(directory, file, seen = new Set()) {
  if (seen.has(file))
    throw new Error(`Cyclic live example reexport: ${[...seen, file].join(" -> ")}`);
  const code = await readFile(path.join(directory, "src/demos", file), "utf8");
  const tree = ast(code);
  const evidence = [{ file, sha256: digest(code) }];
  const statements = tree.program.body.filter((node) => node.type !== "EmptyStatement");
  if (
    !statements.length ||
    !statements.every(
      (node) =>
        node.type === "ExportNamedDeclaration" &&
        node.source?.value.startsWith(".") &&
        node.specifiers.every((item) => item.type === "ExportSpecifier"),
    )
  )
    return { code, evidence };
  const targets = new Set(statements.map((node) => node.source.value));
  if (targets.size !== 1)
    throw new Error(
      `Ambiguous live example reexport targets in ${file}: ${[...targets].join(", ")}`,
    );
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), [...targets][0]));
  if (!/^en\/[a-z0-9/.-]+$/.test(target) || target.split("/").includes(".."))
    throw new Error(`Unsafe live example reexport in ${file}: ${target}`);
  let resolved;
  for (const candidate of [target, `${target}.tsx`, `${target}.ts`]) {
    if (await exists(path.join(directory, "src/demos", candidate))) {
      resolved = candidate;
      break;
    }
  }
  if (!resolved) throw new Error(`Missing live example reexport target in ${file}: ${target}`);
  const implementation = await reachableAdaptation(directory, resolved, new Set([...seen, file]));
  const materialized = ast(implementation.code);
  for (const node of moduleSpecifiers(materialized)) {
    if (!node.value.startsWith(".")) continue;
    const absolute = path.posix.normalize(
      path.posix.join(path.posix.dirname(resolved), node.value),
    );
    const relative = path.posix.relative(path.posix.dirname(file), absolute);
    node.value = relative.startsWith(".") ? relative : `./${relative}`;
    delete node.extra;
  }
  const exported = new Set(
    materialized.program.body.flatMap((node) => {
      if (node.type === "ExportDefaultDeclaration") return ["default"];
      if (node.type !== "ExportNamedDeclaration") return [];
      return [
        node.declaration?.id?.name,
        ...(node.declaration?.declarations?.map((item) => item.id.name) ?? []),
        ...node.specifiers.map((item) => item.exported.name ?? item.exported.value),
      ].filter(Boolean);
    }),
  );
  for (const statement of statements) {
    const specifiers = statement.specifiers.filter((item) => {
      if (item.local.name === "default")
        throw new Error(
          `Default-only live reexport requires a named reachable implementation in ${file}`,
        );
      const name = item.exported.name ?? item.exported.value;
      if (!exported.has(name)) return true;
      if (item.local.name !== name)
        throw new Error(`Materialized export collision in ${file}: ${name}`);
      return false;
    });
    if (specifiers.length)
      materialized.program.body.push({
        ...structuredClone(statement),
        source: null,
        specifiers: structuredClone(specifiers),
      });
  }
  return {
    code: generate(materialized, { comments: true, jsescOption: { minimal: true } }).code,
    evidence: [...evidence, ...implementation.evidence],
  };
}

const appliedTranslations = (result) =>
  result.translations.filter((item) => item.applied).length +
  result.presentationMaps.filter((item) => item.applied).length +
  result.addedAccessibleAttributes.filter((item) => item.applied).length;

async function resolveHelper(directory, target) {
  for (const candidate of [target, `${target}.tsx`, `${target}.ts`]) {
    if (await exists(path.join(directory, "src/demos", candidate))) return candidate;
  }
  return null;
}

async function projectReachableHelper(
  directory,
  file,
  owner,
  english,
  chinese,
  availableHelpers,
  reports,
  cache,
  visiting = new Set(),
) {
  if (cache.has(file)) return cache.get(file);
  if (visiting.has(file)) throw new Error(`Cyclic localization helper graph for ${owner}: ${file}`);
  const implementation = await reachableAdaptation(directory, file);
  const result = localizeModule(english, chinese, implementation.code);
  const tree = ast(result.code);
  const output = path.posix.join(
    path.posix.dirname(file).replace(/^en\//, "cn/"),
    `${path.posix.basename(owner, ".tsx")}--${path.posix.basename(file)}`,
  );
  let applied = appliedTranslations(result);
  const imports = [];
  for (const node of moduleSpecifiers(tree)) {
    if (!node.value.startsWith(".")) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), node.value));
    if (!target.startsWith("en/")) continue;
    const resolved = await resolveHelper(directory, target);
    let destination = target;
    if (resolved && availableHelpers.has(resolved)) destination = resolved.replace(/^en\//, "cn/");
    else if (resolved) {
      const nested = await projectReachableHelper(
        directory,
        resolved,
        owner,
        english,
        chinese,
        availableHelpers,
        reports,
        cache,
        new Set([...visiting, file]),
      );
      if (nested.output) {
        destination = nested.output;
        applied += nested.applied;
      }
    }
    const relative = path.posix
      .relative(path.posix.dirname(output), destination)
      .replace(/\.(tsx|ts)$/, "");
    imports.push({ from: node.value, to: relative.startsWith(".") ? relative : `./${relative}` });
    node.value = imports.at(-1).to;
    delete node.extra;
  }
  const report = {
    file,
    output: applied ? output : null,
    applied,
    adaptedImplementations: implementation.evidence,
    ...result,
    helperImports: imports,
  };
  delete report.code;
  reports.push(report);
  const projection = { output: applied ? output : null, applied };
  cache.set(file, projection);
  if (applied) {
    await mkdir(path.join(directory, "src/demos", path.dirname(output)), { recursive: true });
    await writeFile(
      path.join(directory, "src/demos", output),
      `// Generated source-backed helper adaptation from HeroUI v3.2.6 (${revision}); Apache-2.0.\n${generate(tree, { comments: true, jsescOption: { minimal: true } }).code}\n`,
    );
  }
  return projection;
}

export async function generateLocalizedExamples(directory = root) {
  const source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const manifest = { en: {}, cn: {} };
  const modules = {};
  const pending = new Map();
  const prefix = "apps/docs/src/demos/";
  const relative = (value) => {
    if (
      !value.startsWith(prefix) ||
      !/^(en|cn)\/[a-z0-9/-]+\.tsx$/.test(value.slice(prefix.length))
    )
      throw new Error(`Unsafe source path: ${value}`);
    return value.slice(prefix.length);
  };
  for (const [name, example] of Object.entries(source.examples.en)) {
    const file = relative(example.source);
    if (!(await exists(path.join(directory, "src/demos", file)))) continue;
    manifest.en[name] = file;
    const counterpart = source.examples.cn[name];
    if (counterpart) pending.set(file, { en: example.file, cn: counterpart.file });
  }
  for (const helper of source.unregisteredSources ?? []) {
    if (helper.locale !== "en") continue;
    const counterpart = source.unregisteredSources.find(
      (item) => item.locale === "cn" && item.source.replace("/cn/", "/en/") === helper.source,
    );
    if (counterpart && (await exists(path.join(directory, "src/demos", relative(helper.source)))))
      pending.set(relative(helper.source), { en: helper.file, cn: counterpart.file });
  }
  const archives = new Map();
  for (const [file, records] of pending) {
    for (const record of Object.values(records)) {
      if (
        !/^content\/examples\/(en|cn)\/[a-z0-9/.-]+\.json$/.test(record) ||
        record.split("/").includes("..")
      )
        throw new Error(`Unsafe archive path: ${record}`);
    }
    archives.set(file, {
      english: JSON.parse(await readFile(path.join(directory, records.en), "utf8")),
      chinese: JSON.parse(await readFile(path.join(directory, records.cn), "utf8")),
    });
  }
  const availableHelpers = new Set(
    [...archives]
      .filter(
        ([, pair]) =>
          typeof pair.english.code === "string" && typeof pair.chinese.code === "string",
      )
      .map(([file]) => file),
  );
  for (const [file, records] of pending) {
    const { english, chinese } = archives.get(file);
    const implementation = await reachableAdaptation(directory, file);
    const adapted = implementation.code;
    if (typeof english.code !== "string" || typeof chinese.code !== "string") {
      modules[file] = {
        records,
        revision,
        status: "missing-pinned-source-code",
        reason:
          chinese.reason ??
          english.reason ??
          "Excluded source record has no code; Chinese adaptation cannot be evidenced.",
      };
      continue;
    }
    const result = localizeModule(english.code, chinese.code, adapted);
    const output = file.replace(/^en\//, "cn/");
    let applied = appliedTranslations(result);
    const status = result.identicalSource
      ? "identical-pinned-source-reuse"
      : result.equivalentSourceAst
        ? "equivalent-pinned-source-ast-reuse"
        : applied
          ? "source-backed-localized"
          : "no-source-backed-translation-applied";
    modules[file] = {
      output,
      records,
      revision,
      status,
      adaptedImplementations: implementation.evidence,
      sourceHashes: {
        en: digest(english.code),
        cn: digest(chinese.code),
        adapted: digest(adapted),
      },
      ...result,
    };
    delete modules[file].code;
    // Rewrite EN-only family helpers to the actual adapted EN file, never an absent CN helper.
    const tree = ast(result.code);
    modules[file].helperImports = [];
    modules[file].reachableHelpers = [];
    const helperCache = new Map();
    for (const node of moduleSpecifiers(tree)) {
      if (!node.value.startsWith(".")) continue;
      const specifier = node.value;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      if (!target.startsWith("en/")) continue;
      const sourceTarget = target.endsWith(".tsx") ? target : `${target}.tsx`;
      if (availableHelpers.has(sourceTarget)) {
        modules[file].helperImports.push({
          from: specifier,
          to: specifier,
          target: sourceTarget.replace(/^en\//, "cn/"),
          basis: "paired-adapted-helper",
        });
        continue;
      }
      const resolved = await resolveHelper(directory, target);
      if (resolved) {
        const projected = await projectReachableHelper(
          directory,
          resolved,
          file,
          english.code,
          chinese.code,
          availableHelpers,
          modules[file].reachableHelpers,
          helperCache,
        );
        if (projected.output) {
          const relative = path.posix
            .relative(path.posix.dirname(output), projected.output)
            .replace(/\.(tsx|ts)$/, "");
          node.value = relative.startsWith(".") ? relative : `./${relative}`;
          delete node.extra;
          applied += projected.applied;
          modules[file].helperImports.push({
            from: specifier,
            to: node.value,
            target: projected.output,
            basis: "source-backed-reachable-helper",
          });
          continue;
        }
      }
      let rewritten = path.posix.relative(path.posix.dirname(output), target);
      if (!rewritten.startsWith(".")) rewritten = `./${rewritten}`;
      node.value = rewritten;
      delete node.extra;
      modules[file].helperImports.push({
        from: specifier,
        to: rewritten,
        target,
        basis: "EN-only-adapted-helper",
      });
    }
    if (applied && modules[file].status === "no-source-backed-translation-applied")
      modules[file].status = "source-backed-localized";
    if (modules[file].status === "no-source-backed-translation-applied") {
      const destination = path.join(directory, "src/demos", output);
      if (
        (await exists(destination)) &&
        (await readFile(destination, "utf8")).startsWith("// Generated from HeroUI v3.2.6")
      )
        await unlink(destination);
      continue;
    }
    await mkdir(path.join(directory, "src/demos", path.dirname(output)), { recursive: true });
    await writeFile(
      path.join(directory, "src/demos", output),
      `// Generated from HeroUI v3.2.6 (${revision}); Apache-2.0.\n${generate(tree, { comments: true, jsescOption: { minimal: true } }).code}\n`,
    );
  }
  for (const [name, file] of Object.entries(manifest.en)) {
    const module = modules[file];
    if (module?.output && module.status !== "no-source-backed-translation-applied") {
      manifest.cn[name] =
        module.identicalSource || module.equivalentSourceAst ? file : module.output;
    }
  }
  const excluded = (source.excludedExamples ?? []).filter((item) => item.locale === "cn");
  const sourceExceptions = [];
  const inspected = new Set();
  for (const [name, entry] of Object.entries(source.examples.en)) {
    const counterpart = source.examples.cn[name];
    if (!counterpart || inspected.has(entry.file)) continue;
    inspected.add(entry.file);
    const english = JSON.parse(await readFile(path.join(directory, entry.file), "utf8"));
    const chinese = JSON.parse(await readFile(path.join(directory, counterpart.file), "utf8"));
    if (typeof english.code !== "string" || typeof chinese.code !== "string") {
      sourceExceptions.push({
        name,
        family: relative(entry.source).split("/")[1],
        records: { en: entry.file, cn: counterpart.file },
        reason: "missing-pinned-source-code",
      });
      continue;
    }
    const enShape = shape(ast(english.code));
    const cnShape = shape(ast(chinese.code));
    const structuralDifferences = differences(enShape, cnShape);
    if (structuralDifferences.length)
      sourceExceptions.push({
        name,
        family: relative(entry.source).split("/")[1],
        records: { en: entry.file, cn: counterpart.file },
        structuralDifferences,
        cnLiterals: literals(ast(chinese.code)).map(({ value, context, location }) => ({
          value,
          context,
          location,
        })),
      });
  }
  const provenance = {
    revision,
    method:
      "Pinned paired source AST literals and pure presentation maps applied to independently adapted EN modules; not browser parity evidence. unmatchedChineseLiterals records literals without direct paired locations; presentationMaps and addedAccessibleAttributes record separately handled additions.",
    modules,
    excluded,
    sourceExceptions,
  };
  await writeFile(
    path.join(directory, "src/demos/localized-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await writeFile(
    path.join(directory, "src/demos/localization-provenance.json"),
    `${JSON.stringify(provenance, null, 2)}\n`,
  );
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await generateLocalizedExamples();
