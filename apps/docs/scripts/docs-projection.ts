import { componentCategories } from "../src/lib/component-categories.ts";
import { documentationRedirects } from "../src/lib/redirects.ts";
import { readFile, mkdir, readdir } from "node:fs/promises";
import { writeGeneratedFile } from "./write-generated-file.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ApiReference, DocsIndexPage } from "@lenso/ui-devtools/contract/types";
import type { LiveManifest } from "./generate-live-registry.ts";
import { nativeApiMarkdown } from "../src/lib/native-api-section.ts";

interface ExampleCatalog {
  examples: Record<string, Record<string, { source: string }>>;
  pages: { locale: string; slug: string; file: string; title?: string; previews?: string[] }[];
}
type Example = { name: string; file: string };
type Locale = "en" | "cn";

const exampleTitles: Record<string, [string, string]> = {
  variants: ["Appearance variants", "外观变体"],
  sizes: ["Sizes", "尺寸"],
  disabled: ["Disabled state", "禁用状态"],
  "full-width": ["Using the available width", "占满可用宽度"],
  "with-icons": ["Actions with icons", "带图标的操作"],
  "icon-only": ["Icon-only actions", "仅图标操作"],
  loading: ["Showing progress", "显示操作进度"],
  "loading-state": ["Loading feedback", "加载反馈"],
  "on-surface": ["Inputs in a grouped form", "分组表单中的输入"],
  "with-description": ["Adding supporting text", "添加辅助说明"],
  required: ["Requiring a value", "必填字段"],
  validation: ["Validating input", "验证输入"],
  controlled: ["Managing the value", "管理字段值"],
  "with-error": ["Showing a validation error", "显示验证错误"],
  textarea: ["Entering multiple lines", "输入多行文本"],
  "input-types": ["Choosing an input type", "选择输入类型"],
  "render-function": ["Composing a custom element", "组合自定义元素"],
  "with-disabled-options": ["Disabling individual options", "禁用指定选项"],
  "multiple-select": ["Selecting multiple values", "选择多个值"],
  vertical: ["Vertical layout", "纵向排列"],
  range: ["Selecting a range", "选择范围"],
  social: ["Social actions", "社交操作"],
  "custom-variants": ["Customizing appearance", "定制外观"],
  "ripple-effect": ["Press feedback", "按压反馈"],
  "allows-empty-collection": ["No matching options", "没有匹配选项"],
  "with-sections": ["Grouped options", "分组选项"],
  "controlled-multiple": ["Managing multiple values", "管理多个值"],
  "controlled-open-state": ["Managing popup visibility", "管理弹出层显示"],
  "asynchronous-filtering": ["Loading matching options", "异步筛选选项"],
  "custom-indicator": ["Customizing the indicator", "自定义指示器"],
  "with-custom-indicator": ["Customizing the indicator", "自定义指示器"],
  "custom-value": ["Customizing the displayed value", "自定义显示值"],
  virtualization: ["Large collections", "大量选项"],
  "user-selection": ["Responding to selection", "响应选择"],
  "user-selection-multiple": ["Responding to multiple selections", "响应多选"],
  "form-example": ["Submitting a form", "提交表单"],
  "release-button-outline-variant": ["Bordered actions", "带边框的操作"],
  "format-options": ["Formatting the value", "设置值格式"],
  "international-calendar": ["Calendar systems", "日历系统"],
  "async-loading": ["Loading records", "异步加载记录"],
  sorting: ["Sorting records", "排序记录"],
  selection: ["Selecting records", "选择记录"],
  "expandable-rows": ["Expanding rows", "展开行"],
  pagination: ["Paging through records", "分页浏览记录"],
  "column-resizing": ["Resizing columns", "调整列宽"],
  "empty-state": ["No records", "没有记录"],
  "tanstack-table": ["TanStack Table integration", "集成 TanStack Table"],
  "custom-cells": ["Customizing cells", "自定义单元格"],
  "tag-group-selection": ["Selecting tags", "选择标签"],
  "location-search": ["Finding a location", "查找位置"],
  "email-recipients": ["Adding email recipients", "添加邮件收件人"],
};

export function examplePresentation(name: string, family: string, locale: Locale) {
  const suffix = name.startsWith(`${family}-`) ? name.slice(family.length + 1) : name;
  const words = suffix.replaceAll("-", " ");
  return {
    title:
      exampleTitles[suffix]?.[locale === "cn" ? 1 : 0] ??
      words.charAt(0).toUpperCase() + words.slice(1),
    basic: ["variants", "sizes", "disabled", "full-width"].includes(suffix),
  };
}

export function exampleGroup(name: string, family: string) {
  const scenario = name.startsWith(`${family}-`) ? name.slice(family.length + 1) : name;
  if (/(?:^|-)(?:validation|required|error|form)(?:-|$)/.test(scenario)) return "validation";
  if (
    /(?:controlled|async|loading|filter|selection|multiple|virtual|pagination|sorting|collection)/.test(
      scenario,
    )
  )
    return "state";
  if (/(?:variant|size|disabled|full-width|ripple|on-surface|format)/.test(scenario))
    return "appearance";
  return "composition";
}
const exampleGroups = [
  {
    title: ["State and data", "状态与数据"],
    matches: (name: string, family: string) => exampleGroup(name, family) === "state",
  },
  {
    title: ["Forms and validation", "表单与验证"],
    matches: (name: string, family: string) => exampleGroup(name, family) === "validation",
  },
  {
    title: ["Composition and actions", "组合与操作"],
    matches: (name: string, family: string) => exampleGroup(name, family) === "composition",
  },
  {
    title: ["Appearance and basic states", "外观与基础状态示例"],
    matches: (name: string, family: string) => exampleGroup(name, family) === "appearance",
  },
];

const root = fileURLToPath(new URL("../../../", import.meta.url));
const categoryFamilies: Record<string, readonly string[]> = {
  buttons: [
    "button",
    "button-group",
    "close-button",
    "glass-button",
    "glass-toggle-button",
    "popup-button",
    "toggle-button",
    "toggle-button-group",
  ],
  collections: ["list-box", "menu", "tag-group", "swipe-actions", "command"],
  colors: [
    "color-area",
    "color-field",
    "color-picker",
    "color-slider",
    "color-swatch",
    "color-swatch-picker",
  ],
  controls: ["slider", "switch", "segmented-control"],
  "data-display": ["badge", "chip", "table"],
  "date-and-time": [
    "calendar",
    "date-field",
    "date-picker",
    "date-range-picker",
    "range-calendar",
    "time-field",
  ],
  feedback: ["alert", "meter", "progress-bar", "progress-circle", "skeleton", "spinner"],
  forms: [
    "checkbox",
    "checkbox-group",
    "description",
    "field-error",
    "fieldset",
    "form",
    "input",
    "input-group",
    "input-otp",
    "label",
    "number-field",
    "radio-group",
    "search-field",
    "textarea",
    "textfield",
  ],
  layout: ["card", "glass-container", "separator", "surface", "toolbar"],
  media: ["avatar", "avatar-group"],
  navigation: [
    "command",
    "accordion",
    "breadcrumbs",
    "disclosure",
    "link",
    "navigation-bar",
    "section-index",
    "pagination",
    "tab-bar",
    "tabs",
  ],
  overlays: ["alert-dialog", "drawer", "modal", "popover", "sheet", "toast", "tooltip"],
  pickers: ["autocomplete", "combo-box", "select", "wheel-picker"],
  typography: ["kbd", "typography"],
  utilities: ["scroll-shadow"],
};
const categoryByFamily = new Map(
  Object.entries(categoryFamilies).flatMap(([category, families]) =>
    families.map((family) => [family, category] as const),
  ),
);
export const sourceFamilyMapping = Object.freeze({
  dropdown: "menu",
  "disclosure-group": "accordion",
});
export const canonicalFamily = (
  family: string,
  mapping: Record<string, string> = sourceFamilyMapping,
) => mapping[family] ?? family;
// Archived source remains available; removed public families have no live route.
export const isRetiredExample = (name: string) =>
  /^(?:header|error-message|switch-group|menu-item|menu-section|list-box-item|list-box-section)(?:-|$)/.test(
    name,
  );
