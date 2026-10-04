import * as stylex from "@stylexjs/stylex";
import fumaMDX from "fumadocs-ui/mdx";
import reference from "../generated/api-reference.json";
import { styles } from "../styles/api-reference.stylex";
import { prose } from "../styles/prose.stylex";
import { groupApiProperties } from "../lib/api-property-groups";

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
const families: Record<string, { parts: Part[] }> = reference.families;
const copy = {
  en: {
    title: "API Reference",
    intro:
      "Generated from the local public TypeScript exports. Types and callback state follow the installed native contracts, not the historical HeroUI API.",
    property: "Property",
    type: "Type",
    required: "Required",
    default: "Local default",
    description: "Description",
    yes: "Yes",
    no: "No",
    unknown: "Not declared",
    common: "Native HTML and ARIA properties",
    commonGroup: "Property set",
    sharedCommon: "Shared native HTML and ARIA properties",
    appliesTo: "Applies to",
    sharedIntro:
      "Parts with identical inherited property records share one complete table. Different native types remain separate.",
    state: "Callback state",
    defaults:
      "Only literal defaults in the component's parameter declaration are shown. Other defaults may depend on context or the native component.",
    attribution:
      "HeroUI v3.2.6 is the visual and historical reference, not an API compatibility promise.",
  },
  zh: {
    title: "API 参考",
    intro:
      "根据本地公开的 TypeScript 导出生成。类型与回调状态遵循已安装的原生接口，而不是历史 HeroUI API。",
    property: "属性",
    type: "类型",
    required: "必填",
    default: "本地默认值",
    description: "说明",
    yes: "是",
    no: "否",
    unknown: "未声明",
    common: "原生 HTML 和 ARIA 属性",
    commonGroup: "属性组",
    sharedCommon: "共享的原生 HTML 和 ARIA 属性",
    appliesTo: "适用部件",
    sharedIntro: "继承属性记录完全相同的部件共用一份完整表格。不同的原生类型仍分别保留。",
    state: "回调状态",
    defaults: "仅显示组件参数声明中的字面量默认值。其他默认值可能取决于上下文或原生组件。",
    attribution: "HeroUI v3.2.6 是视觉与历史参考，不代表 API 兼容承诺。",
  },
};

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
    // Keyboard users must be able to scroll wide type signatures.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <section {...stylex.props(prose.scroll)} tabIndex={0} aria-label={label}>
      <fumaMDX.table {...stylex.props(prose.table)}>
        <thead>
          <tr>
            {[text.property, text.type, text.required, text.default, text.description].map(
              (label) => (
                <th key={label} scope="col" {...stylex.props(prose.cell, prose.header)}>
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row" {...stylex.props(prose.cell)}>
                <code {...stylex.props(prose.code)}>{row.name}</code>
              </th>
              <td {...stylex.props(prose.cell)}>
                <code {...stylex.props(prose.code, styles.code)}>{row.expandedType}</code>
              </td>
              <td {...stylex.props(prose.cell)}>{row.required ? text.yes : text.no}</td>
              <td {...stylex.props(prose.cell)}>
                {row.default === null ? (
                  text.unknown
                ) : (
                  <code {...stylex.props(prose.code)}>{row.default}</code>
                )}
              </td>
              <td {...stylex.props(prose.cell)}>
                {row.description}
                <small {...stylex.props(styles.source)}>
                  {row.source.path}:{row.source.line}
                </small>
              </td>
            </tr>
          ))}
        </tbody>
      </fumaMDX.table>
    </section>
  );
}

export function NativeApiReference({ family, locale = "en" }: { family: string; locale?: Locale }) {
  const contract = families[family];
  if (!contract)
    throw new Error(
      `No generated native API for component family "${family}". Run docs API generation.`,
    );
  const text = copy[locale];
  const { sections, inheritedGroups } = groupApiProperties(contract.parts, reference.properties);
  const inheritedId = (id: number) => `api-${family}-inherited-${id}`;
  return (
    <section {...stylex.props(styles.reference)} aria-labelledby={`native-api-${family}`}>
      <h2 id={`native-api-${family}`}>{text.title}</h2>
      <p>{text.intro}</p>
      <p>{text.defaults}</p>
      {sections.map(({ part, own, inherited }) => {
        return (
          <section key={part.name} aria-labelledby={`api-${family}-${part.name}`}>
            <h3 id={`api-${family}-${part.name}`}>
              <code>{part.name}</code>
            </h3>
            <p>
              <code {...stylex.props(styles.code)}>{part.signature}</code>
            </p>
            <p>
              <small>
                {part.source.path}:{part.source.line}
              </small>
            </p>
            {part.members.length > 0 && (
              <p>
                <code>{part.members.map((member) => `${part.name}.${member}`).join(", ")}</code>
              </p>
            )}
            {part.native.map((specifier) => (
              <p key={specifier}>
                <a
                  href={
                    specifier.startsWith("@base-ui")
                      ? `https://base-ui.com/react/components/${specifier.split("/")[2] ?? family}`
                      : `https://react-spectrum.adobe.com/react-aria/${specifier.split("/")[1] ?? "components"}.html`
                  }
                >
                  {specifier}
                </a>
              </p>
            ))}
            <PropertyTable rows={own} locale={locale} label={`${part.name}: ${text.title}`} />
            {Object.entries(part.states).map(([name, fields]) => (
              <div key={name}>
                <h4>
                  {text.state}: <code>{name}</code>
                </h4>
                <dl>
                  {fields?.map((field) => (
                    <div key={field.name}>
                      <dt>
                        <code>
                          {field.name}
                          {field.required ? "" : "?"}
                        </code>
                      </dt>
                      <dd>
                        <code {...stylex.props(styles.code)}>{field.type}</code>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            {inherited && (
              <p>
                <a href={`#${inheritedId(inherited.id)}`}>
                  {text.common} ({inherited.rows.length}) — {text.commonGroup} {inherited.id}
                </a>
              </p>
            )}
          </section>
        );
      })}
      {inheritedGroups.length > 0 && (
        <section aria-labelledby={`api-${family}-inherited`}>
          <h3 id={`api-${family}-inherited`}>{text.sharedCommon}</h3>
          <p>{text.sharedIntro}</p>
          {inheritedGroups.map((group) => (
            <details key={group.id}>
              <summary id={inheritedId(group.id)}>
                {text.commonGroup} {group.id} ({group.rows.length})
              </summary>
              <p>
                {text.appliesTo}:{" "}
                <code {...stylex.props(styles.code)}>{group.parts.join(", ")}</code>
              </p>
              <PropertyTable
                rows={group.rows}
                locale={locale}
                label={`${text.commonGroup} ${group.id}: ${text.common}`}
              />
            </details>
          ))}
        </section>
      )}
      <p>
        {text.attribution}{" "}
        <a href={`https://github.com/heroui-inc/heroui/tree/${reference.upstream.commit}`}>
          HeroUI v{reference.upstream.version}
        </a>
      </p>
    </section>
  );
}
