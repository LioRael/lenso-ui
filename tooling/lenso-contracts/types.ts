export type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
export interface JsonObject {
  [key: string]: JsonValue;
}
export interface Provenance {
  path: string;
  line: number;
}
export interface ApiProperty {
  name: string;
  type: string;
  expandedType: string;
  required: boolean;
  description: string;
  source: Provenance;
  default: string | null;
}
export interface ApiStateField {
  name: string;
  type: string;
  required: boolean;
}
export interface ApiPart {
  name: string;
  signature: string;
  props: string | null;
  source: Provenance;
  native: string[];
  members: string[];
  states: Record<string, ApiStateField[]>;
  properties: number[];
}
export interface ApiFamily {
  parts: ApiPart[];
}
export interface ApiReference {
  upstream: JsonObject;
  properties: ApiProperty[];
  families: Record<string, ApiFamily>;
}
export interface DocMetadata {
  locale: string;
  slug: string;
  title: string;
  description: string;
}
export interface Doc extends DocMetadata {
  markdown: string;
}
export interface EncodedDoc extends DocMetadata {
  markdownLineRefs: number[];
}
export interface SourceFile {
  file: string;
  code: string;
}
export interface Example extends SourceFile {
  name: string;
  locale: string;
  files: SourceFile[];
}
export interface EncodedExample {
  name: string;
  locale: string;
  file: string;
  codeRef: number;
  helperFileRefs: number[];
}
export interface Style extends SourceFile {
  family: string;
}
export interface EncodedStyle {
  family: string;
  file: string;
  codeRef: number;
}
/** Local API assembly and relative helpers only; package dependencies remain external. */
export interface Source extends Style {
  files: SourceFile[];
}
export interface EncodedSource extends EncodedStyle {
  helperFileRefs: number[];
}
/** Ordered enclosing at-rules and selector text; values remain raw CSS, not resolved colors. */
export interface ThemeDeclaration {
  file: string;
  scope: string[];
  name: string;
  value: string;
}
export interface ThemeEditableToken {
  key: string;
  label: string;
  category: "color" | "length" | "font-family";
}
export interface Theme {
  files: SourceFile[];
  declarations: ThemeDeclaration[];
  editableTokens: ThemeEditableToken[];
  editorSource: SourceFile;
}
export interface EncodedTheme {
  fileRefs: number[];
  declarations: ThemeDeclaration[];
  editableTokens: ThemeEditableToken[];
  editorSourceRef: number;
}
export interface DocsIndexPage extends DocMetadata {
  markdownFile: string;
  examples: { name: string; file: string }[];
  navigationGroup?: string;
  navigationOrder?: number;
  componentCategory?: string;
  componentThumbnail?: string;
}
export interface DocsIndex {
  formatVersion: number;
  lensoVersion: string;
  sourceFamilyMapping: Record<string, string>;
  pages: DocsIndexPage[];
}
export interface CompatibilityDescriptor {
  schemaVersion: 1;
  node: { range: string; testedVersion: string };
  stylex: {
    compiler: string;
    version: string;
    metadataFormat: string;
    metadataVersion: number;
    compileMode: {
      dev: boolean;
      styleResolution: string;
      classNamePrefix: string;
      runtimeInjection: boolean;
    };
  };
  next: {
    version: string;
    router: string;
    bundler: string;
    customGlobalError: string;
    explicitCss: { api: string; mode: string; watch: boolean; cache: boolean };
    legacyAssetRewrite: { customGlobalError: string; version: string };
    unsupportedBundlers: string[];
  };
  vite: { testedVersion: string };
}
export interface ContractInputs {
  apiReference: ApiReference;
  docsIndex: DocsIndex;
  packageVersions: Record<string, string>;
  compatibility: CompatibilityDescriptor;
  docs: Doc[];
  examples: Example[];
  styles?: Style[];
  sources: Source[];
  theme: Theme;
  examplesRoot?: string;
  stylesRoot?: string;
}
export interface LensoContract {
  formatVersion: number;
  lensoVersion: string;
  packageVersions: Record<string, string>;
  compatibility: CompatibilityDescriptor;
  api: ApiReference;
  docs: EncodedDoc[];
  examples: EncodedExample[];
  styles: EncodedStyle[];
  sources: EncodedSource[];
  theme: EncodedTheme;
  markdownLinePool: string[];
  sourceFilePool: SourceFile[];
  digest: string;
}
export interface Schema {
  $schema?: string;
  type?: string | string[];
  const?: JsonValue;
  enum?: JsonValue[];
  additionalProperties?: boolean | Schema;
  required?: string[];
  properties?: Record<string, Schema>;
  items?: Schema;
  minLength?: number;
  minItems?: number;
  minProperties?: number;
  minimum?: number;
  pattern?: string;
}
