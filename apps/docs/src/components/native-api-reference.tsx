import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type reference from "../generated/api-reference.json";
import { styles as docsStyles } from "@lenso/docs/presentation";
import { styles } from "../styles/api-reference.stylex";
import { commonApiProperties, groupApiProperties } from "../lib/api-property-groups";

type Locale = "en" | "zh";
type Property = (typeof reference.properties)[number];
type Part = {
  name: string;
  signature: string;
  props: string;
  source: { path: string; line: number };
  native: string[];
  members: string[];
  properties: number[];
  states: Partial<Record<string, { name: string; type: string; required: boolean }[]>>;
};
export type NativeApiData = { families: Record<string, { parts: Part[] }>; properties: Property[] };
const copy = {
  en: {
    title: "API Reference",
    intro: "Component properties, callback state and native attributes.",
    property: "Property",
    type: "Type",
    required: "Required",
    default: "Local default",
    description: "Description",
    yes: "Yes",
    no: "No",
    unknown: "Not declared",
    common: "Native HTML and ARIA properties",
    composition: "Common properties and events",
    commonGroup: "Property set",
    sharedCommon: "HTML and ARIA properties",
    appliesTo: "Applies to",
    sharedIntro:
      "Expand a group to look up DOM events, accessibility labels and other native attributes for its listed parts.",
    state: "Callback state",
    declaration: "Property declarations",
    expanded: "Full type",
    implementation: "Type declaration and sources",
    properties: "properties",
    defaults:
      "— means no literal default is declared. Context and native controls may supply other defaults.",
  },
  zh: {
    title: "API 参考",
    intro: "查阅组件属性、回调状态与原生属性。",
    property: "属性",
    type: "类型",
    required: "必填",
    default: "本地默认值",
    description: "说明",
    yes: "是",
    no: "否",
    unknown: "未声明",
    common: "原生 HTML 和 ARIA 属性",
    composition: "通用属性与事件",
    commonGroup: "属性组",
    sharedCommon: "HTML 与 ARIA 属性",
    appliesTo: "适用部件",
    sharedIntro: "展开分组，查看所列部件支持的 DOM 事件、无障碍标签和其他原生属性。",
    state: "回调状态",
    declaration: "属性声明来源",
    expanded: "完整类型",
    implementation: "类型声明与来源",
    properties: "个属性",
    defaults: "— 表示未声明字面量默认值；上下文或原生控件仍可能提供默认值。",
  },
};

function propertyOrder(row: Property) {
  return row.source.path.startsWith("packages/ui/src/components/")
    ? 0
    : row.source.path.startsWith("packages/ui/")
      ? 1
      : 2;
}

