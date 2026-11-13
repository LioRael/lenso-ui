import {
  API,
  NodeBuilderFlags,
  SignatureKind,
  SymbolFlags,
  TypeFlags,
  type Type,
} from "typescript/unstable/async";
import {
  SyntaxKind,
  isStringLiteral,
  isNumericLiteral,
  isObjectBindingPattern,
  isComputedPropertyName,
  isImportDeclaration,
  type Node,
  type SignatureDeclaration,
} from "typescript/unstable/ast";
import { parse } from "@babel/parser";
import type {
  ApiFamily,
  ApiPart,
  ApiProperty,
  ApiStateField,
} from "@lenso/ui-devtools/contract/types";
import { createRequire } from "node:module";
import { readFile, mkdir, writeFile, mkdtemp, rm, access } from "node:fs/promises";
import { writeGeneratedFile } from "./write-generated-file.ts";
import os from "node:os";
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
  const sourceRoot = path.join(directory, "packages/ui/src");
  const barrel = await readFile(path.join(sourceRoot, "components/index.ts"), "utf8");
  const parsed = parse(barrel, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const families = parsed.program.body
    .flatMap((statement) => {
      if (statement.type !== "ExportAllDeclaration" && statement.type !== "ExportNamedDeclaration")
        return [];
      const match = statement.source?.value.match(/^\.\/([^/]+)\/index\.js$/);
      return match ? [match[1]!] : [];
    })
    .sort();
  const files = families.map((family) => path.join(sourceRoot, "components", family, "index.ts"));
  const dependencyRoots = [...new Set([directory, dependencyRoot])];
  const reactTypes = dependencyRoots.flatMap((base) => [
    path.join(base, "packages/ui/node_modules/@types/react"),
    path.join(base, "apps/docs/node_modules/@types/react"),
    path.join(base, "node_modules/@types/react"),
  ]);
  const temporary = await mkdtemp(path.join(os.tmpdir(), "lenso-api-ts7-"));
  const config = path.join(temporary, "tsconfig.json");
  const localConfig = path.join(directory, "packages/ui/tsconfig.json");
  const useLocalConfig =
    directory === dependencyRoot &&
    (await access(localConfig).then(
      () => true,
      () => false,
    ));
  const api = new API({ cwd: directory });
  try {
    if (!useLocalConfig) {
      await writeFile(
        config,
        JSON.stringify({
          compilerOptions: {
            strict: true,
            skipLibCheck: true,
            target: "ESNext",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            jsx: "react-jsx",
            baseUrl: directory,
            paths: {
              "@lenso/tokens/*": [
                path.join(directory, "packages/tokens/src/components/*/index.ts"),
              ],
              react: reactTypes,
              "react/*": reactTypes.map((base) => `${base}/*`),
              "*": [
                path.join(directory, "node_modules/*"),
                path.join(dependencyRoot, "packages/ui/node_modules/*"),
                path.join(dependencyRoot, "node_modules/*"),
              ],
            },
            typeRoots: dependencyRoots.flatMap((base) => [
              path.join(base, "packages/ui/node_modules/@types"),
              path.join(base, "apps/docs/node_modules/@types"),
              path.join(base, "node_modules/@types"),
            ]),
          },
          files,
        }),
      );
    }
    const snapshot = await api.updateSnapshot({
      openProjects: [useLocalConfig ? localConfig : config],
    });
    try {
      const project = snapshot.getProjects()[0];
      if (!project) throw new Error("Cannot open the API reference TypeScript project.");
      const { program, checker, emitter } = project;
      const resolutionErrors = (await program.getSemanticDiagnostics()).filter((item) =>
        [2307, 7016, 2503, 2694].includes(item.code),
      );
      if (resolutionErrors.length)
        throw new Error(
          `API dependency/type resolution failed:\n${resolutionErrors.map((item) => `${item.fileName ?? ""}: TS${item.code}: ${item.text}`).join("\n")}`,
        );
      const flags =
        NodeBuilderFlags.NoTruncation | NodeBuilderFlags.UseAliasDefinedOutsideCurrentScope;
      const format = (type: Type, node: Node) => checker.typeToString(type, node, flags);
      const source = (node: Node) => {
        const file = node.getSourceFile();
        const filename = file.fileName;
        const line = file.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const relative = path.relative(directory, filename).replaceAll("\\", "/");
        const match = filename.match(/node_modules\/(?:\.[^/]+\/[^/]+\/node_modules\/)?(.+)/);
        return { path: match ? `node_modules/${match[1]}` : relative, line };
      };
      const defaults = (declarations: readonly (Node | undefined)[]) => {
        const result: Record<string, string> = {};
        for (const declaration of declarations) {
          if (!declaration || !("parameters" in declaration)) continue;
          const binding = (declaration as SignatureDeclaration).parameters?.[0]?.name;
          if (!binding || !isObjectBindingPattern(binding)) continue;
          for (const element of binding.elements) {
            const value = element.initializer;
            if (
              value &&
              (isStringLiteral(value) ||
                isNumericLiteral(value) ||
                value.kind === SyntaxKind.TrueKeyword ||
                value.kind === SyntaxKind.FalseKeyword ||
                value.kind === SyntaxKind.NullKeyword)
            ) {
              const key = (element.propertyName ?? element.name)?.getText();
              if (key) result[key] = value.getText();
            }
          }
        }
        return result;
      };
      const propertyPool: ApiProperty[] = [];
      const propertyIds = new Map<string, number>();
      const intern = (property: ApiProperty) => {
        const key = JSON.stringify(property);
        if (!propertyIds.has(key)) {
          propertyIds.set(key, propertyPool.length);
          propertyPool.push(property);
        }
        return propertyIds.get(key)!;
      };
      const output: Record<string, ApiFamily> = {};
      const extractedSymbols = new Map<number, ApiPart>();
      for (const [index, family] of families.entries()) {
        const module = await program.getSourceFile(files[index]!);
        const moduleSymbol = module && (await checker.getSymbolAtLocation(module));
        if (!moduleSymbol) throw new Error(`Cannot resolve public module: ${files[index]}`);
        const parts: ApiPart[] = [];
        for (const exported of await checker.getExportsOfModule(moduleSymbol)) {
          const name = exported.name;
          if (!/^[A-Z]/.test(name) || name.endsWith("Context")) continue;
          const symbol =
            exported.flags & SymbolFlags.Alias
              ? await checker.getAliasedSymbol(exported)
              : exported;
          const previous = extractedSymbols.get(symbol.id);
          if (previous) {
            parts.push({ ...previous, name });
            continue;
          }
          const declaration = await symbol.valueDeclaration?.resolve();
          if (!declaration) continue;
          const type = await checker.getTypeOfSymbolAtLocation(symbol, declaration);
          const signatures = await checker.getSignaturesOfType(type, SignatureKind.Call);
          if (!signatures.length) continue;
          const signature = signatures[0]!;
          const parameter = (await signature.getParameters())[0];
          if (!parameter) continue;
          const signatureNode = (await signature.declaration?.resolve()) ?? declaration;
          const props = await checker.getTypeOfSymbolAtLocation(parameter, signatureNode);
          const properties = await checker.getPropertiesOfType(props);
          if (props.flags & TypeFlags.Any || !properties.length)
            throw new Error(
              `${family}.${name}: props inference failed. Resolve dependencies and the public signature; refusing an empty/any API table.`,
            );
          const captured = defaults([
            signatureNode,
            ...(await Promise.all(symbol.declarations.map((item) => item.resolve()))),
          ]);
          const states = new Map<string, ApiStateField[]>();
          const results = await Promise.all(
            properties.map(async (property) => {
              const node =
                (await property.valueDeclaration?.resolve()) ??
                (await property.declarations[0]?.resolve()) ??
                declaration;
              const propertyType = await checker.getTypeOfSymbolAtLocation(property, signatureNode);
              const text = await format(propertyType, signatureNode);
              const literalMembers = propertyType.isUnionType()
                ? await propertyType.getTypes()
                : [];
              const expandLiterals =
                literalMembers.length > 0 &&
                literalMembers.length <= 32 &&
                literalMembers.every(
                  (member) =>
                    member.flags &
                    (TypeFlags.StringLiteral |
                      TypeFlags.NumberLiteral |
                      TypeFlags.BooleanLiteral |
                      TypeFlags.Undefined |
                      TypeFlags.Null),
                );
              const propertyStates: [string, ApiStateField[]][] = [];
              if (["style", "render", "children"].includes(property.name)) {
                for (const member of propertyType.isUnionType() ? literalMembers : [propertyType]) {
                  for (const callback of await checker.getSignaturesOfType(
                    member,
                    SignatureKind.Call,
                  )) {
                    for (const argument of await callback.getParameters()) {
                      const argumentType = await checker.getTypeOfSymbolAtLocation(argument, node);
                      const fields = await checker.getPropertiesOfType(argumentType);
                      if (!fields.length || fields.length > 40) continue;
                      const stateName = await format(argumentType, declaration);
                      const stateFields = await Promise.all(
                        fields.map(async (field) => {
                          const fieldType = await checker.getTypeOfSymbolAtLocation(field, node);
                          const fieldNode =
                            (await field.valueDeclaration?.resolve()) ??
                            (await field.declarations[0]?.resolve());
                          const fieldName = (fieldNode as (Node & { name?: Node }) | undefined)
                            ?.name;
                          return {
                            name:
                              fieldName && isComputedPropertyName(fieldName)
                                ? fieldName.getText()
                                : field.name.replace(/^__#\d+@#/, "#"),
                            type: await format(fieldType, declaration),
                            required: !(field.flags & SymbolFlags.Optional),
                          };
                        }),
                      );
                      propertyStates.push([stateName, stateFields]);
                    }
                  }
                }
              }
              if (
                propertyType.flags & TypeFlags.Any &&
                !node.getSourceFile().fileName.includes("node_modules")
              )
                throw new Error(
                  `${family}.${name}.${property.name}: unresolved local any type at ${JSON.stringify(source(node))}`,
                );
              const expandedType = expandLiterals
                ? (
                    await Promise.all(
                      literalMembers.map((member) =>
                        checker.typeToString(
                          member,
                          signatureNode,
                          flags | NodeBuilderFlags.InTypeAlias,
                        ),
                      ),
                    )
                  ).join(" | ")
                : text;
              return {
                property: {
                  name: property.name,
                  type: text,
                  expandedType,
                  required: !(property.flags & SymbolFlags.Optional),
                  description: await property.getDocumentationComment(checker),
                  source: source(node),
                  default: captured[property.name] ?? null,
                },
                propertyStates,
              };
            }),
          );
          const propertyRows = results.map(({ property, propertyStates }) => {
            for (const [stateName, fields] of propertyStates) states.set(stateName, fields);
            return intern(property);
          });
          const imports = declaration
            .getSourceFile()
            .statements.filter(isImportDeclaration)
            .flatMap((statement) =>
              isStringLiteral(statement.moduleSpecifier) ? [statement.moduleSpecifier.text] : [],
            );
          const native = imports.filter((specifier) =>
            /^(?:@ui-sdk\/(?:react|core)|react-aria-components)(?:\/|$)/.test(specifier),
          );
          const signatureDeclaration = await checker.signatureToSignatureDeclaration(
            signature,
            SyntaxKind.CallSignature,
            declaration,
            flags,
          );
          if (!signatureDeclaration)
            throw new Error(`${family}.${name}: signature could not be rendered.`);
          const signatureText = (await emitter.printNode(signatureDeclaration)).replace(/;$/, "");
          const members = (
            await Promise.all(
              (await checker.getPropertiesOfType(type)).map(async (member) =>
                (
                  await checker.getSignaturesOfType(
                    await checker.getTypeOfSymbolAtLocation(member, declaration),
                    SignatureKind.Call,
                  )
                ).length
                  ? member.name
                  : undefined,
              ),
            )
          ).filter((member): member is string => member !== undefined);
          const part = {
            name,
            signature: signatureText,
            props: await format(props, signatureNode),
            source: source(declaration),
            native,
            members,
            states: Object.fromEntries(states),
            properties: propertyRows,
          };
          extractedSymbols.set(symbol.id, part);
          parts.push(part);
        }
        if (!parts.length) throw new Error(`${family}: no callable public components found.`);
        output[family] = { parts };
      }
      return { upstream, properties: propertyPool, families: output };
    } finally {
      await snapshot.dispose();
    }
  } finally {
    try {
      await api.close();
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  }
}

export async function writeApiReference(directory = root, dependencyRoot = directory) {
  const result = await generateApiReference(directory, dependencyRoot);
  const target = path.join(directory, "apps/docs/src/generated");
  await mkdir(target, { recursive: true });
  const { format } = await import(require.resolve("oxfmt", { paths: [dependencyRoot] }));
  const { $schema: _schema, ...formatOptions } = JSON.parse(
    await readFile(path.join(directory, ".oxfmtrc.json"), "utf8"),
  );
  const formatted = await format("api-reference.json", JSON.stringify(result), formatOptions);
  if (formatted.errors.length)
    throw new Error("Failed to format the generated native API reference.");
  const output = path.join(target, "api-reference.json");
  await writeGeneratedFile(output, formatted.code);
  console.log(
    `Native API: ${Object.keys(result.families).length} families, ${Object.values(result.families).reduce((total, family) => total + family.parts.length, 0)} public parts.`,
  );
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeApiReference(root, process.env.API_REFERENCE_DEPENDENCY_ROOT ?? root);
}
