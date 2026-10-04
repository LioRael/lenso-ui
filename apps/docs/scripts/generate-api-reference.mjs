import { createRequire } from "node:module";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const require = createRequire(import.meta.url);
const upstream = {
  version: "3.2.6",
  commit: "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e",
  role: "Visual and historical source reference; not the local API contract.",
};

export async function generateApiReference(directory = root, dependencyRoot = directory) {
  directory = path.resolve(directory);
  dependencyRoot = path.resolve(dependencyRoot);
  const ts = require(
    require.resolve("typescript-api", {
      paths: [path.join(dependencyRoot, "apps/docs"), dependencyRoot],
    }),
  );
  const sourceRoot = path.join(directory, "packages/react/src");
  const publicIndex = ts.createSourceFile(
    "index.ts",
    await readFile(path.join(sourceRoot, "components/index.ts"), "utf8"),
    ts.ScriptTarget.Latest,
  );
  const families = publicIndex.statements
    .filter(ts.isExportDeclaration)
    .map((statement) => statement.moduleSpecifier?.text.match(/^\.\/([^/]+)\/index\.js$/)?.[1])
    .filter(Boolean)
    .sort();
  const files = families.map((family) => path.join(sourceRoot, "components", family, "index.ts"));
  const options = {
    strict: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    jsx: ts.JsxEmit.ReactJSX,
    baseUrl: directory,
    paths: { "@lenso/tokens/*": ["packages/styles/src/components/*/index.ts"] },
    // Automatic ambient types otherwise come from the caller's cwd, changing React aliases.
    typeRoots: [...new Set([directory, dependencyRoot])].flatMap((base) => [
      path.join(base, "apps/docs/node_modules/@types"),
      path.join(base, "node_modules/@types"),
    ]),
  };
  const host = ts.createCompilerHost(options);
  host.getCurrentDirectory = () => directory;
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) => {
      const local = ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
      if (local || name.startsWith(".")) return local;
      const counterpart = path.join(dependencyRoot, path.relative(directory, containingFile));
      return ts.resolveModuleName(name, counterpart, options, host).resolvedModule;
    });
  const program = ts.createProgram(files, options, host);
  const checker = program.getTypeChecker();
  const resolutionErrors = program
    .getSemanticDiagnostics()
    .filter((diagnostic) => [2307, 7016, 2503, 2694].includes(diagnostic.code));
  if (resolutionErrors.length) {
    throw new Error(
      `API dependency/type resolution failed:\n${ts.formatDiagnosticsWithColorAndContext(
        resolutionErrors,
        {
          getCurrentDirectory: () => directory,
          getCanonicalFileName: (file) => file,
          getNewLine: () => "\n",
        },
      )}`,
    );
  }
  const flags =
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
  const format = (type, node) => checker.typeToString(type, node, flags);
  const source = (node) => {
    const file = node.getSourceFile();
    const filename = file.fileName;
    const line = file.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const relative = path.relative(directory, filename).replaceAll("\\", "/");
    const match = filename.match(/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(.+)/);
    if (match) return { path: `node_modules/${match[1]}`, line };
    return { path: relative, line };
  };
  const defaults = (declarations) => {
    const result = {};
    for (const declaration of declarations ?? []) {
      if (!declaration.parameters) continue;
      const binding = declaration.parameters[0]?.name;
      if (!binding || !ts.isObjectBindingPattern(binding)) continue;
      for (const element of binding.elements) {
        if (!element.initializer) continue;
        const value = element.initializer;
        if (
          ts.isStringLiteral(value) ||
          ts.isNumericLiteral(value) ||
          value.kind === ts.SyntaxKind.TrueKeyword ||
          value.kind === ts.SyntaxKind.FalseKeyword ||
          value.kind === ts.SyntaxKind.NullKeyword
        ) {
          result[(element.propertyName ?? element.name).getText()] = value.getText();
        }
      }
    }
    return result;
  };
  const propertyPool = [];
  const propertyIds = new Map();
  const intern = (property) => {
    const key = JSON.stringify(property);
    if (!propertyIds.has(key)) {
      propertyIds.set(key, propertyPool.length);
      propertyPool.push(property);
    }
    return propertyIds.get(key);
  };
  const output = {};
  for (const [index, family] of families.entries()) {
    const module = program.getSourceFile(files[index]);
    if (!module?.symbol) throw new Error(`Cannot resolve public module: ${files[index]}`);
    const parts = [];
    for (const exported of checker.getExportsOfModule(module.symbol)) {
      const name = exported.getName();
      if (!/^[A-Z]/.test(name) || name.endsWith("Context")) continue;
      const symbol =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const declaration = symbol.valueDeclaration;
      if (!declaration) continue;
      const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
      const signatures = type.getCallSignatures();
      if (!signatures.length) continue;
      const signature = signatures[0];
      const parameter = signature.parameters[0];
      if (!parameter) continue;
      const props = checker.getTypeOfSymbolAtLocation(
        parameter,
        signature.declaration ?? declaration,
      );
      const properties = checker.getPropertiesOfType(props);
      if (props.flags & ts.TypeFlags.Any || !properties.length) {
        throw new Error(
          `${family}.${name}: props inference failed. Resolve dependencies and the public signature; refusing an empty/any API table.`,
        );
      }
      const captured = defaults(
        [signature.declaration, ...(symbol.declarations ?? [])].filter(Boolean),
      );
      const states = new Map();
      const propertyRows = properties.map((property) => {
        const node = property.valueDeclaration ?? property.declarations?.[0] ?? declaration;
        const propertyType = checker.getTypeOfSymbolAtLocation(
          property,
          signature.declaration ?? declaration,
        );
        const text = format(propertyType, signature.declaration ?? declaration);
        const literalMembers = propertyType.isUnion() ? propertyType.types : [];
        const expandLiterals =
          literalMembers.length > 0 &&
          literalMembers.length <= 32 &&
          literalMembers.every(
            (member) =>
              member.flags &
              (ts.TypeFlags.StringLiteral |
                ts.TypeFlags.NumberLiteral |
                ts.TypeFlags.BooleanLiteral |
                ts.TypeFlags.Undefined |
                ts.TypeFlags.Null),
          );
        if (["style", "render", "children"].includes(property.name)) {
          for (const member of propertyType.isUnion() ? propertyType.types : [propertyType]) {
            for (const callback of member.getCallSignatures()) {
              for (const argument of callback.parameters) {
                const argumentType = checker.getTypeOfSymbolAtLocation(argument, node);
                const fields = checker.getPropertiesOfType(argumentType);
                if (!fields.length || fields.length > 40) continue;
                const stateName = format(argumentType, declaration);
                states.set(
                  stateName,
                  fields.map((field) => {
                    const fieldType = checker.getTypeOfSymbolAtLocation(field, node);
                    const fieldName = field.valueDeclaration?.name ?? field.declarations?.[0]?.name;
                    return {
                      name:
                        fieldName && ts.isComputedPropertyName(fieldName)
                          ? fieldName.getText()
                          : field.name,
                      type: format(fieldType, declaration),
                      required: !(field.flags & ts.SymbolFlags.Optional),
                    };
                  }),
                );
              }
            }
          }
        }
        if (
          propertyType.flags & ts.TypeFlags.Any &&
          !node.getSourceFile().fileName.includes("node_modules")
        ) {
          throw new Error(
            `${family}.${name}.${property.name}: unresolved local any type at ${JSON.stringify(source(node))}`,
          );
        }
        return intern({
          name: property.name,
          type: text,
          expandedType: expandLiterals
            ? literalMembers
                .map((member) =>
                  checker.typeToString(
                    member,
                    signature.declaration ?? declaration,
                    flags | ts.TypeFormatFlags.InTypeAlias,
                  ),
                )
                .join(" | ")
            : text,
          required: !(property.flags & ts.SymbolFlags.Optional),
          description: ts.displayPartsToString(property.getDocumentationComment(checker)),
          source: source(node),
          default: captured[property.name] ?? null,
        });
      });
      const imports = declaration
        .getSourceFile()
        .statements.filter(ts.isImportDeclaration)
        .map((statement) => statement.moduleSpecifier.text);
      const native = imports.filter((specifier) =>
        /^(?:@base-ui\/react|react-aria-components)(?:\/|$)/.test(specifier),
      );
      parts.push({
        name,
        signature: checker.signatureToString(signature, declaration, flags),
        props: format(props, signature.declaration ?? declaration),
        source: source(declaration),
        native,
        members: type
          .getProperties()
          .filter((member) => {
            const memberType = checker.getTypeOfSymbolAtLocation(member, declaration);
            return memberType.getCallSignatures().length > 0;
          })
          .map((member) => member.name),
        states: Object.fromEntries(states),
        properties: propertyRows,
      });
    }
    if (!parts.length) throw new Error(`${family}: no callable public components found.`);
    output[family] = { parts };
  }
  return { upstream, properties: propertyPool, families: output };
}

export async function writeApiReference(directory = root, dependencyRoot = directory) {
  const result = await generateApiReference(directory, dependencyRoot);
  const target = path.join(directory, "apps/docs/src/generated");
  await mkdir(target, { recursive: true });
  const { format } = await import(require.resolve("oxfmt", { paths: [dependencyRoot] }));
  const { $schema: _schema, ...formatOptions } = JSON.parse(
    await readFile(path.join(directory, "packages/standard/oxfmt.json"), "utf8"),
  );
  const formatted = await format("api-reference.json", JSON.stringify(result), formatOptions);
  if (formatted.errors.length)
    throw new Error("Failed to format the generated native API reference.");
  await writeFile(path.join(target, "api-reference.json"), formatted.code);
  console.log(
    `Native API: ${Object.keys(result.families).length} families, ${Object.values(result.families).reduce((total, family) => total + family.parts.length, 0)} public parts.`,
  );
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeApiReference(root, process.env.API_REFERENCE_DEPENDENCY_ROOT ?? root);
}