function PropertyTable({
  rows,
  locale,
  label,
}: {
  rows: Property[];
  locale: Locale;
  label: string;
}) {
  const text = copy[locale];
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Long native signatures scroll within the named table region.
    <section {...stylex.props(styles.scroll)} tabIndex={0} aria-label={label}>
      <table {...stylex.props(styles.table, styles.propertyTable)}>
        <thead {...stylex.props(styles.propertyHead)}>
          <tr>
            <th scope="col" {...stylex.props(styles.cell, styles.header, styles.propertyColumn)}>
              {text.property}
            </th>
            <th scope="col" {...stylex.props(styles.cell, styles.header, styles.typeColumn)}>
              {text.type}
            </th>
            <th scope="col" {...stylex.props(styles.cell, styles.header, styles.defaultColumn)}>
              {text.default}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} {...stylex.props(styles.propertyRow)}>
              <th scope="row" {...stylex.props(styles.cell, styles.propertyNameCell)}>
                <code {...stylex.props(styles.property)}>{row.name}</code>
                {row.required && <span {...stylex.props(styles.required)}>{text.required}</span>}
                {row.description && <p {...stylex.props(styles.description)}>{row.description}</p>}
              </th>
              <td {...stylex.props(styles.cell, styles.propertyValueCell)}>
                <span aria-hidden="true" {...stylex.props(styles.mobileLabel)}>
                  {text.type}
                </span>
                {row.expandedType.length > 110 ? (
                  <details>
                    <summary {...stylex.props(styles.detailToggle)}>
                      <code {...stylex.props(styles.code, styles.type)}>
                        {row.type.length > 160 ? text.expanded : row.type}
                      </code>
                    </summary>
                    <code
                      aria-label={text.expanded}
                      {...stylex.props(styles.code, styles.expandedType)}
                    >
                      {row.expandedType}
                    </code>
                  </details>
                ) : (
                  <code {...stylex.props(styles.code, styles.type)}>{row.expandedType}</code>
                )}
              </td>
              <td {...stylex.props(styles.cell, styles.propertyValueCell)}>
                <span aria-hidden="true" {...stylex.props(styles.mobileLabel)}>
                  {text.default}
                </span>
                {row.default === null ? (
                  <span title={text.unknown} {...stylex.props(styles.default)}>
                    —
                  </span>
                ) : (
                  <code {...stylex.props(styles.code)}>{row.default}</code>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <details {...stylex.props(styles.metadata)}>
        <summary {...stylex.props(styles.detailToggle)}>{text.declaration}</summary>
        <dl>
          {rows.map((row) => (
            <div key={row.name} {...stylex.props(styles.sourceRow)}>
              <dt>
                <code {...stylex.props(styles.property)}>{row.name}</code>
              </dt>
              <dd {...stylex.props(styles.sourcePath)}>
                <code {...stylex.props(styles.source)}>
                  {row.source.path}:{row.source.line}
                </code>
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...stylex.props(styles.chevron)}>
      <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ApiDisclosure({
  initiallyOpen = false,
  summary,
  search,
  children,
}: {
  initiallyOpen?: boolean;
  summary: ReactNode;
  search: string;
  children: ReactNode;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  const [showContent, setShowContent] = useState(true);
  // Preserve full server/no-JS content, including disclosures opened by Find before hydration.
  useEffect(() => setShowContent(disclosure.current?.open ?? false), []);
  return (
    <details
      {...stylex.props(styles.part)}
      ref={disclosure}
      open={initiallyOpen}
      onToggle={(event) => {
        if (event.target === event.currentTarget) setShowContent(event.currentTarget.open);
      }}
    >
      {summary}
      <span aria-hidden="true" {...stylex.props(styles.closedIndex)}>
        {search}
      </span>
      {showContent ? children : null}
    </details>
  );
}

export function NativeApiReference({
  family,
  locale = "en",
  reference,
}: {
  family: string;
  locale?: Locale;
  reference: NativeApiData;
}) {
  const contract = reference.families[family];
  if (!contract)
    throw new Error(
      `No generated native API for component family "${family}". Run docs API generation.`,
    );
  const text = copy[locale];
  const { sections, inheritedGroups } = groupApiProperties(contract.parts, reference.properties);
  const inheritedId = (id: number) => `api-${family}-inherited-${id}`;
  return (
    <section {...stylex.props(styles.reference)} aria-labelledby={`native-api-${family}`}>
      <h2 id={`native-api-${family}`} {...stylex.props(docsStyles.h2)}>
        {text.title}
      </h2>
      <p {...stylex.props(styles.intro)}>{text.intro}</p>
      <p {...stylex.props(styles.note)}>{text.defaults}</p>
      {sections.map(({ part, own, inherited }, index) => {
        const canonical = sections.find(
          ({ part: candidate }, candidateIndex) =>
            candidateIndex < index &&
            (part.name === `${candidate.name}Root` || candidate.name === `${part.name}Root`) &&
            part.properties.length === candidate.properties.length &&
            part.properties.every((id, position) => candidate.properties[position] === id) &&
            JSON.stringify(part.states) === JSON.stringify(candidate.states),
        );
        if (canonical)
          return (
            <details key={part.name} {...stylex.props(styles.part)}>
              <summary id={`api-${family}-${part.name}`} {...stylex.props(styles.partTitle)}>
                <span>{part.name}</span>
                <Chevron />
              </summary>
              <p>
                {locale === "zh" ? "使用相同的属性契约：" : "Shares the property contract of "}
                <a href={`#api-${family}-${canonical.part.name}`}>{canonical.part.name}</a>.
              </p>
              <code {...stylex.props(styles.source)}>
                {part.source.path}:{part.source.line}
              </code>
            </details>
          );
        const componentRows = own.filter((row) => !commonApiProperties.has(row.name));
        const commonRows = own.filter((row) => commonApiProperties.has(row.name));
        return (
          <ApiDisclosure
            key={part.name}
            initiallyOpen={index === 0}
            search={[
              ...own.map((row) =>
                [
                  row.name,
                  row.description,
                  row.expandedType,
                  row.default ?? "—",
                  `${row.source.path}:${row.source.line}`,
                ].join("\n"),
              ),
              part.signature,
              `${part.source.path}:${part.source.line}`,
              ...part.members,
              ...part.native,
              ...Object.entries(part.states).flatMap(([name, fields]) => [
                name,
                ...(fields ?? []).map(
                  (field) => `${field.name}${field.required ? "" : "?"}\n${field.type}`,
                ),
              ]),
            ].join("\n")}
            summary={
              <summary id={`api-${family}-${part.name}`} {...stylex.props(styles.partTitle)}>
                <span>{part.name}</span>
                <span {...stylex.props(styles.count)}>
                  {componentRows.length} {text.properties}
                </span>
                <Chevron />
              </summary>
            }
          >
            <div {...stylex.props(styles.partBody)}>
              <PropertyTable
                rows={componentRows.sort((a, b) => propertyOrder(a) - propertyOrder(b))}
                locale={locale}
                label={`${part.name}: ${text.title}`}
              />
              {commonRows.length > 0 && (
                <details {...stylex.props(styles.metadata)}>
                  <summary {...stylex.props(styles.detailToggle)}>
                    {text.composition} ({commonRows.length})
                  </summary>
                  <PropertyTable
                    rows={commonRows}
                    locale={locale}
                    label={`${part.name}: ${text.composition}`}
                  />
                </details>
              )}
              {Object.entries(part.states).map(([name, fields]) => (
                <details key={name} {...stylex.props(styles.metadata)}>
                  <summary {...stylex.props(styles.detailToggle)}>
                    {text.state}: <code {...stylex.props(styles.stateName)}>{name}</code>
                  </summary>
                  <section
                    {...stylex.props(styles.scroll)}
                    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Callback state fields also need keyboard scrolling.
                    tabIndex={0}
                    aria-label={`${part.name}: ${text.state} ${name}`}
                  >
                    <table {...stylex.props(styles.table)}>
                      <thead>
                        <tr>
                          <th scope="col" {...stylex.props(styles.cell, styles.header)}>
                            {text.property}
                          </th>
                          <th scope="col" {...stylex.props(styles.cell, styles.header)}>
                            {text.type}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields?.map((field) => (
                          <tr key={field.name}>
                            <th scope="row" {...stylex.props(styles.cell)}>
                              <code {...stylex.props(styles.property)}>
                                {field.name}
                                {field.required ? "" : "?"}
                              </code>
                            </th>
                            <td {...stylex.props(styles.cell)}>
                              <code {...stylex.props(styles.code)}>{field.type}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </details>
              ))}
              <details {...stylex.props(styles.metadata)}>
                <summary {...stylex.props(styles.detailToggle)}>{text.implementation}</summary>
                <p {...stylex.props(styles.signature)}>
                  <code {...stylex.props(styles.code)}>{part.signature}</code>
                </p>
                <code {...stylex.props(styles.source)}>
                  {part.source.path}:{part.source.line}
                </code>
                {part.members.length > 0 && (
                  <p {...stylex.props(styles.note)}>
                    {part.members.map((member) => `${part.name}.${member}`).join(", ")}
                  </p>
                )}
                <div {...stylex.props(styles.metadataLinks)}>
                  {part.native.map((specifier) => (
                    <a
                      key={specifier}
                      href={
                        specifier === "@ui-sdk/react/primitive"
                          ? "https://ui-sdk.dev/docs/rendering"
                          : specifier.startsWith("@ui-sdk")
                            ? `https://ui-sdk.dev/docs/components/${specifier.split("/")[2] ?? family}`
                            : `https://react-spectrum.adobe.com/react-aria/${specifier.split("/")[1] ?? "components"}.html`
                      }
                    >
                      {specifier}
                    </a>
                  ))}
                </div>
              </details>
              {inherited && (
                <p>
                  <a href={`#${inheritedId(inherited.id)}`} {...stylex.props(styles.inheritedLink)}>
                    {text.common} ({inherited.rows.length})
                  </a>
                </p>
              )}
            </div>
          </ApiDisclosure>
        );
      })}
      {inheritedGroups.length > 0 && (
        <section aria-labelledby={`api-${family}-inherited`} {...stylex.props(styles.inherited)}>
          <h3 id={`api-${family}-inherited`} {...stylex.props(styles.inheritedTitle)}>
            {text.sharedCommon}
          </h3>
          <p {...stylex.props(styles.note)}>{text.sharedIntro}</p>
          {inheritedGroups.map((group) => (
            <InheritedPropertyGroup
              key={group.id}
              id={inheritedId(group.id)}
              group={group}
              locale={locale}
            />
          ))}
        </section>
      )}
    </section>
  );
}

type InheritedGroup = ReturnType<
  typeof groupApiProperties<Part, Property>
>["inheritedGroups"][number];

function InheritedPropertyGroup({
  id,
  group,
  locale,
}: {
  id: string;
  group: InheritedGroup;
  locale: Locale;
}) {
  const text = copy[locale];
  const parts = group.parts.join(", ");
  const table = (
    <PropertyTable
      rows={group.rows}
      locale={locale}
      label={`${text.commonGroup} ${group.id}: ${text.common}`}
    />
  );
  // The compact text index lets native Find open the disclosure without retaining its table DOM.
  const index = [
    ...group.rows.map((row) =>
      [
        row.name,
        row.required ? text.required : "",
        row.description,
        row.expandedType.length > 110 ? (row.type.length > 160 ? text.expanded : row.type) : "",
        row.expandedType,
        row.default ?? "—",
      ].join("\n"),
    ),
    ...group.rows.map((row) => `${row.name}\n${row.source.path}:${row.source.line}`),
  ].join("\n");
  return (
    <ApiDisclosure
      search={index}
      summary={
        <summary id={id} {...stylex.props(styles.partTitle)}>
          <span>{parts}</span>
          <span {...stylex.props(styles.count)}>
            {group.rows.length} {text.properties}
          </span>
          <Chevron />
        </summary>
      }
    >
      <p>
        {text.appliesTo}: <code {...stylex.props(styles.code)}>{parts}</code>
      </p>
      <div {...stylex.props(styles.inheritedTable)}>{table}</div>
    </ApiDisclosure>
  );
}