export const isCustomStyleExample = (name: string) => /-custom-styles?$/.test(name);
export function canonicalExampleName(
  name: string,
  mapping: Record<string, string> = sourceFamilyMapping,
) {
  if (name.startsWith("disclosure-group-"))
    return name.replace("disclosure-group-", "accordion-native-");
  for (const [source, family] of Object.entries(mapping))
    if (name === source || name.startsWith(`${source}-`))
      return `${family}${name.slice(source.length)}`;
  return name;
}
export function canonicalDemoFile(file: string) {
  if (/^(en|cn)\/disclosure-group\//.test(file))
    return file.replace("/disclosure-group/", "/accordion/native-");
  return file.replace(
    /^((?:en|cn)\/)([^/]+)(\/)/,
    (_: string, locale: string, family: string, slash: string) =>
      `${locale}${canonicalFamily(family)}${slash}`,
  );
}

// Authored descriptions describe the local composition, not an upstream API.
const descriptions: Record<string, [string, string]> = {
  command: [
    "A command list with query filtering, keyboard navigation and Lenso presentation.",
    "支持查询过滤、键盘导航和 Lenso 样式的命令列表。",
  ],
  "glass-container": [
    "Nearby glass surfaces merge and separate while content stays clear.",
    "相邻玻璃表面随距离融合与分离，内容保持清晰。",
  ],
  "popup-button": [
    "A compact Apple-style button with a label and decorative double chevron.",
    "带有文字与装饰性双箭头的紧凑 Apple 风格按钮。",
  ],
  notification: [
    "An app notification with source identity, time, optional stacking and expandable content.",
    "包含来源、时间、可选堆叠与展开内容的应用通知。",
  ],
  "share-sheet": [
    "A sharing surface composing Sheet, target rows and grouped actions.",
    "复用 Sheet 的分享面板，包含目标横列和分组操作。",
  ],
  sidebar: [
    "Sectioned application navigation with current-page links and collapsible groups.",
    "具有当前页面链接和可折叠分组的应用导航。",
  ],
  list: [
    "Content rows with regular and tall layouts, accessories and inline controls.",
    "具有普通与双行布局、附件和行内控件的内容列表。",
  ],
  stepper: [
    "A compact increment and decrement control sharing the native number-field model.",
    "复用原生数值字段模型的紧凑增减控件。",
  ],
  "page-control": [
    "Page indicators for a carousel or a small sequence of views.",
    "用于轮播或连续视图的分页圆点指示器。",
  ],
  "segmented-control": [
    "A compact radio group for choosing one filter or form value.",
    "用于选择单个筛选条件或表单值的紧凑分段单选控件。",
  ],
  "section-index": [
    "A vertical section index with fragment links, keyboard navigation and touch scrubbing.",
    "支持锚点链接、键盘导航和触摸拖选的垂直分组索引。",
  ],
  "swipe-actions": [
    "Reveal row actions with a horizontal swipe or accessible action buttons.",
    "Reveal row actions with a horizontal swipe or accessible action buttons.",
  ],
  "wheel-picker": [
    "A scroll-snapping wheel with single selection, keyboard navigation and form values.",
    "A scroll-snapping wheel with single selection, keyboard navigation and form values.",
  ],
  "navigation-bar": [
    "Screen navigation and actions with a large title that collapses on scroll.",
    "Screen navigation and actions with a large title that collapses on scroll.",
  ],
  sheet: [
    "A focused task presented in a resizable sheet above the current context.",
    "在当前内容上方呈现、可调整高度的任务面板。",
  ],
  "action-sheet": [
    "A focused choice of actions with a title, optional message and cancellation.",
    "带有标题、可选说明与取消操作的独立操作面板。",
  ],
  "context-menu": [
    "Contextual actions opened by right click or long press, with an optional content preview.",
    "通过右键或长按打开的上下文操作菜单，可搭配内容预览。",
  ],
  "glass-magnifier": [
    "An interactive glass lens with independent dragging and spring motion controls.",
    "支持独立控制拖动与弹簧动效的交互式玻璃放大镜。",
  ],
  glass: [
    "A refracting glass surface. Use GlassMagnifier for the interactive lens.",
    "折射玻璃表面。交互式放大镜请使用 GlassMagnifier。",
  ],
  accordion: [
    "Expandable sections with independent or coordinated open state.",
    "可独立或协调展开的折叠内容区域。",
  ],
  alert: [
    "A persistent message with a title, description and optional actions.",
    "包含标题、说明和可选操作的常驻消息。",
  ],
  "alert-dialog": [
    "A modal decision that asks for confirmation before continuing.",
    "继续操作前请求确认的模态对话框。",
  ],
  autocomplete: [
    "Text input with filtered suggestions and an active descendant.",
    "带筛选建议和活动后代的文本输入框。",
  ],
  avatar: [
    "An image and fallback identifying a person or organization.",
    "标识个人或组织的头像图片与备用内容。",
  ],
  "avatar-group": [
    "A collection of avatars with an explicit overflow summary.",
    "带明确溢出摘要的头像集合。",
  ],
  badge: [
    "A compact status marker positioned relative to other content.",
    "相对于其他内容定位的紧凑状态标记。",
  ],
  breadcrumbs: [
    "A labelled navigation trail with links to ancestor locations.",
    "带标签的导航路径，提供上级位置链接。",
  ],
  "tab-bar": [
    "A glass navigation bar for major application destinations.",
    "用于应用主要目标位置的玻璃导航栏。",
  ],
  "glass-button": [
    "Glass action controls for navigation and floating toolbars.",
    "用于导航和悬浮工具栏的玻璃操作按钮。",
  ],
  button: [
    "Content-area actions with ordinary fill, tint and native activation.",
    "内容区域的普通操作按钮，支持填充、着色和原生交互。",
  ],
  "button-group": [
    "Related actions grouped without changing each button's activation contract.",
    "组合相关操作，同时保留每个按钮的激活契约。",
  ],
  calendar: [
    "A calendar grid for selecting a date using an internationalized date model.",
    "使用国际化日期模型选择日期的日历网格。",
  ],
  "calendar-year-picker": [
    "Year selection within the calendar's date and focus context.",
    "在日历日期与焦点上下文中选择年份。",
  ],
  card: [
    "A structural surface with header, body and footer sections.",
    "由头部、主体和底部组成的结构化内容表面。",
  ],
  checkbox: [
    "A checked, unchecked or indeterminate choice with a labelled control.",
    "带标签的选项，支持选中、未选中和不确定状态。",
  ],
  "checkbox-group": [
    "A labelled set of checkbox choices with shared selection state.",
    "共享选择状态的带标签复选框集合。",
  ],
  chip: [
    "A compact label for status or categorization, with optional removal.",
    "用于状态或分类的紧凑标签，可包含移除操作。",
  ],
  "close-button": [
    "An icon action for dismissing a containing surface.",
    "用于关闭所在表面的图标操作按钮。",
  ],
  "color-area": [
    "A two-dimensional color channel control in a color editing context.",
    "颜色编辑上下文中的二维颜色通道控件。",
  ],
  "color-field": [
    "Editable color text backed by the internationalized color model.",
    "基于国际化颜色模型的可编辑颜色文本。",
  ],
  "color-input-group": [
    "Input sections that share a color field's editing context.",
    "共享颜色字段编辑上下文的输入区域。",
  ],
  "color-picker": [
    "A shared color value for composing fields, sliders and swatches.",
    "为字段、滑块和色板组合提供共享颜色值。",
  ],
  "color-slider": [
    "A keyboard-operable slider for a selected color channel.",
    "可通过键盘操作的指定颜色通道滑块。",
  ],
  "color-swatch": [
    "A visible color sample, including alpha transparency.",
    "可显示透明度的颜色样本。",
  ],
  "color-swatch-picker": [
    "Selectable color samples backed by a color selection context.",
    "由颜色选择上下文管理的可选颜色样本。",
  ],
  "combo-box": [
    "An editable input and popup list that share a selected value.",
    "共享选中值的可编辑输入框与弹出列表。",
  ],
  "date-field": [
    "Segmented date editing with locale-sensitive ordering and validation.",
    "支持本地化顺序和验证的分段日期编辑。",
  ],
  "date-input-group": [
    "Date input sections sharing the date field's segment context.",
    "共享日期字段分段上下文的日期输入区域。",
  ],
  "date-picker": [
    "A date field with a calendar popup using the same date value.",
    "共享同一日期值的日期字段与日历弹出层。",
  ],
  "date-range-picker": [
    "Start and end date editing with a coordinated range calendar.",
    "与范围日历协调的开始和结束日期编辑。",
  ],
  description: [
    "Supporting text associated with a field or other labelled control.",
    "与字段或其他带标签控件关联的辅助说明。",
  ],
  disclosure: [
    "A trigger that reveals or hides an associated content panel.",
    "用于显示或隐藏关联内容面板的触发器。",
  ],
  drawer: [
    "A side panel for supporting content, navigation and preferences.",
    "依附于边缘的模态面板，提供关闭和焦点管理。",
  ],
  "empty-state": [
    "A structural explanation and next action when a collection has no content.",
    "集合没有内容时的说明与后续操作区域。",
  ],
  "field-error": [
    "Validation messages from the enclosing native field context.",
    "来自所在原生字段上下文的验证消息。",
  ],
  fieldset: [
    "A semantic group of fields with a legend and shared supporting text.",
    "由图例和共享辅助文本说明的语义字段分组。",
  ],
  form: [
    "Native form submission with field-level validation composition.",
    "支持字段级验证组合的原生表单提交。",
  ],
  input: [
    "A single-line input preserving native field state and DOM events.",
    "保留原生字段状态与 DOM 事件的单行输入框。",
  ],
  "input-group": [
    "An input with prefix, suffix and surrounding field structure.",
    "具有前缀、后缀和外围字段结构的输入框。",
  ],
  "input-otp": [
    "A segmented one-time-code input with coordinated focus and paste.",
    "协调焦点与粘贴行为的分段一次性验证码输入框。",
  ],
  kbd: ["A visual representation of a key or keyboard shortcut.", "按键或键盘快捷键的视觉表示。"],
  label: [
    "A label associated with the enclosing field or an explicit input target.",
    "与所在字段或明确输入目标关联的标签。",
  ],
  link: [
    "A navigational anchor with caller-controlled destination and content.",
    "目标与内容由调用方控制的导航链接。",
  ],
  "list-box": [
    "A selectable collection with keyboard focus and selection state.",
    "具有键盘焦点与选择状态的可选集合。",
  ],
  menu: [
    "A popup command menu with native item navigation and dismissal.",
    "具有原生命令导航和关闭行为的弹出菜单。",
  ],
  meter: [
    "A labelled scalar measurement with a bounded range.",
    "具有范围边界的带标签标量测量值。",
  ],
  modal: [
    "A general-purpose dialog for focused content, forms and full-screen tasks.",
    "支持可见性控制、焦点限制和关闭的对话框表面。",
  ],
  "number-field": [
    "Numeric editing with increment and decrement controls.",
    "具有递增和递减控件的数值编辑。",
  ],
  pagination: [
    "Page navigation with an explicit current page and page range.",
    "具有明确当前页和页码范围的分页导航。",
  ],
  popover: [
    "An anchored content popup with native positioning and dismissal.",
    "具有原生定位与关闭行为的锚定内容弹出层。",
  ],
  "progress-bar": [
    "A horizontal indicator of determinate or indeterminate progress.",
    "用于确定或不确定进度的水平指示器。",
  ],
  "progress-circle": [
    "A circular indicator of determinate or indeterminate progress.",
    "用于确定或不确定进度的圆形指示器。",
  ],
  radio: [
    "One mutually exclusive choice within a native radio group.",
    "原生单选组中的一个互斥选项。",
  ],
  "radio-group": [
    "A labelled mutually exclusive selection with keyboard navigation.",
    "支持键盘导航的带标签互斥选择集合。",
  ],
  "range-calendar": [
    "A calendar grid for choosing a start and end date together.",
    "用于同时选择开始和结束日期的日历网格。",
  ],
  "scroll-shadow": [
    "Overflow-edge feedback for a scrollable content region.",
    "可滚动内容区域的溢出边缘提示。",
  ],
  "search-field": [
    "Search text editing with a composed clear action.",
    "带组合清除操作的搜索文本编辑。",
  ],
  select: [
    "A trigger and popup list for choosing from a defined set of values.",
    "用于从固定值集合中选择的触发器与弹出列表。",
  ],
  separator: [
    "A semantic dividing line between adjacent content regions.",
    "相邻内容区域之间的语义分隔线。",
  ],
  skeleton: [
    "A visual placeholder while the corresponding content is loading.",
    "对应内容加载期间的视觉占位区域。",
  ],
  slider: [
    "One or more numeric thumbs on a keyboard-operable track.",
    "可通过键盘操作的轨道及一个或多个数值滑块。",
  ],
  spinner: [
    "A visual activity indicator that needs a meaningful accessible name.",
    "需要有意义无障碍名称的视觉活动指示器。",
  ],
  surface: [
    "A themed structural surface without added interactive behavior.",
    "不增加交互行为的主题化结构表面。",
  ],
  switch: [
    "A labelled on/off control with native checked state.",
    "具有原生选中状态的带标签开关控件。",
  ],
  table: [
    "Semantic rows, columns and cells for caller-owned tabular data.",
    "为调用方管理的表格数据提供语义行、列和单元格。",
  ],
  tabs: [
    "A tab list and associated panels with native focus and selection.",
    "具有原生焦点与选择行为的标签列表和关联面板。",
  ],
  tag: [
    "An item in a tag collection, with optional removal.",
    "标签集合中的项目，可包含移除操作。",
  ],
  "tag-group": [
    "A labelled tag collection with collection-aware keyboard behavior.",
    "具有集合键盘行为的带标签项目集合。",
  ],
  textarea: [
    "A multiline text input preserving native editing and field validation.",
    "保留原生编辑和字段验证行为的多行文本输入框。",
  ],
  textfield: [
    "A labelled text control with description and validation composition.",
    "具有说明与验证组合的带标签文本控件。",
  ],
  "time-field": [
    "Segmented time editing with locale-sensitive formatting.",
    "使用本地化格式的分段时间编辑。",
  ],
  toast: [
    "Transient messages managed by a provider, viewport and queue.",
    "由提供器、视口和队列管理的临时消息。",
  ],
  "toggle-button": [
    "An action button whose pressed state represents a selection.",
    "以按下状态表示选择的操作按钮。",
  ],
  "glass-toggle-button": [
    "A glass button with a persistent pressed state for floating controls.",
    "用于悬浮控件、具有持久选中状态的玻璃切换按钮。",
  ],
  "toggle-button-group": [
    "A coordinated collection of toggle buttons with selection state.",
    "协调选择状态的切换按钮集合。",
  ],
  toolbar: [
    "A labelled action group with native roving keyboard focus.",
    "具有原生漫游键盘焦点的带标签操作组。",
  ],
  tooltip: [
    "Supplementary text connected to a hovered or focused trigger.",
    "与悬停或聚焦触发器关联的补充文本。",
  ],
  typography: [
    "Structural text parts and typed presentation variants.",
    "结构化文本部件与类型化展示变体。",
  ],
};

const contracts: Record<string, [string, string]> = {
  command: [
    "Command composes the unstyled @lenso/primitives/command interaction layer with Lenso styles from @lenso/ui/command. Use xstyle to override the defaults. Supply a flat items collection and render matching entries through List. Give Input an accessible name; Item onSelect handles pointer or Enter activation without replacing the query. Use filter=false for external results and itemToStringValue for object labels. Base UI owns navigation and active-descendant relationships. Group and GroupLabel expose related commands; disabled items cannot execute. Compose with Dialog for a palette: the application owns shortcuts, routing and dismissal. Style active items with data-highlighted. See the runnable preview and its source for the complete composition.",
    "Command 由 @lenso/primitives/command 的无样式交互层与 @lenso/ui/command 的 Lenso 样式层组成，使用 xstyle 覆盖默认样式。传入扁平 items 集合，通过 List 渲染匹配项。为 Input 提供无障碍名称；Item 的 onSelect 响应点击与 Enter，执行时保留查询。外部检索使用 filter=false，对象标签由 itemToStringValue 提供。Base UI 管理导航和活动项关联。使用 Group 与 GroupLabel 分组，禁用项不能执行。命令面板可组合 Dialog，快捷键、路由与关闭由应用负责。使用 data-highlighted 设置活动项样式。交互预览及其源码提供完整组合。",
  ],
  "glass-container": [
    "Wrap Glass, GlassButton or GlassToggleButton in GlassContainer. Custom shapes use GlassContainer.Item with native render composition. spacing is the approximate fusion distance, independent of layout gap; rendered bounds include elastic enlargement and spring return. Matching recipes share a surface behind their content, with edge optics and the neck following one combined distance field. Mixed recipes keep individual geometry-aware lenses and a bridge overlapping the contact rim by 2px. Separation restores independent rendering; tint changes only the bridge. GlassButton and GlassToggleButton include transient press lighting that fades into the neck. Mark data-lenso-backdrop content for consistent sampling. WebKit uses lighter material paints during motion for matching untinted Small Glass and restores full optics after 100ms of stable geometry; unmarked WebKit keeps the paint fallback. disabled, reduced motion, increased contrast and reduced transparency remove bridges. Use small groups of axis-aligned shapes with uniform corners and reserve padding for animation travel. This is a Web approximation of native merging.",
    "用 GlassContainer 包裹 Glass、GlassButton 或 GlassToggleButton；其他形状通过 GlassContainer.Item 的原生 render 组合接入。spacing 控制近似连接距离，与布局间距独立；判断使用含 elastic 放大与回弹的实际边界。相同材质配方在内容后方共享融合表面，边缘折射、高光与连接处使用同一轮廓计算；不同配方保留跟随融合轮廓的独立镜片，并由覆盖接触边缘约 2px 的连接层衔接。分开后恢复独立渲染；tint 只改变连接部分。GlassButton 和 GlassToggleButton 的短暂按压高亮会向连接处逐渐减弱。标记 data-lenso-backdrop 背景以保持一致采样。WebKit 中，相同且无着色的 Small Glass 在移动时使用轻量材质绘制，稳定 100ms 后恢复完整光学效果；未标记背景则保留绘制回退。disabled、减少动态效果、提高对比度或减少透明度时移除连接。适用于少量轴对齐、统一圆角形状，并需为动画预留内边距。这是对原生融合的 Web 近似实现。",
  ],
  notification: [
    "Use Header for static notifications or Trigger with Panel for expandable content. Collapsible owns open state and keyboard activation. Notifications do not auto-dismiss or join the Toast queue; live-region announcements, dismissal and delivery are caller-owned.",
    "静态通知使用 Header，需要展开时组合 Trigger 与 Panel。折叠状态及键盘操作由 Collapsible 管理。通知不会自动消失或加入 Toast 队列；播报、关闭和分发由调用方管理。",
  ],
  "share-sheet": [
    "Compose the native Sheet portal, backdrop, viewport and popup. Target buttons and grouped actions call application handlers; this component never sends data or invokes an operating-system share API automatically. Label each target group and provide a Title for the dialog.",
    "组合原生 Sheet 的门户、遮罩、视口和面板。目标按钮及分组操作调用应用回调；组件不会自动发送数据或调用系统分享接口。请为每组目标命名并提供对话框 Title。",
  ],
  sidebar: [
    "Label the navigation landmark. Item retains native link destinations and uses selected for aria-current. Indent supports two nesting levels. Disclosure composes Base UI Collapsible; responsive drawers remain the surrounding application's responsibility.",
    "为导航区域提供标签。Item 保留原生链接地址，selected 表示当前页面。indent 支持两级缩进；Disclosure 复用 Base UI Collapsible。响应式抽屉由外围应用负责。",
  ],
  list: [
    "Use Item inside List; Content groups Title and Description. List shares the grouped-secondary background and 26px outer corners with Fieldset.Group, default Surface and Accordion's surface variant. Compose List.Separator explicitly for a 0.5px inset divider. Use Action for an actionable row, or an independently labelled control in Trailing. List retains list semantics; use Fieldset.Group for mixed form sections and ListBox for selectable options.",
    "List 内使用 Item，Content 包含 Title 和 Description。List 与 Fieldset.Group、默认 Surface、Accordion.surface 共享分组次级背景和 26px 外圆角。显式组合 List.Separator，得到 0.5px 内缩分隔线。操作行使用 Action，独立控件放在 Trailing 并提供标签。混合表单使用 Fieldset.Group，可选集合使用 ListBox。",
  ],
  stepper: [
    "Compose Input and Group with DecrementButton and IncrementButton. Input retains the accessible name, keyboard editing and form value while remaining visually hidden. Native min, max, step and controlled value contracts belong to Base UI NumberField.",
    "组合 Input 与 Group 内的增减按钮。视觉隐藏的 Input 保留可访问名称、键盘编辑和表单值；范围、步长与受控状态由 Base UI NumberField 管理。",
  ],
  "page-control": [
    "Page indices are zero-based. Supply count and optionally page/onPageChange; label the controlled view separately. Large counts use a sliding window of nine indicators with smaller overflow dots. The default prominent variant uses the shared small Glass surface with its rim and shadow in a 26px capsule; plain displays only dots without capsule padding. Button hit areas remain 44px high. Tab enters at the selected page. Arrow keys select and focus adjacent pages, with Left/Right reversed in RTL; Home/End select the first/last page. Selection stops at the ends. Controlled owners must accept onPageChange to move selection and keyboard focus.",
    "Page indices are zero-based. Supply count and optionally page/onPageChange. The default prominent variant uses the shared small Glass surface in a 26px capsule; plain displays only dots without capsule padding. Hit areas remain 44px high. Arrow keys select adjacent pages, Left/Right follow direction, and Home/End select the first/last page. Controlled owners must accept onPageChange to move selection and keyboard focus.",
  ],
  "segmented-control": [
    "Supply items with unique string values and visible labels. Base UI RadioGroup owns selection, directional keyboard navigation, disabled/read-only state, validation and form submission. Native form reset restores the uncontrolled default and respects cancellation. Use value/onValueChange or defaultValue and label the group. Appearance, sliding/held lens, label refraction and elastic feedback share Tabs' implementation. size=sm uses 28px segments; lg uses 46px. glass=false, elastic=true and lift=20 match Tabs. Labels truncate when constrained. Drag release activates the native radio; cancellation or controlled rejection restores accepted selection. Use Tabs for associated content panels.",
    "items 使用唯一字符串值和可见标签。选择、方向键、禁用与只读、校验和表单提交由 Base UI RadioGroup 管理；原生表单重置恢复非受控默认值，并尊重取消。使用 value/onValueChange 或 defaultValue，并为分组提供名称。外观、滑动与按住抬升的透镜、文字折射和弹性反馈与 Tabs 共用实现。sm 高 28px，lg 高 46px；glass=false、elastic=true、lift=20 与 Tabs 一致。空间受限时标签截断。拖动释放后激活原生单选项，取消或受控值拒绝时回到已接受状态。关联内容面板切换使用 Tabs。",
  ],
  "section-index": [
    "Supply items with unique values, short labels and same-page fragment hrefs pointing to existing section headings. Native links own navigation; onValueChange reports activation and value controls the current-location marker, not whether navigation is allowed. Up/Down and Home/End move focus without navigating; Enter activates the focused link. Touch or mouse dragging navigates through the nearest enabled entry. Only the narrow index owns touch gestures; the adjacent list keeps native scrolling. Provide a labelled nav and manage scroll-spy state in the application. Empty collections render no links.",
    "items 使用唯一值、简短标签和指向现有分组标题的本页锚点 href。原生链接负责导航；onValueChange 报告激活，value 仅控制当前位置标记，不能阻止导航。上下方向键和 Home/End 仅移动焦点，Enter 激活链接。触摸或鼠标拖动定位最近的可用项。仅窄索引区域接管触摸，旁边列表保留原生滚动。为导航提供名称，滚动监听状态由应用管理。空集合不显示链接。",
  ],
  "swipe-actions": [
    "Supply startActions and/or endActions with stable id, label and onAction. Logical sides follow the Base UI direction provider. Visible buttons reveal keyboard-accessible action groups; Escape closes and restores focus. Closed groups are inert. Inset rounded buttons support default, danger and tint variants. Release selection considers recent velocity; descendant touch-capture transfer does not cancel a swipe. Non-editable row text suppresses selection/callout while native editors remain editable. Vertical gestures stay native and cancellation restores the accepted side. Full swipe executes only an explicitly opted-in enabled action. Use openSide/onOpenSideChange for controlled state and render={<li />} inside List. Rows remain independent; the application owns coordination, deletion and undo.",
    "Supply startActions and/or endActions with id, label and onAction. Visible buttons reveal keyboard-accessible actions. Logical sides follow direction. Full swipe requires an explicit fullSwipe action; no action opts in by default. Controlled state uses openSide/onOpenSideChange. Use render={<li />} inside List. The application owns deletion and undo.",
  ],
  "wheel-picker": [
    "Supply unique string values and labels in options. Arrow keys, Home/End and typeahead reuse ListBox; disabled items are skipped and navigation stops at the ends. Native scrollend commits the nearest enabled item, with a debounce fallback. A 216px viewport, 32px slots and 34px inset selection band scale in rem units; decorative labels curve and grow at the center while accessible option names remain stable. Wheel text cannot start selection/callout. Controlled owners accept onValueChange to retain a new value. An unmatched value resolves to the first enabled option. name/form opt into form submission and uncontrolled reset. Label each wheel and compose columns for multi-part values. Physical iOS checks found a remaining fast-fling inertia difference; this is not a native physics guarantee.",
    "Supply unique string values and labels in options. Keyboard navigation reuses ListBox and skips disabled options. Native scroll snapping selects the nearest enabled item. Controlled owners accept onValueChange to retain the new value. name/form opt into form submission and uncontrolled reset. Label each wheel and compose columns for multi-part values.",
  ],
  "navigation-bar": [
    "NavigationBar composes the native Toolbar with a sticky title, optional onBack/backLabel and leading/trailing action slots. Use Toolbar.Group and Toolbar.Button for actions. The default large title scrolls beneath the bar and reveals its inline twin; only one heading is exposed to assistive technology. Set large=false for an inline heading and level for its heading level. scrollRef can identify the scrolling container; otherwise the nearest scrolling ancestor or document is used. edge reuses Toolbar's uniform, soft or none presentation. The application owns routing, history and focus/scroll restoration. This is a Web interpretation; upstream title sizes and the 12px switch threshold are not native measurement guarantees.",
    "NavigationBar composes Toolbar with a sticky title, optional onBack/backLabel and leading/trailing action slots. Use Toolbar.Group and Toolbar.Button for actions. Set large=false for an inline title. scrollRef identifies a scrolling container; otherwise the nearest scrolling ancestor or document is used. The application owns routing, history and focus/scroll restoration.",
  ],
  card: [
    "The glass variant reuses Medium Liquid Glass, mapped from the supplied iPhone medium sheet to a floating content card. This is a Lenso role mapping, not a named Apple Card. Solid content variants remain opaque.",
    "glass 复用 Medium Liquid Glass，将源文件 iPhone 中等高度 Sheet 的材料映射为浮层内容卡片；这是 Lenso 场景映射，并非 Apple 同名 Card。普通内容变体保持不透明。",
  ],
  surface: [
    "Default Surface shares the grouped-secondary background and 26px corners with Fieldset.Group, List and Accordion's surface variant. secondary uses ordinary secondary background; tertiary uses grouped tertiary. These are semantic roles, not a prominence scale. Surface paints a background and does not change child variants or expose SurfaceContext. Use Fieldset.Group for continuous form rows instead of nesting another Surface. glass retains the existing Thick blur material for floating panels, without liquid refraction.",
    "默认 Surface 与 Fieldset.Group、List、Accordion.surface 共享分组次级背景和 26px 外圆角。secondary 是普通次级背景，tertiary 是分组三级背景，它们不是强调程度阶梯。Surface 只绘制表面，不修改子控件，也不提供 SurfaceContext。连续表单行使用 Fieldset.Group，避免叠加 Surface。glass 保留浮动面板使用的 Thick 模糊材质，不运行液态折射。",
  ],
  accordion: [
    "Keep Item, Heading, Trigger and Panel in one Accordion context. surface shares the grouped-secondary background, 26px corners and 0.5px inset separators with form groups and lists. Inside Fieldset.Group, Accordion joins the existing surface and uses 52px minimum form triggers with 17px type. Expanded content starts an independent editing context. Standalone FAQ typography remains unchanged. Native value changes identify expanded items, not a DOM input value.",
    "Item、Heading、Trigger 和 Panel 应处于同一 Accordion 上下文。surface 与表单分组、列表共享分组次级背景、26px 外圆角和 0.5px 内缩分隔线。放入 Fieldset.Group 时复用现有背景，触发行最小高度 52px、字号 17px；展开内容恢复独立编辑上下文。独立 FAQ 保留自己的排版。原生值变化表示展开项目，不是输入值。",
  ],
  "alert-dialog": [
    "The default Alert is centered, 300px wide and uses shared Medium Glass. Place Title and Description in Header; Fields can wrap a TextField.Group. Footer layout accepts auto, side-by-side or stacked; auto stacks three or more actions. Action uses default, cancel or destructive roles and closes on activation unless the event is prevented. Close supplies the neutral cancellation action. Use native title/description and explicit decisions; outside presses do not dismiss an alert. Larger sizes and alternate placement are Web extensions.",
    "默认 Alert 居中、宽 300px，复用 Medium Glass。Header 放置 Title 与 Description；Fields 可组合 TextField.Group。Footer 的 layout 支持 auto、side-by-side 和 stacked；auto 在三个及以上操作时纵向排列。Action 支持 default、cancel、destructive，点击后关闭，除非阻止事件；Close 用于中性取消操作。点击外部不会关闭 Alert。较大尺寸与其他定位属于 Web 扩展。",
  ],
  "empty-state": [
    "Compose Content with an optional decorative Icon and a Message containing Title and Description. Icon accepts symbol or circle; omit it for a text-only state. Actions is a separate bottom region for existing buttons. Set the available height in the consumer; the phone canvas height is not imposed on embedded collections. Root does not automatically announce changes; add a live region only when the surrounding workflow requires it.",
    "Content 包含可选的装饰性 Icon，以及由 Title 和 Description 组成的 Message。Icon 支持 symbol 与 circle；省略图标即为纯文本状态。Actions 是独立的底部操作区，组合已有按钮。由使用方设置可用高度，不把手机画布高度强加给内嵌集合。Root 不自动播报变化；仅在具体交互需要时添加 live region。",
  ],
  autocomplete: [
    "The local family composes Base UI Combobox parts. Input, popup and options must share their root; filter text and chosen values are different concerns.",
    "本地系列组合 Base UI Combobox 部件。输入、弹出层和选项应共享根上下文；筛选文本与选中值是不同状态。",
  ],
  avatar: [
    "Keep image and fallback under the same root so image loading determines which content is visible. Give the image meaningful alternative text when it conveys identity.",
    "图片和备用内容应处于同一根节点，由图片加载状态决定可见内容。图片表达身份时应提供有意义的替代文本。",
  ],
  "avatar-group": [
    "Overflow summaries are part of the caller's composition; an avatar count is not a complete accessible description of the people represented.",
    "溢出摘要属于调用方组合；头像数量不是所代表人员的完整无障碍说明。",
  ],
  breadcrumbs: [
    "Use actual anchors for destinations and distinguish the current location from ancestor links. Separators should not become extra focus targets.",
    "目标应使用实际链接，并区分当前位置与上级链接。分隔符不应成为额外焦点目标。",
  ],
  "tab-bar": [
    "Use TabBar for application destinations, with a labelled navigation landmark and links to real routes. Set isCurrent from the router; it supplies aria-current=page. Phone layout shows icon and label, while tablet layout shows text. A separate group presents a search destination or action as an icon-only circle; its text remains accessible. The indicator follows the current route and supports press and drag animation independently of elastic. The glass groups use elastic press and drag feedback by default; set elastic to false to disable that feedback without disabling navigation or indicator animation. Use minimized and onMinimizedChange for controlled minimization, or defaultMinimized for an initially collapsed bar. Set autoMinimize to down (or true) to minimize as the scroll position increases, or up to minimize as it decreases; reverse scrolling expands the bar. It defaults to false and observes the page unless scrollTarget supplies a ref to a scrollable element. Direction changes require 8px to avoid jitter; down mode expands immediately at the top. Navigation glass uses a stronger background blur than standalone glass buttons. Its current icon expands the navigation; provide expandLabel for the current language. Use Button for actions, not route changes. Disabled native links lose their href; custom router components that require it retain it while activation is blocked, and must forward the supplied props. Selection belongs to the application; the examples update local preview state. Web glass and motion adapt the reference for browsers.",
    "TabBar 用于应用主要目标位置：为导航区域提供标签，并使用实际路由链接。根据路由设置 isCurrent，它默认提供 aria-current=page。手机布局显示图标和文字，平板布局显示文字；独立分组将搜索目标或操作显示为圆形纯图标，其文字仍供无障碍技术读取。指示器跟随当前路由移动，其按压和拖动动画独立于 elastic。玻璃分组默认提供弹性反馈；设 elastic 为 false 可关闭该反馈，但保留导航和指示器动画。使用 minimized 与 onMinimizedChange 受控收起，或使用 defaultMinimized 设置初始收起状态。autoMinimize 设为 down（或 true）时，滚动位置增大则收起；设为 up 时，滚动位置减小则收起，反向滚动展开。默认关闭并监听页面，也可通过 scrollTarget 传入滚动容器的 ref。方向累计达到 8px 后切换以避免抖动，down 模式回到顶部立即展开。导航玻璃使用比独立玻璃按钮更强的背景模糊。收起后点击当前图标可展开导航；通过 expandLabel 提供本地化标签。操作使用 Button，路由切换使用 Link。禁用的原生链接移除 href；必须接收 href 的自定义路由组件会保留它并阻止激活，且需要转发组件提供的属性。选中状态由应用管理；示例只更新本地预览状态。Web 玻璃和动效是对参考的浏览器适配。",
  ],
  button: [
    "Use prominent, bordered (default) or borderless in content areas. Use GlassButton for floating and navigation controls. destructive and tint choose color independently. Standalone buttons default to size `md` and variant `bordered`; ButtonGroup can supply these defaults. Loading blocks activation while keeping the action focusable. Native onClick, render, ref and state-dependent style remain available.",
    "内容区域使用 prominent、bordered（默认）或 borderless。悬浮与导航控件使用 GlassButton。destructive 和 tint 独立控制颜色。加载期间阻止激活并保持可聚焦；保留原生 onClick、render、ref 和状态样式回调。",
  ],
  glass: [
    "Glass renders an optical surface without the website magnifier's size or motion preset. Set dimensions and optical variables through caller styles. Use GlassMagnifier for dragging, lift and spring deformation.",
    "Glass 只渲染光学表面，不附带官网放大镜的尺寸或动效预设。通过调用方样式设置尺寸与光学变量；拖动、抬升及弹簧形变使用 GlassMagnifier。",
  ],
  "glass-magnifier": [
    "A draggable, animated magnifier built on Glass. draggable and animated default to true and can be disabled independently. The 210×150px lens has a 75px radius; caller styles can override these values. Its center stays within its parent, while its edges may extend outside. Reduced motion disables spring deformation. Provide equivalent controls when lens movement carries essential information.",
    "基于 Glass 的可拖动、可动画放大镜。draggable 与 animated 默认开启，可分别关闭。镜片默认 210×150px、圆角 75px，允许调用方覆盖。中心限制在父容器内，边缘可超出。减少动态效果时关闭弹簧形变；如果移动镜片承载必要信息，应提供等价操作方式。",
  ],
  "glass-button": [
    "Use default or prominent glass for floating controls and navigation. Sizes sm/md/lg are 28/34/50px high, including square icon-only frames. destructive and tint choose color independently. Icon-only actions require an accessible name. elastic defaults to true; icon-only controls enlarge by about 12/14/20px and return without undershooting their rest size. Default press lighting uses a bright neutral surface in both appearances with a readable dark label; prominent controls keep a tinted pressed fill. Joined ButtonGroup members disable individual deformation to preserve seams. Use isDetached for separate elastic controls. Web glass is not pixel-identical to Figma's native GLASS effect.",
    "用于悬浮操作与导航，提供 default 与 prominent 材质。sm/md/lg 高度为 28/34/50px，纯图标按钮使用对应尺寸的正方形。destructive 和 tint 独立控制颜色；纯图标操作需要无障碍名称。elastic 默认开启；纯图标按钮按压时约放大 12/14/20px，回弹不缩过初始尺寸。default 在深浅主题下都使用明亮的中性按压面与深色标签；prominent 保留着色按压面。ButtonGroup 连接模式关闭单项形变以保持接缝，isDetached 模式保留独立弹性。Web 材质与 Figma 原生 GLASS 效果并非逐像素一致。",
  ],
  "button-group": [
    "Group either Button or GlassButton members, using one family per group. Size, disabled, tint and destructive settings reach composed children, including native render triggers. prominent works for both families; bordered/borderless belong to Button and default belongs to GlassButton. Members join with automatic seams; legacy Separator parts are optional and render hidden. isDetached separates members and preserves glass elasticity. fullWidth distributes horizontal members equally; vertical members stretch to the group width. The group does not manage selection; use ToggleButtonGroup for that.",
    "每组使用 Button 或 GlassButton 中的一种。size、disabled、tint、destructive 可传递到组合后的子按钮，包括原生 render 触发器。prominent 两者通用；bordered/borderless 属于 Button，default 属于 GlassButton。连接模式自动绘制分隔边缘，旧 Separator 可省略并隐藏渲染。isDetached 分离按钮并保留玻璃弹性。fullWidth 横向等分，纵向填满组宽度；选择状态使用 ToggleButtonGroup。",
  ],
  calendar: [
    "Calendar cells and navigation compose native Base UI buttons around an internationalized calendar model. Supply internationalized date values and verify locale-specific weekday order and keyboard movement.",
    "日历单元格与导航由 Base UI 原生按钮和国际化日历模型组成。传入国际化日期值，并检查本地化星期顺序与键盘移动。",
  ],
  "calendar-year-picker": [
    "The picker participates in its calendar's visible-date and focus state; it is not an unrelated numeric field.",
    "此选择器参与所在日历的可见日期与焦点状态，不是独立数值字段。",
  ],
  checkbox: [
    "Use checked state and the native checked-change callback. An indeterminate checkbox is not equivalent to unchecked; preserve the indicator's native state.",
    "使用 checked 状态与原生选中变化回调。不确定状态不等于未选中；保留指示器原生状态。",
  ],
  "checkbox-group": [
    "Child values participate in the group's collection of checked values. Label the group as well as each individual choice.",
    "子项值参与分组的选中值集合。分组和各个选项都需要标签。",
  ],
  chip: [
    "Removal is an explicit action, not the label's click behavior. The palette scenario belongs here even when its historical reference was placed on a release page.",
    "移除是明确操作，不是标签本身的点击行为。调色板场景属于此组件，即使历史引用曾放在发布页面。",
  ],
  "close-button": [
    "Supply an accessible name describing what closes. The surrounding dialog or panel owns whether dismissal is allowed.",
    "提供说明关闭对象的无障碍名称。是否允许关闭由所在对话框或面板决定。",
  ],
  "color-area": [
    "Both editable channels belong to the shared color model. Verify arrow-key channel changes and distinguish alpha transparency from a background color.",
    "两个可编辑通道属于共享颜色模型。验证箭头键通道变化，并区分透明度与背景色。",
  ],
  "color-field": [
    "Base UI fields and inputs edit parsed internationalized color values. Keep Label, Description and validation parts in that field context.",
    "Base UI 字段与输入控件编辑解析后的国际化颜色值。Label、Description 和验证部件应位于该字段上下文。",
  ],
  "color-input-group": [
    "These sections support the enclosing Base UI color field. Reusing them in a plain Base UI input does not supply the color editing context.",
    "这些区域支持所在的 Base UI 颜色字段。放入普通 Base UI 输入框不会提供颜色编辑上下文。",
  ],
  "color-picker": [
    "Compose channel controls and swatches under the same ColorPicker value owner. Its popover uses native Base UI dismissal and focus restoration.",
    "通道控件与色板应共享 ColorPicker 值所有者。弹出层使用 Base UI 原生关闭与焦点恢复行为。",
  ],
  "color-slider": [
    "Choose the intended channel rather than treating the value as a generic number. The native callback and thumb state describe the color channel.",
    "明确指定通道，不要把值视为普通数值。原生回调与滑块状态描述颜色通道。",
  ],
  "color-swatch": [
    "A sample is not automatically a selectable option. Use the picker context when a swatch should change the selected color.",
    "颜色样本不会自动成为可选项。色板需要改变选中颜色时，应使用选择器上下文。",
  ],
  "color-swatch-picker": [
    "Picker items use the shared color selection model. Keep an accessible color name alongside the visual sample.",
    "选择器项目使用共享颜色选择模型。视觉样本应具有可访问的颜色名称。",
  ],
  "combo-box": [
    "Input, list and items must share the Combobox root. The native API distinguishes input text changes from selected-value changes.",
    "输入、列表和项目应共享 Combobox 根上下文。原生 API 区分输入文本变化与选中值变化。",
  ],
  "date-field": [
    "Segments use internationalized date values, not JavaScript Date instances. Labels, descriptions and errors depend on the same date field context.",
    "分段采用国际化日期值，不是 JavaScript Date 对象。标签、说明和错误依赖同一日期字段上下文。",
  ],
  "date-input-group": [
    "The group and native number-input segments share the enclosing internationalized date model. Preserve segment refs and locale-sensitive editing order.",
    "分组与原生数字输入分段共享所在的国际化日期模型。保留分段 ref 与本地化编辑顺序。",
  ],
  "date-picker": [
    "The field and popup calendar share one date value. Native Base UI popover parts handle positioning, dismissal and focus restoration.",
    "字段和弹出日历共享一个日期值。Base UI 原生弹出层负责定位、关闭与焦点恢复。",
  ],
  "date-range-picker": [
    "Start and end fields share the range model. Keep both field names and popup labels meaningful; a pair of unrelated date pickers is not the same contract.",
    "开始和结束字段共享范围模型。两个字段名称及弹出层标签应清晰；两个独立日期选择器不具有相同契约。",
  ],
  description: [
    "Within an ordinary field, description association is owned by Base UI Field. Date, time and color families provide their own context-dependent supporting parts.",
    "普通字段的说明关联由 Base UI Field 管理。日期、时间和颜色系列提供各自依赖上下文的辅助部件。",
  ],
  disclosure: [
    "The trigger and panel share expansion state. Keep the native trigger's activation and panel association when composing a custom render target.",
    "触发器与面板共享展开状态。自定义 render 目标应保留原生触发器激活行为与面板关联。",
  ],
  drawer: [
    "Use Drawer for leading or trailing panels containing supporting content, navigation or preferences. Use [Sheet](/docs/react/components/sheet) for bottom presentations with detents and vertical dragging. Existing up/down swipe directions remain supported. Side panels share Modal's solid content surface and rounded corners, with 8px edge spacing on narrow screens and 12px from 640px. Compose Content around Header, Body and Footer; Body owns scrolling. Use ordinary Button peers for content actions. Base UI owns focus, dismissal and swiping.",
    "Use Drawer for side panels and [Sheet](/docs/react/components/sheet) for draggable bottom content. Existing up/down swipe directions remain supported. Side panels share Modal's solid content surface, 32px corners, and 8px/12px edge spacing. Content contains Header, scrolling Body and Footer. Base UI owns focus, dismissal and swiping.",
  ],
  "field-error": [
    "This part consumes Base UI Field validation state. Place it with the corresponding field; a date-family error part uses a different context.",
    "此部件读取 Base UI Field 验证状态。应放在对应字段中；日期系列错误部件采用不同上下文。",
  ],
  fieldset: [
    "Use Fieldset.Legend to name a related settings section. Fieldset.Group owns its continuous grouped-secondary background, 26px outer corners and transparent control context. TextField supplies text rows; Fieldset.Row supplies Base UI Field semantics for switches, choices and actions, including labels and inherited disabled state. Do not wrap TextField in Row. Keep section descriptions and actions outside Group, and field errors beside their field. FieldGroup and TextField.Group remain deprecated compatibility entries; prefer Fieldset with Fieldset.Group.",
    "Fieldset.Legend 命名相关设置分区。Fieldset.Group 负责连续的分组次级背景、26px 外圆角和内部透明控件上下文。文本行使用 TextField；开关、选择项和操作使用 Fieldset.Row，复用 Base UI Field 的标签关联与禁用状态。不要再把 TextField 包进 Row。分区说明和操作放在 Group 外，字段错误紧邻对应字段。FieldGroup 与 TextField.Group 保留为弃用兼容入口，新代码使用 Fieldset 与 Fieldset.Group。",
  ],
  form: [
    "- Give each submitted control a stable `name`; Form owns submission and field validation.\n- Group related fields with `Fieldset` and `Fieldset.Group`. Place text rows directly in the group; use `Fieldset.Row` for switches and selectors.\n- Use a grouped-primary page background. Standalone stacked forms also work.\n- Map server errors through the Form contract. The example saves changes only in this page.",
    "- 为提交的控件设置稳定的 name，Form 管理提交与字段验证。\n- 相关字段使用 Fieldset 与 Fieldset.Group 分组。文本行直接放入分组；开关和选择器使用 Fieldset.Row。\n- 页面使用分组主背景，也支持独立堆叠表单。\n- 通过 Form 契约映射服务端错误。此示例的保存仅作用于当前页面。",
  ],
  input: [
    "Input defaults to an ordinary content field with 17px type, a 52px height and 26px corners. Inside Fieldset.Group it becomes transparent and retains an inset keyboard focus indicator; there is no need to select secondary just to coordinate the group background. TextField supplies labels and validation. Set glass only for a floating surface and elastic for independent press/release feedback; both default to false. Native editing owns selection and scrolling. For adornments use InputGroup with its Input part, keeping one shell around the control.",
    "Input 默认是普通内容区字段，字号 17px、高度 52px、圆角 26px。在 Fieldset.Group 内自动透明，保留内缩键盘焦点提示，不必为协调分组背景逐个设置 secondary。TextField 提供标签与验证。glass 仅用于浮动表面，elastic 独立控制按压回弹，两者默认关闭。原生编辑管理选区和滚动；前后缀使用 InputGroup 与 InputGroup.Input，共用一层外壳。",
  ],
  "input-group": [
    "The shell owns the ordinary form surface, focus and error edge. Set elastic on InputGroup to animate the complete shell; its inner parts stay stationary relative to that shell. Opt into glass only for a floating input above content; InputGroup.Input and InputGroup.TextArea stay transparent. Multiline shells keep stable rounded corners. Prefix and suffix controls retain their own names and activation semantics. Empty shell padding focuses the editable control.",
    "外壳统一绘制普通表单背景、焦点与错误边缘；在 InputGroup 上启用 elastic，让整个外壳一起反馈，内部部件不单独缩放。仅在浮动于内容上方时启用 glass；InputGroup.Input 与 InputGroup.TextArea 保持透明，多行外壳保持稳定圆角。前后缀控件保留自己的名称与激活语义；点击空白内边距可聚焦输入。",
  ],
  "input-otp": [
    "InputOTP uses 44px circular digit fields that retain a 1:1 aspect ratio when shrinking with ordinary form material by default. Choose Ordinary or Glass from the playground Preset menu. Set glass for floating code entry; each native slot uses the shared small glass material. The primary and secondary variants select ordinary fills; glass takes precedence. Native OTP coordinates slots, paste and focus. Label the complete code input. Keyboard focus and the invalid edge remain independent, without changing the material during editing.",
    "InputOTP 默认使用44px 的正圆数字格，缩小时保持 1:1 宽高比与普通表单材质。可通过交互预览顶部的场景菜单切换 Ordinary 与 Glass。浮动验证码输入可启用 glass，各原生输入格复用 small 玻璃材质。primary 与 secondary 选择普通填色，glass 优先。原生 OTP 协调分段、粘贴和焦点；应为完整验证码提供标签。键盘焦点与错误边缘独立显示，编辑时不改变材质。",
  ],
  label: [
    "Use the native Field association or an explicit htmlFor target. A visually adjacent text node is not necessarily an input's accessible name.",
    "使用原生 Field 关联或明确 htmlFor 目标。视觉相邻文本不一定是输入框的无障碍名称。",
  ],
  link: [
    "Keep href and anchor semantics when using render composition. A destination link and an action button are not interchangeable.",
    "使用 render 组合时保留 href 与链接语义。目标链接与操作按钮不能互换。",
  ],
  "list-box": [
    "The local collection model uses stable keys and Set-based selection. Arrow navigation and typeahead depend on registered items; windowed collections need their full item metadata.",
    "本地集合模型采用稳定 key 与 Set 选择。箭头导航和输入搜索依赖注册项目；窗口化集合需要完整项目元数据。",
  ],
  meter: [
    "Provide the measurement's meaningful label and native range values. Meter describes a bounded measurement, not task completion.",
    "提供有意义的测量标签与原生范围值。Meter 表达有界测量，不是任务完成进度。",
  ],
  modal: [
    "Modal is the general-purpose dialog for forms, content inspection and full-screen tasks; no separate Dialog component is exported. Use [AlertDialog](/docs/react/components/alert-dialog) for a decision requiring an explicit response, [Sheet](/docs/react/components/sheet) for draggable bottom content, and [Drawer](/docs/react/components/drawer) for supporting side panels. The content surface is solid, with 32px corners and shared panel typography. Compose Title, Description and Close inside Popup. Keep peer actions in ordinary Buttons; glass controls belong to floating navigation. The full size retains its edge-to-edge presentation. Native focus containment and focus return remain owned by Base UI.",
    "Modal is the general-purpose dialog for content, forms and full-screen tasks. Use [AlertDialog](/docs/react/components/alert-dialog) for explicit decisions, [Sheet](/docs/react/components/sheet) for draggable bottom content and [Drawer](/docs/react/components/drawer) for side panels. Modal uses a solid content surface, 32px corners and ordinary Button actions. Existing full-screen, focus and dismissal contracts remain supported.",
  ],
  "number-field": [
    "Input and steppers share the NumberField root. Consume the native numeric value callback instead of parsing every change as an unrelated text event.",
    "输入和步进按钮共享 NumberField 根上下文。使用原生数值回调，不要把每次变化解析为无关文本事件。",
  ],
  pagination: [
    "The caller owns page data and navigation destinations. Render the current-page indication and actual links or actions according to that routing model.",
    "调用方管理分页数据与导航目标。按该路由模型渲染当前页提示及实际链接或操作。",
  ],
  "progress-bar": [
    "Use the native progress value and accessible name. Indeterminate progress is not a fabricated percentage.",
    "使用原生进度值与无障碍名称。不确定进度不应伪造百分比。",
  ],
  "progress-circle": [
    "The circular presentation retains the native Progress contract. Keep the accessible value independent from the SVG appearance.",
    "圆形展示保留原生 Progress 契约。无障碍值应独立于 SVG 外观。",
  ],
  radio: [
    "A radio's value belongs to its RadioGroup. Preserve the native arrow-key selection behavior rather than making independent toggle buttons.",
    "单选项值属于 RadioGroup。保留原生箭头键选择行为，不要改为独立切换按钮。",
  ],
  "radio-group": [
    "Control the group's selected value, not each child separately. Use its native value-change signature and a meaningful group label.",
    "控制分组选中值，不要分别控制每个子项。使用原生值变化签名和明确分组标签。",
  ],
  "range-calendar": [
    "Range selection uses the internationalized start/end model. Calendar cells and navigation must remain inside that range context.",
    "范围选择采用国际化开始与结束日期模型。单元格和导航应处于该范围上下文。",
  ],
  "scroll-shadow": [
    "Shadows indicate overflow; they do not make the region keyboard-scrollable. Check the actual scroll container, dimensions and focusability.",
    "阴影提示溢出，但不会自动使区域支持键盘滚动。应检查实际滚动容器、尺寸与可聚焦性。",
  ],
  "search-field": [
    "The local field composes Base UI Field, Input and Button. Keep clear-button activation separate from form submission.",
    "本地字段组合 Base UI Field、Input 与 Button。清除按钮激活应与表单提交分开。",
  ],
  select: [
    "Base UI Select owns values, keyboard navigation and forms. List owns scrolling; attach incremental-loading scroll handlers to List. The default Select.Trigger shares PopupButton’s compact Apple-style appearance. Custom component triggers own their presentation, as they do in Menu. Select also supports neutral secondary text, full-width triggers, groups and multiple selection.",
    "选值、键盘和表单由 Base UI Select 管理。滚动由 List 承担，增量加载的滚动事件也应绑定到 List。默认 Select.Trigger 与 PopupButton 共用紧凑 Apple 风格按钮外观。与 Menu 一样，自定义组件触发器负责自身外观。Select 还支持 secondary 中性文字、全宽触发器、分组与多选。",
  ],
  "popup-button": [
    "Use `<PopupButton onClick={...}>Label</PopupButton>` as an ordinary button. It renders a native button with the local iOS 27 Figma geometry: a 44px target, 18px semibold text, a 3px decorative chevron gap, transparent background and disabled tertiary labels. Supply an accessible name and preserve native button props, refs and render composition. PopupButton does not manage values or popups. For selection, compose `<Select.Trigger render={<PopupButton />}><Select.Value /></Select.Trigger>`; Select owns the value, form and popup. For commands, compose Menu.Trigger with `render={<PopupButton />}`; Menu owns the menu and motion. PopupButton has no Root, Item, List or Portal API.",
    "像普通按钮一样使用 `<PopupButton onClick={...}>Label</PopupButton>`。它渲染原生按钮，并采用本地 iOS 27 Figma 的几何规格：44px 点击区域、18px 半粗文字、3px 装饰性双箭头间距、透明背景及禁用状态的第三级标签色。提供可访问名称，并保留原生按钮属性、ref 和 render 组合。PopupButton 不管理选值或弹层。选择场景使用 `<Select.Trigger render={<PopupButton />}><Select.Value /></Select.Trigger>`，由 Select 管理值、表单与弹层；命令场景使用 Menu.Trigger 的 `render={<PopupButton />}`，由 Menu 管理菜单和动画。PopupButton 不提供 Root、Item、List 或 Portal API。",
  ],
  slider: [
    "Thumbs share the native slider value and constraints. Give each thumb a meaningful name when a range has multiple values.",
    "滑块共享原生值与约束。范围包含多个值时，应为每个滑块提供明确名称。",
  ],
  spinner: [
    "Override the default status name when the operation needs a more specific description. The SVG is decorative; the surrounding status announces activity.",
    "操作需要更具体说明时，应覆盖默认状态名称。SVG 是装饰性内容，由外围 status 表达活动。",
  ],
  switch: [
    "Use native checked state and checked-change events. The label should describe the setting, not change between the words on and off.",
    "使用原生 checked 状态与变化事件。标签应描述设置，而不是在开与关文字之间切换。",
  ],
  table: [
    "The local table shares the collection's stable-key selection model and owns sorting and resizing contracts. Rows, headers and cells must participate in the same table context.",
    "本地表格共享集合的稳定 key 选择模型，并提供排序与尺寸调整契约。行、标题和单元格应参与同一表格上下文。",
  ],
  tabs: [
    'Triggers and panels share native tab values. Arrow keys move within the tab list; the activation mode determines when movement changes the selected panel. The default segmented wrapper uses system fill. Set `glass` for Liquid Glass, `size="sm"` or `size="lg"` for 32px or 50px height, and `lift` for pointer enlargement. Use `Tabs.ListContainer` when horizontal overflow is possible.',
    "触发器和面板共享原生标签值。箭头键在标签列表中移动；激活模式决定移动何时改变选中面板。默认容器使用系统填充，`glass` 启用玻璃底层；`size` 选择 sm（32px）或 lg（50px），`lift` 控制按下时的放大量。可能横向溢出时使用 `Tabs.ListContainer`。",
  ],
  tag: [
    "A tag participates in its TagGroup collection. Removal needs the collection's key and focus recovery, not merely hiding the rendered label.",
    "Tag 参与所在 TagGroup 集合。移除需要集合 key 与焦点恢复，不是简单隐藏标签。",
  ],
  "tag-group": [
    "Selection and removal use stable keys and Set values. In controlled mode, the owner must commit removal before the local collection restores focus.",
    "选择和移除使用稳定 key 与 Set 值。受控模式下，所有者必须提交移除后，本地集合才恢复焦点。",
  ],
  textarea: [
    'TextArea shares Input\'s ordinary form surface, 17px type and 26px corners. Fieldset.Group owns the surface of grouped rows, where TextArea stays transparent. Use TextField layout="stacked" for multiline editing. The minimum height is 112px with 16px vertical padding; rows, native resizing, events, refs and field validation remain available. glass and elastic are independent opt-ins for floating controls. For adornments use InputGroup.TextArea so the outer shell owns focus and material.',
    "TextArea 与 Input 共享普通表单背景、17px 字号和 26px 圆角。分组背景由 Fieldset.Group 统一负责，内部 TextArea 保持透明。多行字段使用 TextField 的 stacked 布局。最小高度 112px、垂直内边距 16px，保留 rows、原生缩放、事件、ref 与字段验证。glass 和 elastic 独立启用；带前后缀时使用 InputGroup.TextArea，由外壳负责焦点和材质。",
  ],
  textfield: [
    '- Use `TextField.Label`, `TextField.Input`, description and error parts to keep each field\'s purpose visible and associated.\n- Place TextField directly in `Fieldset.Group` for grouped rows. Outside a group it uses stacked layout; groups at most 360px wide also stack their labels.\n- Set `layout="stacked"` for multiline input or long instructions. Use TextArea as the editing control.\n- Controlled inputs use `value` and `onValueChange`. Clearing preserves value callbacks and focus; localize the clear action with `clearLabel`.\n- Keep errors associated with the field. New groups use Fieldset and Fieldset.Group; TextField.Group is a deprecated compatibility entry.',
    '- 使用 TextField.Label、TextField.Input、说明与错误部件，持续显示并关联字段用途。\n- TextField 直接放入 Fieldset.Group 形成分组行；分组外默认堆叠，宽度不超过 360px 的分组也会堆叠标签。\n- 多行编辑或长说明设置 layout="stacked"，编辑控件使用 TextArea。\n- 受控输入使用 value 与 onValueChange；清除操作保留回调和焦点，通过 clearLabel 本地化按钮名称。\n- 错误信息与对应字段关联。新分组使用 Fieldset 与 Fieldset.Group；TextField.Group 仅保留兼容。',
  ],
  "time-field": [
    "Time segments use the internationalized time model and locale formatting. Keep the field's supporting label and error parts in the time context.",
    "时间分段使用国际化时间模型与本地化格式。辅助标签和错误部件应处于时间上下文。",
  ],
  toast: [
    'Glass toasts use Small Glass; the pill presentation uses Medium Glass, while Notification uses Clear Glass. Choose variant="pill" for a compact notification with the shared Liquid Glass panel material and animated size and state changes. Status tone comes from toast.type; update the same manager ID to preserve the surface and focus. Toast.Progress provides a labelled native progress ring and spring-driven percentage columns around its children. Toast.Marquee uses horizontal ScrollShadow with a 12px fade and native scrolling. Use timeout: 0 for ongoing work, then explicitly close it or set a completion timeout. The update example simulates checking, download and relaunch locally; expand the installed message to read its details. Reduced motion removes resizing, text movement and the marquee. Provider, viewport and rendered messages share the native toast manager.',
    'Toast glass uses Small Glass; pill uses Medium Glass; Notification uses Clear Glass. variant="pill" 采用共享的 Liquid Glass 面板材质，提供按内容伸缩、带状态过渡的紧凑胶囊。状态色由 toast.type 决定；使用同一个管理器 ID 更新，保留通知表面与焦点。Toast.Progress 在子内容两侧提供有标签的原生进度环和弹簧驱动的数字列。Toast.Marquee 使用横向 ScrollShadow，通过 12px 渐隐呈现原生滚动的文字。持续任务设置 timeout: 0，完成后显式关闭或设置超时。更新示例仅在本地模拟检查、下载和重启；点击完成消息可展开详情。减少动态效果时取消尺寸、文字和跑马灯动画。提供器、视口和消息继续共享原生通知管理器。',
  ],
  "toggle-button": [
    "ToggleButton uses ordinary Button sizes and prominent/bordered/borderless presentation; it has no glass or elastic effects. The selected fill persists independently of hover and focus. pressed/onPressedChange control the native aria-pressed state; keep the accessible name stable. Use GlassToggleButton for glass controls. Migration: default is an alias for bordered and ghost for borderless; replace former glass toggles with GlassToggleButton.",
    "ToggleButton 使用普通 Button 的尺寸和 prominent/bordered/borderless 外观，不带玻璃或弹性。选中填充独立于悬停和焦点持续显示。通过 pressed/onPressedChange 控制原生 aria-pressed 状态，保持无障碍名称稳定。玻璃场景使用 GlassToggleButton。迁移：default 为 bordered 别名，ghost 为 borderless 别名；原先的玻璃切换按钮改用 GlassToggleButton。",
  ],
  "glass-toggle-button": [
    "GlassToggleButton shares GlassButton's material, sizes, icons and default/prominent variants, while Base UI Toggle owns pressed state, keyboard activation, refs and render composition. Use pressed/onPressedChange or defaultPressed. Keep a stable accessible name. It participates in ToggleButtonGroup; joined members disable individual elastic deformation, while detached or standalone controls respect elastic (true by default). Icon-only sizes are 28/34/50px for sm/md/lg.",
    "GlassToggleButton 复用 GlassButton 的材质、尺寸、图标和 default/prominent 外观，由 Base UI Toggle 管理选中、键盘、ref 和 render 组合。使用 pressed/onPressedChange 或 defaultPressed，保持名称稳定。可加入 ToggleButtonGroup；连接模式关闭单项弹性，分离或独立模式遵循 elastic，默认开启。sm/md/lg 纯图标按钮为 28/34/50px。",
  ],
  "toggle-button-group": [
    "Use either ToggleButton or GlassToggleButton members, with one family per group. Native value/onValueChange use an array; multiple enables multiple selection. The group preserves native orientation, loopFocus and disabled behavior. Size and tint flow through composed children. Joined members get automatic seams and only outside corners; legacy Separator parts are optional and hidden. isDetached restores separate shapes and glass elasticity. fullWidth distributes horizontal members equally and stretches vertical members. This controls pressed states, not tab panels.",
    "每组使用 ToggleButton 或 GlassToggleButton 中的一种。原生 value/onValueChange 使用数组，multiple 开启多选。保留原生 orientation、loopFocus 和 disabled 行为。size、tint 传递到组合子项。连接模式自动绘制接缝，仅保留外侧圆角，旧 Separator 可省略并隐藏。isDetached 恢复独立形状与玻璃弹性。fullWidth 横向等分、纵向填满；此组件管理选中状态，不切换 Tabs 面板。",
  ],
  sheet: [
    "Sheet uses Base UI Drawer for modal focus, Escape, outside dismissal and vertical dragging. The default snap points are 0.525 and 1; control snapPoint and onSnapPointChange to provide an accessible expand or collapse action. On narrow screens the medium detent uses Medium Glass, while the large detent uses an elevated solid surface. Wide screens use the iPad-inspired solid panel. Handle is optional and decorative; include a named Title and an explicit Close control. The default Close uses a 44px GlassButton; use GlassButton for matching header actions. dim={false} removes the visible scrim without disabling modal behavior. By default, partial snap points float. Set edgeAttachedSnapPoints to a subset of snapPoints to attach selected stops to the bottom edge. For example, `snapPoints={[0.25, 0.525, 1]}` with `edgeAttachedSnapPoints={[0.25, 1]}` produces a low attached sheet, floating middle sheet, and fully expanded sheet. Insets, bottom corners and the solid full-height surface interpolate during dragging. This three-stage configuration is a Lenso Web adaptation, not a universal iOS default. Use Popup surfaceXstyle to customize the visible surface. Geometry, responsive breakpoint and motion are Web adaptations.",
    "Sheet 使用 Base UI Drawer 管理模态焦点、Escape、外部点击关闭和垂直拖动。默认停靠点为 0.525 和 1；通过 snapPoint 与 onSnapPointChange 控制高度，并提供可通过键盘操作的展开或收起按钮。窄屏中等高度使用 Medium Glass，大高度使用实色提升背景；宽屏使用参考 iPad 的实色面板。Handle 是可选装饰，需提供有意义的 Title 和明确的 Close 控件。默认 Close 使用 44px GlassButton；其他头部操作可使用 GlassButton 保持一致。dim={false} 隐藏遮罩颜色，但保留模态行为。默认部分高度的停靠点呈悬浮样式。edgeAttachedSnapPoints 指定 snapPoints 中需要贴底的档位。例如 `snapPoints={[0.25, 0.525, 1]}` 配合 `edgeAttachedSnapPoints={[0.25, 1]}` 提供低位贴底、中位悬浮和完全展开三档。拖动时留边、底部圆角和全高实色背景连续过渡。这组三档配置属于 Lenso Web 适配，并非所有 iOS Sheet 的默认行为。可通过 Popup 的 surfaceXstyle 自定义可见表面。尺寸、响应断点和动效属于 Web 适配。",
  ],
  "action-sheet": [
    "Use ActionSheet for a focused set of operations, Popover for free-form contextual content, and Menu for navigable command lists. Compose Header, Title, optional Description and Actions inside Popup. Action and Close use native dialog dismissal; disabled actions cannot activate. The sheet shares Medium Glass, with a 300px panel, 34px corners, 14px inset, 48px actions and 8px gaps. The default placement is center on all screens. Opt into auto for bottom alignment on narrow screens, or select bottom explicitly. Set dim={false} on ActionSheet to remove background dimming without changing dismissal or focus behavior. Placement and motion are Web adaptations. Escape and outside press dismiss; focus returns to the trigger. Keep an explicit Cancel action and a meaningful title.",
    "ActionSheet 用于一组明确操作，Popover 用于自由内容，Menu 用于可导航的命令列表。在 Popup 内组合 Header、Title、可选 Description 和 Actions。Action 与 Close 使用原生对话框关闭行为，禁用操作不可触发。面板复用 Medium Glass，宽 300px、圆角 34px、内边距 14px，操作高 48px、间距 8px。默认在所有屏幕居中。可选择 auto 在窄屏底部显示，或显式选择 bottom。在 ActionSheet 上设置 dim={false} 可关闭背景变暗，不改变关闭或焦点行为；定位与动效属于 Web 适配。Escape 或点击外部关闭并将焦点返回触发按钮。请保留明确的取消操作与有意义的标题。",
  ],
  "context-menu": [
    'Right-click or long-press ContextMenu.Trigger to open contextual actions. Preview animates from the source content and returns before unmounting. Use presentation="bar" with Popup.bar and ContextMenu.BarItem for compact horizontal actions; More actions expands the complete menu. This is independent of Positioner.layout. Item, selection, submenu, material, indicator and elastic behavior share Menu implementations. Preview is an optional inert content copy; Backdrop is an optional 23% black dimmer with no backdrop blur. Positioner layout="horizontal" places the preview beside the menu on wide screens and stacks it on small screens; previewAlign controls leading/trailing alignment. The local Figma reference specifies a 250px menu, 351px preview and 30px preview radius. The 8px composition gap and 768px responsive threshold are web adaptations. Use elastic={false} to disable elastic feedback while retaining menu opening and closing. Escape dismisses the active menu; with an open submenu, the first outside press dismisses only that submenu.',
    '右键或长按 ContextMenu.Trigger 打开上下文操作。Preview 从原内容位置展开，返回完成后才卸载。通过 presentation="bar"、Popup.bar 与 ContextMenu.BarItem 组合横向操作条；右侧更多按钮展开完整菜单。这与 Positioner.layout 的预览排列方向相互独立。菜单项、选择、子菜单、材质、indicator 与 elastic 均共享 Menu 实现。Preview 是可选、不可交互的内容副本；Backdrop 是可选的 23% 黑色遮罩，不增加背景模糊。Positioner 的 layout="horizontal" 在宽屏将预览与菜单并排，小屏自动堆叠；previewAlign 控制首尾对齐。本地 Figma 参考规定菜单宽 250px、预览宽 351px、预览圆角 30px；8px 间距与 768px 响应阈值为 Web 适配。elastic={false} 关闭弹性反馈，但保留展开收起动画。Escape 关闭当前菜单；子菜单打开时，第一次点击外部仅关闭子菜单。',
  ],
  popover: [
    "Popover uses the Figma Thick material, a 38px radius and an optional 56×13px rounded arrow. Positioner side and align retain native collision handling; logical sides support RTL. The default 16px offset clears the arrow. Dark Thick is the source's 60% black paint, so a pure-black backdrop has little edge contrast. Padding and typography are Web content defaults; the native corner smoothing and rounded arrow curve are approximated in CSS. Focus, dismissal and custom trigger render composition remain Base UI contracts.",
    "Popover 使用 Figma 的 Thick 材质、38px 圆角和可选的 56×13px 圆润箭头。Positioner 的 side、align 保留原生碰撞处理，逻辑方向支持 RTL；默认 16px 间距为箭头留出空间。Dark Thick 在源设计中是 60% 黑色，因此在纯黑背景上边界对比很弱。内边距和字体是 Web 内容默认值，原生圆角平滑度与箭头曲线采用 CSS 近似。焦点、关闭及自定义 trigger render 组合仍由 Base UI 负责。",
  ],
  toolbar: [
    "Toolbar keyboard focus is coordinated by the native root. Keep action items in the toolbar context and label each group. Pass `isDetached={state}` to a glass Toolbar.Group with direct Toolbar.Button children to animate a shared capsule into separate glass controls. Keep the prop present in both states; omission preserves the standard group. Existing buttons move and unfold their inner corners over 250ms, with a neck that pinches apart; reversal retargets the current transition. The group reserves its separated extent and 40px gap. Native focus, render, refs and disabled semantics remain intact. Horizontal, vertical and RTL arrangements are supported. Reduced motion changes arrangement immediately while preserving the static joined surface.",
    "工具栏键盘焦点由原生根协调，操作项目应处于工具栏上下文，并为每组提供标签。为玻璃 Toolbar.Group 设置 `isDetached={state}`，直接放入 Toolbar.Button，即可让共享胶囊过渡为独立玻璃按钮。两个状态都应保留该属性；省略时保持原有分组模式。现有按钮以 250ms 移动并展开内侧圆角，形成连接、收颈和断开的过程；中途反向会从当前位置继续。分组预留拆开后的空间及 40px 间距。保留原生焦点、render、ref 与禁用语义，支持横向、纵向和 RTL。减少动态效果时立即切换排列并保留静态合拢表面。",
  ],
  tooltip: [
    "The tooltip supplements the trigger's accessible name; it should not contain actions that require focus. Preserve hover and focus relationships with the trigger.",
    "Tooltip 补充触发器无障碍名称，不应包含需要聚焦的操作。保留与触发器的悬停和焦点关联。",
  ],
};

const titleFor = (family: string) =>
  family === "textfield"
    ? "TextField"
    : family === "textarea"
      ? "TextArea"
      : family
          .split("-")
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join("");
const json = async <T>(file: string): Promise<T> => JSON.parse(await readFile(file, "utf8"));
const frontmatter = (title: string, description: string) =>
  `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n`;

const presentationFamilies = new Set([
  "modal",
  "drawer",
  "sheet",
  "share-sheet",
  "popover",
  "tooltip",
  "alert-dialog",
  "action-sheet",
  "menu",
  "toast",
  "notification",
]);

function presentationMaterialGuide() {
  return `### Material selection

| Presentation | Surface |
| --- | --- |
| Modal, side Drawer and desktop Sheet content | Solid content frame |
| Popover and Tooltip | Frosted background, shared by the body and default arrow |
| AlertDialog, ActionSheet and Menu | Glass panel |
| Partially presented mobile Sheet | Glass panel |
| Expanded mobile Sheet and default full ShareSheet | Solid content, following the Sheet transition |
| Toast glass / pill | Small Glass / panel Glass |
| Notification | Clear Glass |

Material follows the reference and presentation state. A solid content panel can contain separate Glass navigation controls; ordinary content actions use Button. Backdrop variants affect the page behind the panel and do not choose the panel material. Increased contrast and reduced transparency may use opaque fallbacks.

ShareSheet currently uses an unanchored Sheet layout on desktop. The native iPad sharing Popover is a separate presentation and is not implemented by changing this layout's material.`;
}

export function nativeContractNotes(reference: ApiReference, family: string, locale: Locale) {
  const zh = locale === "cn";
  const parts = reference.families[family].parts;
  const notes: string[] = [];
  if (contracts[family]) notes.push(contracts[family][zh ? 1 : 0]);
  else if (family !== "menu")
    notes.push(
      zh
        ? "此系列的结构与展示部件不会自行建立表单、选择或覆盖层状态。需要交互时，组合实际控件并提供其语义。"
        : "This family's structural and presentation parts do not establish form, selection or overlay state by themselves. Compose an actual control and its semantics when interaction is needed.",
    );
  if (presentationFamilies.has(family)) notes.push(presentationMaterialGuide());
  const native = [...new Set(parts.flatMap((part) => part.native))];
  const guidance: { name: string; description: string; owners: string[] }[] = [];
  const properties = new Map<string, string[]>();
  for (const part of parts)
    for (const id of part.properties) {
      const property = reference.properties[id];
      if (!property) throw new Error(`Missing API property ${id}: ${family}.${part.name}`);
      const owners = properties.get(property.name) ?? [];
      owners.push(part.name);
      properties.set(property.name, owners);
    }
  const describe = (name: string, en: string, cn: string) => {
    if (properties.has(name))
      guidance.push({
        name,
        description: zh ? cn : en,
        owners: [...new Set(properties.get(name)!)],
      });
  };
  describe(
    "ref",
    "Access the forwarded element or handle. Check the part’s ref type before calling DOM methods",
    "访问转发的元素或句柄；调用 DOM 方法前，先检查对应部件的 ref 类型",
  );
  describe(
    "render",
    "Compose with the native render contract, preserving supplied props and the forwarded ref",
    "按原生 render 契约组合，保留传入属性和转发 ref",
  );
  describe(
    "onOpenChange",
    "Use the native open-change callback and its typed event details rather than an onPress alias",
    "使用原生展开状态回调及其类型化事件详情，而不是 onPress 别名",
  );
  describe(
    "onValueChange",
    "Consume the native value-change signature shown below, not a synthesized DOM change event",
    "使用下方原生值变化签名，不要将其视为合成 DOM change 事件",
  );
  describe(
    "onSelectionChange",
    "Selection uses the native collection's value type; inspect the signature before controlling it",
    "选择值采用原生集合类型；受控使用前请检查签名",
  );
  describe(
    "style",
    "Pass a style object, or a state callback where the part’s type supports one",
    "传入样式对象；部件类型支持时，也可使用状态回调",
  );
  describe(
    "xstyle",
    "Caller StyleX overrides compose after the component's variant styles",
    "调用方 StyleX 覆盖样式在组件变体样式之后组合",
  );
  const groups = [
    { title: zh ? "组合" : "Composition", names: ["ref", "render"] },
    {
      title: zh ? "受控状态" : "Controlled state",
      names: ["onOpenChange", "onValueChange", "onSelectionChange"],
    },
    { title: zh ? "样式与定制" : "Styling and customization", names: ["style", "xstyle"] },
  ];
  const sections = groups.flatMap(({ title, names }) => {
    const rows = guidance.filter((note) => names.includes(note.name));
    if (!rows.length) return [];
    return [
      `### ${title}`,
      "",
      zh ? "| 属性 | 使用方式 |" : "| Property | Usage |",
      "| --- | --- |",
      ...rows.map(
        ({ name, description, owners }) =>
          `| \`${name}\` | ${description}. ${zh ? "适用部件" : "Available on"}: ${owners.map((owner) => `\`${owner}\``).join(", ")}. |`,
      ),
      "",
    ];
  });
  return [
    ...notes,
    "",
    ...(sections.length
      ? [
          "<details>",
          `<DisclosureSummary>${zh ? "组合、回调与样式参考" : "Composition, callbacks and styling reference"}</DisclosureSummary>`,
          "",
          ...sections,
        ]
      : []),
    ...(native.length
      ? [
          `${zh ? "交互基础" : "Interaction foundation"}: ${native.map((name) => `\`${name}\``).join(", ")}.`,
          "",
        ]
      : []),
    ...(sections.length ? ["</details>", ""] : []),
  ].join("\n");
}

function menuGuide(locale: Locale) {
  return locale === "cn"
    ? '## 组合与键盘\n\n`Menu.Root` 管理展开状态；`Menu.Trigger` 打开菜单。将 `Menu.Popup` 放入 `Menu.Portal` 和 `Menu.Positioner` 中，定位器处理锚点与侧边偏移，弹出层负责菜单表面。\n\n菜单项必须位于 Menu 上下文内。箭头键在可用项目间移动，Enter 或 Space 激活命令，Escape 关闭并返回触发器。子菜单使用 `Menu.SubmenuRoot` 和 `Menu.SubmenuTrigger`，不要嵌套另一个普通按钮来模拟菜单项。`Menu.SubmenuRoot presentation="stacked"` 固定使用叠层模式，`presentation="cascade"` 固定使用侧展开模式，默认 `auto` 按可用宽度选择。叠层模式通过点击、返回标题或外部点击关闭，不因鼠标移出而关闭；侧展开模式支持悬停。\n\n受控展开采用 `open` 和 `onOpenChange`；回调签名以本地 API 为准。项目行为采用 Base UI 事件，不使用 React Aria 的 `onAction` 或 `onPress`。选项、分组、链接和子菜单的运行示例均列在下方。\n\n使用 `Menu.Bar`、独立的 `Menu.BarItem` 操作与 `Menu.ExpandTrigger` 箭头组合横版菜单。将操作栏与 Portal、Popup 放在同一个 `Menu.Root` 中；箭头会让整条操作栏变形为普通菜单，Escape 反向收回并恢复箭头焦点。\n\n公开名称只有 `Menu`。历史 Dropdown 的来源名称仅保留在内部示例引用中；旧文档地址可以重定向到本页，但不表示存在 Dropdown 导出。\n'
    : '## Composition and keyboard\n\n`Menu.Root` owns open state; `Menu.Trigger` opens the menu. Place `Menu.Popup` inside `Menu.Portal` and `Menu.Positioner`: the positioner handles anchoring and side offsets, while the popup owns the menu surface.\n\nItems must participate in the Menu context. Arrow keys move between enabled items, Enter or Space activates a command, and Escape dismisses the popup and returns focus to its trigger. Submenus use `Menu.SubmenuRoot` and `Menu.SubmenuTrigger`; do not simulate an item by nesting another ordinary button. Set `Menu.SubmenuRoot presentation="stacked"` for a fixed stacked panel or `presentation="cascade"` for a fixed lateral panel. The default `auto` follows available width. Stacked panels stay open when the pointer leaves; dismiss with the heading or an outside press. Cascades support hover.\n\nControl visibility with `open` and `onOpenChange`, using the local callback signature below. Item activation uses Base UI events, not React Aria\'s `onAction` or `onPress`. Runnable examples below cover items, groups, links and submenus.\n\n`Menu.Bar` composes a horizontal Edit Menu with independent `Menu.BarItem` actions and a `Menu.ExpandTrigger` arrow. Place the bar inside `Menu.Root` alongside its portal and popup. The arrow morphs the whole bar into the regular menu; Escape reverses the transition and restores focus to the arrow.\n\nThe public name is `Menu` only. Historical Dropdown names remain internal example references; an old documentation URL may redirect here, but that does not imply a Dropdown export.\n';
}

async function authoredFiles(directory: string, prefix = "react"): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`;
    if (relative === "react/components") continue;
    if (entry.isSymbolicLink())
      throw new Error(`Authored documentation cannot escape its root: ${relative}`);
    if (entry.isDirectory())
      files.push(...(await authoredFiles(path.join(directory, entry.name), relative)));
    else if (entry.isFile() && entry.name.endsWith(".mdx")) files.push(relative);
  }
  return files.sort(
    (a, b) =>
      path.posix.dirname(a).localeCompare(path.posix.dirname(b)) ||
      Number(b.endsWith("/index.mdx")) - Number(a.endsWith("/index.mdx")) ||
      a.localeCompare(b),
  );
}

export async function generateDocsProjection(directory = root) {
  let storyFiles: string[];
  try {
    storyFiles = await readdir(path.join(directory, "apps/docs/src/stories"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    storyFiles = [];
  }
  const stories = new Set(
    storyFiles
      .filter((file) => file.endsWith(".story.tsx"))
      .map((file) => file.slice(0, -".story.tsx".length)),
  );
  const docs = path.join(path.resolve(directory), "apps/docs");
  const product = await json<{ version: string }>(path.join(directory, "packages/ui/package.json"));
  const reference = await json<ApiReference>(path.join(docs, "src/generated/api-reference.json"));
  const catalog = await json<ExampleCatalog>(path.join(docs, "content/example-catalog.json"));
  const manifests = await json<LiveManifest>(path.join(docs, "src/demos/live-manifest.json"));
  const publicIndex = await readFile(
    path.join(directory, "packages/ui/src/components/index.ts"),
    "utf8",
  );
  const families = [...publicIndex.matchAll(/from\s+["']\.\/([^/]+)\/index\.js["']/g)]
    .map((match) => match[1])
    .sort();
  if (families.includes("dropdown"))
    throw new Error("Public Dropdown export must be removed before projecting Lenso docs.");
  if (!families.length || families.join() !== Object.keys(reference.families).sort().join())
    throw new Error(
      "Native API family inventory is stale; regenerate it from the current public exports.",
    );
  const familyMetadata = Object.fromEntries(
    Object.entries(reference.families).map(([family, contract]) => [
      family,
      {
        ...(contract.parts[0] ? { source: contract.parts[0].source.path } : {}),
        native: [...new Set(contract.parts.flatMap((part) => part.native))],
        related: Object.keys(reference.families).filter(
          (candidate) =>
            candidate !== family &&
            contract.parts.some((part) =>
              part.members.some((member) =>
                reference.families[candidate].parts.some(
                  (other) => other.name === `${part.name}${member}`,
                ),
              ),
            ),
        ),
      },
    ]),
  );
  const titles = Object.fromEntries(
    families.map((family) => [
      family,
      reference.families[family].parts.find(
        (part) => part.name.toLowerCase() === family.replaceAll("-", ""),
      )?.name ?? titleFor(family),
    ]),
  );
  const pages: DocsIndexPage[] = [];
  const markdown = new Map<string, string>();
  for (const locale of ["en", "cn"] as const) {
    const authored = path.join(docs, "content/lenso", locale, "react");
    for (const file of await authoredFiles(authored)) {
      const markdownFile = `content/lenso/${locale}/${file}`;
      const text = await readFile(path.join(docs, markdownFile), "utf8");
      const fields = Object.fromEntries(
        [...text.matchAll(/^(title|description|navigationGroup|navigationOrder): (.+)$/gm)].map(
          (match) => [match[1], JSON.parse(match[2])],
        ),
      );
      if (!fields.title || !fields.description)
        throw new Error(`Missing authored metadata: ${markdownFile}`);
      pages.push({
        locale,
        slug: file.replace(/\/index\.mdx$/, "").replace(/\.mdx$/, ""),
        ...fields,
        title: fields.title,
        description: fields.description,
        markdownFile,
        examples: [],
      });
    }
    const placements = new Map<string, Example[]>(families.map((family) => [family, []]));
    const names = new Set();
    for (const [rawSourceRef, entry] of Object.entries(catalog.examples[locale])) {
      if (isCustomStyleExample(rawSourceRef) || isRetiredExample(rawSourceRef)) continue;
      const name = canonicalExampleName(rawSourceRef);
      if (names.has(name)) throw new Error(`Canonical example name collision: ${locale}:${name}`);
      names.add(name);
      const sourceFamily = /^apps\/docs\/src\/demos\/(?:en|cn)\/([^/]+)\//.exec(entry.source)?.[1];
      const family = canonicalFamily(sourceFamily!);
      if (!placements.has(family))
        throw new Error(`No native public family for ${locale}:${name} (${entry.source})`);
      const file = manifests[locale]?.[name];
      if (!file) throw new Error(`No runnable local example: ${locale}:${name}`);
      if (file !== canonicalDemoFile(file))
        throw new Error(`Noncanonical local example file: ${file}`);
      if (!/^(?:en|cn)\/[a-z0-9/-]+\.tsx$/.test(file))
        throw new Error(`Unsafe example file: ${file}`);
      await readFile(path.join(docs, "src/demos", file));
      placements.get(family)!.push({ name, file });
    }
    const overviewFile = `content/lenso/${locale}/react/components/index.mdx`;
    const overviewTitle = locale === "cn" ? "组件" : "Components";
    const overviewDescription =
      locale === "cn"
        ? "浏览当前公开组件系列的原生 API 与本地运行示例。"
        : "Browse the current public families, native APIs and local runnable examples.";
    const componentPages = families.map((family) => ({
      family,
      componentCategory: categoryByFamily.get(family) ?? "additional",
    }));
    const categorySections = componentCategories
      .map(([category, englishLabel, chineseLabel]) => {
        const members = componentPages.filter((page) => page.componentCategory === category);
        if (!members.length) return null;
        return `## ${locale === "cn" ? chineseLabel : englishLabel}\n\n<ComponentsCategory category="${category}" />`;
      })
      .filter(Boolean)
      .join("\n\n");
    markdown.set(
      overviewFile,
      `${frontmatter(overviewTitle, overviewDescription)}${categorySections}\n`,
    );
    pages.push({
      locale,
      slug: "react/components",
      title: overviewTitle,
      description: overviewDescription,
      markdownFile: overviewFile,
      examples: [],
    });
    for (const family of families) {
      const { componentCategory } = componentPages.find((page) => page.family === family)!;
      const description = descriptions[family]?.[locale === "cn" ? 1 : 0];
      if (!description) throw new Error(`No authored description for native family: ${family}`);
      const title = titles[family];
      const examples = placements.get(family)!;
      const markdownFile = `content/lenso/${locale}/react/components/${family}.mdx`;
      const contexts = families.filter(
        (candidate) =>
          candidate !== family &&
          reference.families[candidate].parts.some((part) =>
            part.members.some((member) =>
              reference.families[family].parts.some(
                (support) => support.name === `${part.name}${member}`,
              ),
            ),
          ),
      );
      const noScenario = stories.has(family)
        ? locale === "cn"
          ? "本页 Story 提供交互预览；当前没有额外的独立场景示例。"
          : "This page's Story provides the interactive preview; no additional standalone scenarios are maintained."
        : locale === "cn"
          ? `${title} 在当前维护的源场景清单中没有独立运行示例。公开导出与 API 表不代表独立示例覆盖。`
          : `${title} has no standalone runnable scene in the maintained source-scenario inventory. Its export and API table do not count as dedicated demo coverage.`;
      const catalogPage = catalog.pages.find(
        (page) =>
          page.locale === locale &&
          page.slug.startsWith("react/components/") &&
          canonicalFamily(page.slug.split("/").at(-1)!) === family,
      );
      const primaryName = canonicalExampleName(catalogPage?.previews?.[0] ?? "");
      const primary =
        examples.find((example) => example.name === primaryName) ??
        examples.find((example) => /-(?:basic|default)$/.test(example.name)) ??
        examples[0] ??
        [...placements.values()].flat().find(
          (example) =>
            example.name ===
            (
              {
                "calendar-year-picker": "calendar-year-picker",
                "color-input-group": "color-field-basic",
                "date-input-group": "date-field-basic",
                radio: "radio-group-basic",
                tag: "tag-group-basic",
              } as Record<string, string>
            )[family],
        );
      const sections = [
        frontmatter(title, description),
        locale === "cn" ? "## 交互预览\n" : "## Playground\n",
        `<ComponentPlayground family=${JSON.stringify(family)} locale=${JSON.stringify(locale)} />`,
        "",
        locale === "cn" ? "## 用法\n" : "## Usage\n",
        ...(primary
          ? [
              `<ComponentPreview name=${JSON.stringify(primary.name)} defaultView="source"${family === "form" ? ' sourceFile="shared/grouped-form.tsx"' : ""} />`,
              "",
            ]
          : [
              locale === "cn"
                ? "在上方交互预览的代码视图中查看完整组合；下面列出了此部件的组合上下文。"
                : "Open Code in the playground for the complete composition. Related component pages below show the enclosing context.",
              "",
            ]),
        locale === "cn" ? "## 使用与交互\n" : "## Use and interaction\n",
        family === "menu"
          ? menuGuide(locale).replace(/^## [^\n]+\n/, "")
          : nativeContractNotes(reference, family, locale),
        locale === "cn" ? "## 示例\n" : "## Examples\n",
        ...(!examples.length
          ? [
              noScenario,
              ...contexts.map(
                (context) =>
                  `${locale === "cn" ? "组合上下文示例" : "Composed context examples"}: [${titles[context]}](/docs/react/components/${context}).`,
              ),
            ]
          : []),
        ...exampleGroups.flatMap(({ title, matches }) => {
          const members = examples.filter(
            (example) => example !== primary && matches(example.name, family),
          );
          if (!members.length) return [];
          return [
            "<details>",
            `<DisclosureSummary>${title[locale === "cn" ? 1 : 0]} (${members.length})</DisclosureSummary>`,
            "",
            ...members.flatMap(({ name }) => [
              `### ${examplePresentation(name, family, locale).title}`,
              "",
              `<ComponentPreview name=${JSON.stringify(name)} />`,
              "",
            ]),
            "</details>",
            "",
          ];
        }),
        nativeApiMarkdown(reference, family, locale === "cn" ? "zh" : "en"),
      ];
      markdown.set(markdownFile, `${sections.join("\n")}\n`);
      pages.push({
        locale,
        slug: `react/components/${family}`,
        title,
        description,
        markdownFile,
        examples,
        componentCategory,
      });
    }
  }
  return {
    index: {
      formatVersion: 1,
      lensoVersion: product.version,
      sourceFamilyMapping: Object.fromEntries(
        Object.entries(sourceFamilyMapping).filter(([, family]) => families.includes(family)),
      ),
      families: familyMetadata,
      pages,
    },
    markdown,
  };
}

export async function writeDocsProjection(directory = root) {
  const { index, markdown } = await generateDocsProjection(directory);
  const docs = path.join(path.resolve(directory), "apps/docs");
  for (const [file, text] of markdown) {
    await mkdir(path.dirname(path.join(docs, file)), { recursive: true });
    await writeGeneratedFile(path.join(docs, file), text);
  }
  await mkdir(path.join(docs, "src/generated"), { recursive: true });
  await writeGeneratedFile(
    path.join(docs, "src/generated/lenso-docs-index.json"),
    `${JSON.stringify(index, null, 2)}\n`,
  );
  await mkdir(path.join(docs, "public"), { recursive: true });
  await writeGeneratedFile(
    path.join(docs, "public/_redirects"),
    documentationRedirects(index)
      .map(([from, to]) => `${from} ${to} 302`)
      .join("\n") + "\n",
  );
  return index;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = await writeDocsProjection();
  console.log(`Lenso ${index.lensoVersion}: ${index.pages.length} authored public pages.`);
}
