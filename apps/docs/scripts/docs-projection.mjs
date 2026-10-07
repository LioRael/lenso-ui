import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nativeApiMarkdown } from "../src/lib/native-api-section.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const componentCategories = [
  ["buttons", "Buttons", "按钮"],
  ["collections", "Collections", "集合"],
  ["colors", "Colors", "颜色"],
  ["controls", "Controls", "控件"],
  ["data-display", "Data Display", "数据展示"],
  ["date-and-time", "Date and Time", "日期和时间"],
  ["feedback", "Feedback", "反馈"],
  ["forms", "Forms", "表单"],
  ["layout", "Layout", "布局"],
  ["media", "Media", "媒体"],
  ["navigation", "Navigation", "导航"],
  ["overlays", "Overlays", "浮层"],
  ["pickers", "Pickers", "选择器"],
  ["typography", "Typography", "排版"],
  ["utilities", "Utilities", "实用工具"],
  ["additional", "Additional components", "其他组件"],
];
export const sourceFamilyMapping = Object.freeze({ dropdown: "menu" });
export const canonicalFamily = (family, mapping = sourceFamilyMapping) => mapping[family] ?? family;
export function canonicalExampleName(name, mapping = sourceFamilyMapping) {
  for (const [source, family] of Object.entries(mapping))
    if (name === source || name.startsWith(`${source}-`))
      return `${family}${name.slice(source.length)}`;
  return name;
}
export function canonicalDemoFile(file) {
  return file.replace(
    /^((?:en|cn)\/)([^/]+)(\/)/,
    (_, locale, family, slash) => `${locale}${canonicalFamily(family)}${slash}`,
  );
}

// Authored descriptions describe the local composition, not an upstream API.
const descriptions = {
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
  button: [
    "An action control with native activation, loading and icon composition.",
    "具有原生激活、加载状态和图标组合的操作控件。",
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
  "disclosure-group": [
    "A group of disclosure panels with coordinated expansion.",
    "协调展开状态的折叠面板集合。",
  ],
  drawer: [
    "A modal panel attached to an edge, with dismissal and focus management.",
    "依附于边缘的模态面板，提供关闭和焦点管理。",
  ],
  "empty-state": [
    "A structural explanation and next action when a collection has no content.",
    "集合没有内容时的说明与后续操作区域。",
  ],
  "error-message": [
    "An error description adjacent to the affected input.",
    "位于受影响输入旁的错误说明。",
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
  header: ["A structural heading region for a page or section.", "页面或章节的结构化标题区域。"],
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
  "list-box-item": [
    "An option participating in the enclosing list box's selection model.",
    "参与所在列表框选择模型的选项。",
  ],
  "list-box-section": [
    "A labelled option group within a list box collection.",
    "列表框集合中的带标签选项分组。",
  ],
  menu: [
    "A popup command menu with native item navigation and dismissal.",
    "具有原生命令导航和关闭行为的弹出菜单。",
  ],
  "menu-item": [
    "A command, checkbox or radio item in the enclosing Menu context.",
    "所在 Menu 上下文中的命令、复选框或单选项。",
  ],
  "menu-section": [
    "A labelled command group within a Menu popup.",
    "Menu 弹出层中的带标签命令分组。",
  ],
  meter: [
    "A labelled scalar measurement with a bounded range.",
    "具有范围边界的带标签标量测量值。",
  ],
  modal: [
    "A dialog surface with controlled visibility, focus trapping and dismissal.",
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
  "switch-group": [
    "Related switches grouped with a shared label and description.",
    "由共享标签和说明组织的相关开关集合。",
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

const contracts = {
  accordion: [
    "Keep Item, Trigger and Panel in one Accordion context. Native value changes identify expanded items, not a DOM input value.",
    "Item、Trigger 和 Panel 应处于同一 Accordion 上下文。原生值变化标识展开项目，不是 DOM 输入值。",
  ],
  "alert-dialog": [
    "Use the native title and description parts to name the decision. Closing and confirmation actions are distinct; test focus return when the dialog is dismissed.",
    "使用原生标题和说明部件命名决策。关闭与确认操作不同；关闭时应测试焦点返回。",
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
  button: [
    "Use onClick for activation. Loading blocks activation while keeping the action focusable; do not replace that contract with a disabled spinner-only element.",
    "使用 onClick 激活。加载期间阻止激活但保持可聚焦；不要替换成仅有加载图标的禁用元素。",
  ],
  "button-group": [
    "The group adds presentation, not a shared selected value. Use ToggleButtonGroup for coordinated pressed-state selection.",
    "此分组添加展示样式，不管理共享选中值。协调按下状态选择应使用 ToggleButtonGroup。",
  ],
  calendar: [
    "Calendar cells and navigation use the React Aria date context. Supply internationalized date values and verify locale-specific weekday order and keyboard movement.",
    "日历单元格和导航使用 React Aria 日期上下文。传入国际化日期值，并检查本地化星期顺序与键盘移动。",
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
    "Color text and parsed color values use React Aria's color model. Keep Label, Description and validation parts in that field context.",
    "颜色文本与解析后的颜色值采用 React Aria 颜色模型。Label、Description 和验证部件应位于该字段上下文。",
  ],
  "color-input-group": [
    "These sections support a React Aria color field. Reusing them in a plain Base UI input does not supply the color editing context.",
    "这些区域支持 React Aria 颜色字段。放入普通 Base UI 输入框不会提供颜色编辑上下文。",
  ],
  "color-picker": [
    "Compose channel controls and swatches under the same ColorPicker value owner. Its supporting dialog and popover stay in the color family's React Aria boundary.",
    "通道控件与色板应共享 ColorPicker 值所有者。辅助对话框和弹出层属于颜色系列的 React Aria 边界。",
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
    "The group and segments support the enclosing React Aria date field. Preserve segment refs and locale-sensitive editing order.",
    "分组与分段支持所在 React Aria 日期字段。保留分段 ref 与本地化编辑顺序。",
  ],
  "date-picker": [
    "The field and popup calendar share one date value. The popup's React Aria supporting parts are intentional, not interchangeable Base UI dialog parts.",
    "字段和弹出日历共享一个日期值。弹出层的 React Aria 辅助部件是必要边界，不能直接替换为 Base UI 对话框部件。",
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
  "disclosure-group": [
    "The local group uses Base UI Accordion coordination. Use its item values and expansion callback rather than a React Aria selection alias.",
    "本地分组使用 Base UI Accordion 协调。使用项目值与展开回调，不使用 React Aria 选择别名。",
  ],
  drawer: [
    "The native Drawer owns modal focus and dismissal. Test the scrollable content separately from the edge-positioned surface.",
    "原生 Drawer 管理模态焦点与关闭。可滚动内容应与边缘定位表面分开验证。",
  ],
  "field-error": [
    "This part consumes Base UI Field validation state. Place it with the corresponding field; a date-family error part uses a different context.",
    "此部件读取 Base UI Field 验证状态。应放在对应字段中；日期系列错误部件采用不同上下文。",
  ],
  fieldset: [
    "Use the legend to name the group. A fieldset groups controls but does not replace each control's label or validation contract.",
    "使用 legend 命名分组。字段集组织控件，但不替代每个控件的标签或验证契约。",
  ],
  form: [
    "Use native submit semantics and actual field names. Inspect the local validation API before turning server errors into field messages.",
    "使用原生提交语义与实际字段名。将服务端错误映射为字段消息前，先检查本地验证 API。",
  ],
  input: [
    "Use native input events and refs. A field wrapper supplies validation and labels; a styled input alone does not establish those relationships.",
    "使用原生输入事件与 ref。字段包装提供验证和标签；仅添加输入样式不会建立这些关联。",
  ],
  "input-group": [
    "Prefix and suffix content surround the real input rather than replacing it. Interactive suffixes need their own names and activation semantics.",
    "前缀和后缀围绕实际输入框，不替代它。交互后缀需要自己的名称与激活语义。",
  ],
  "input-otp": [
    "The native OTP field coordinates slots, paste and focus. Label the complete code input rather than inventing independent unrelated fields.",
    "原生 OTP 字段协调分段、粘贴和焦点。应为完整验证码输入提供标签，而不是创建无关的独立字段。",
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
  "list-box-item": [
    "Items register with the enclosing local collection and need stable keys and text values. Preserve the collection render props and ref when replacing the element.",
    "项目注册到所在本地集合，需要稳定 key 与文本值。替换元素时保留集合 render 属性与 ref。",
  ],
  "list-box-section": [
    "Sections group options without becoming selectable items themselves. Keep the section label separate from each item's text value.",
    "区域组织选项，但本身不是可选项目。区域标签与每个项目文本值应保持独立。",
  ],
  "menu-item": [
    "Command, checkbox, radio and link parts depend on Menu context. Their native activation and selection signatures differ; do not replace them all with onAction.",
    "命令、复选、单选与链接部件依赖 Menu 上下文。它们的原生激活与选择签名不同，不应全部替换为 onAction。",
  ],
  "menu-section": [
    "Keep the group and its label inside the Menu popup. A section label is not an extra command or keyboard stop.",
    "分组与标签应位于 Menu 弹出层。区域标签不是额外命令或键盘停靠点。",
  ],
  meter: [
    "Provide the measurement's meaningful label and native range values. Meter describes a bounded measurement, not task completion.",
    "提供有意义的测量标签与原生范围值。Meter 表达有界测量，不是任务完成进度。",
  ],
  modal: [
    "Use the dialog's own title, description and close parts. Verify initial focus, focus containment and trigger focus return after dismissal.",
    "使用对话框自己的标题、说明与关闭部件。验证初始焦点、焦点限制及关闭后的触发器焦点返回。",
  ],
  "number-field": [
    "Input and steppers share the NumberField root. Consume the native numeric value callback instead of parsing every change as an unrelated text event.",
    "输入和步进按钮共享 NumberField 根上下文。使用原生数值回调，不要把每次变化解析为无关文本事件。",
  ],
  pagination: [
    "The caller owns page data and navigation destinations. Render the current-page indication and actual links or actions according to that routing model.",
    "调用方管理分页数据与导航目标。按该路由模型渲染当前页提示及实际链接或操作。",
  ],
  popover: [
    "Positioner and popup are separate native parts. Keep their anchoring, portal theme and dismissal contracts when supplying custom content.",
    "Positioner 与 popup 是不同原生部件。自定义内容应保留锚定、portal 主题和关闭契约。",
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
    "Trigger, list and items share the native Select context. Values and value-change event details follow Base UI rather than DOM select assumptions.",
    "触发器、列表和项目共享原生 Select 上下文。值与变化事件详情遵循 Base UI，而不是 DOM select 假设。",
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
  "switch-group": [
    "Grouping does not invent a radio-like exclusive value. Each switch retains its own checked state and meaningful label.",
    "分组不会创建类似单选的互斥值。每个开关保留自己的 checked 状态与明确标签。",
  ],
  table: [
    "The local table shares the collection's stable-key selection model and owns sorting and resizing contracts. Rows, headers and cells must participate in the same table context.",
    "本地表格共享集合的稳定 key 选择模型，并提供排序与尺寸调整契约。行、标题和单元格应参与同一表格上下文。",
  ],
  tabs: [
    "Triggers and panels share native tab values. Arrow keys move within the tab list; the activation mode determines when movement changes the selected panel.",
    "触发器和面板共享原生标签值。箭头键在标签列表中移动；激活模式决定移动何时改变选中面板。",
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
    "Multiline editing keeps DOM input semantics inside the local field. The field's validation messages are not a separate React Aria text-field contract.",
    "多行编辑在本地字段中保留 DOM 输入语义。字段验证消息不是独立 React Aria 文本字段契约。",
  ],
  textfield: [
    "The local wrapper composes ordinary Base UI Field semantics. Use the actual input's DOM events and field-aware Label, Description and Error parts.",
    "本地包装组合普通 Base UI Field 语义。使用实际输入 DOM 事件及依赖字段的 Label、Description 与 Error 部件。",
  ],
  "time-field": [
    "Time segments use the internationalized time model and locale formatting. Keep the field's supporting label and error parts in the time context.",
    "时间分段使用国际化时间模型与本地化格式。辅助标签和错误部件应处于时间上下文。",
  ],
  toast: [
    "Provider, viewport and rendered messages share the native toast manager. Test focus and dismissal separately from the queue's lifetime.",
    "提供器、视口和消息共享原生 toast 管理器。焦点与关闭应独立于队列生命周期验证。",
  ],
  "toggle-button": [
    "Pressed state is the toggle's native value, not a checkbox DOM change event. Keep an accessible name that remains meaningful in either state.",
    "按下状态是原生切换值，不是复选框 DOM change 事件。两种状态下的无障碍名称都应有意义。",
  ],
  "toggle-button-group": [
    "Child toggles share the native group value. Inspect whether the actual value type supports one or multiple selected items before controlling it.",
    "子切换按钮共享原生分组值。受控使用前，检查实际值类型支持单选还是多选。",
  ],
  toolbar: [
    "Toolbar keyboard focus is coordinated by the native root. Keep its action items in the toolbar context and label the group.",
    "工具栏键盘焦点由原生根协调。操作项目应处于工具栏上下文，并为分组提供标签。",
  ],
  tooltip: [
    "The tooltip supplements the trigger's accessible name; it should not contain actions that require focus. Preserve hover and focus relationships with the trigger.",
    "Tooltip 补充触发器无障碍名称，不应包含需要聚焦的操作。保留与触发器的悬停和焦点关联。",
  ],
};

const titleFor = (family) =>
  family === "textfield"
    ? "TextField"
    : family === "textarea"
      ? "TextArea"
      : family
          .split("-")
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join("");
const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const frontmatter = (title, description) =>
  `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n`;

export function nativeContractNotes(reference, family, locale) {
  const zh = locale === "cn";
  const parts = reference.families[family].parts;
  const notes = [];
  if (contracts[family]) notes.push(contracts[family][zh ? 1 : 0]);
  else if (family !== "menu")
    notes.push(
      zh
        ? "此系列的结构与展示部件不会自行建立表单、选择或覆盖层状态。需要交互时，组合实际控件并提供其语义。"
        : "This family's structural and presentation parts do not establish form, selection or overlay state by themselves. Compose an actual control and its semantics when interaction is needed.",
    );
  const native = [...new Set(parts.flatMap((part) => part.native))];
  if (native.length)
    notes.push(
      `${zh ? "交互来源" : "Interaction implementation"}: ${native.map((name) => `\`${name}\``).join(", ")}.`,
    );
  const properties = new Map();
  for (const part of parts)
    for (const id of part.properties) {
      const property = reference.properties[id];
      if (!property) throw new Error(`Missing API property ${id}: ${family}.${part.name}`);
      const owners = properties.get(property.name) ?? [];
      owners.push(part.name);
      properties.set(property.name, owners);
    }
  const describe = (name, en, cn) => {
    if (properties.has(name))
      notes.push(
        `\`${name}\` — ${zh ? cn : en} (${[...new Set(properties.get(name))].map((owner) => `\`${owner}\``).join(", ")}).`,
      );
  };
  describe(
    "ref",
    "The API below identifies the actual forwarded ref type; it is not necessarily the root's DOM element",
    "下方 API 标明实际转发的 ref 类型，不一定是根部 DOM 元素",
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
    "The exact type below distinguishes a style object from a native state callback",
    "下方精确类型区分样式对象与原生状态回调",
  );
  describe(
    "xstyle",
    "Caller StyleX overrides compose after the component's variant styles",
    "调用方 StyleX 覆盖样式在组件变体样式之后组合",
  );
  return notes.map((note) => `- ${note}`).join("\n");
}

function menuGuide(locale) {
  return locale === "cn"
    ? "## 组合与键盘\n\n`Menu.Root` 管理展开状态；`Menu.Trigger` 打开菜单。将 `Menu.Popup` 放入 `Menu.Portal` 和 `Menu.Positioner` 中，定位器处理锚点与侧边偏移，弹出层负责菜单表面。\n\n菜单项必须位于 Menu 上下文内。箭头键在可用项目间移动，Enter 或 Space 激活命令，Escape 关闭并返回触发器。子菜单使用 `Menu.SubmenuRoot` 和 `Menu.SubmenuTrigger`，不要嵌套另一个普通按钮来模拟菜单项。\n\n受控展开采用 `open` 和 `onOpenChange`；回调签名以本地 API 为准。项目行为采用 Base UI 事件，不使用 React Aria 的 `onAction` 或 `onPress`。选项、分组、链接和子菜单的运行示例均列在下方。\n\n公开名称只有 `Menu`。历史 Dropdown 的来源名称仅保留在内部示例引用中；旧文档地址可以重定向到本页，但不表示存在 Dropdown 导出。\n"
    : "## Composition and keyboard\n\n`Menu.Root` owns open state; `Menu.Trigger` opens the menu. Place `Menu.Popup` inside `Menu.Portal` and `Menu.Positioner`: the positioner handles anchoring and side offsets, while the popup owns the menu surface.\n\nItems must participate in the Menu context. Arrow keys move between enabled items, Enter or Space activates a command, and Escape dismisses the popup and returns focus to its trigger. Submenus use `Menu.SubmenuRoot` and `Menu.SubmenuTrigger`; do not simulate an item by nesting another ordinary button.\n\nControl visibility with `open` and `onOpenChange`, using the local callback signature below. Item activation uses Base UI events, not React Aria's `onAction` or `onPress`. Runnable examples below cover items, groups, links and submenus.\n\nThe public name is `Menu` only. Historical Dropdown names remain internal example references; an old documentation URL may redirect here, but that does not imply a Dropdown export.\n";
}

async function authoredFiles(directory, prefix = "react") {
  const files = [];
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
  const docs = path.join(path.resolve(directory), "apps/docs");
  const product = await json(path.join(directory, "packages/react/package.json"));
  const reference = await json(path.join(docs, "src/generated/api-reference.json"));
  const archive = await json(path.join(docs, "content/source-index.json"));
  const manifests = await json(path.join(docs, "src/demos/live-manifest.json"));
  const publicIndex = await readFile(
    path.join(directory, "packages/react/src/components/index.ts"),
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
  const titles = Object.fromEntries(
    families.map((family) => [
      family,
      reference.families[family].parts.find(
        (part) => part.name.toLowerCase() === family.replaceAll("-", ""),
      )?.name ?? titleFor(family),
    ]),
  );
  const pages = [];
  const markdown = new Map();
  for (const locale of ["en", "cn"]) {
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
        markdownFile,
        examples: [],
      });
    }
    const placements = new Map(families.map((family) => [family, []]));
    const names = new Set();
    for (const [rawSourceRef, entry] of Object.entries(archive.examples[locale])) {
      const name = canonicalExampleName(rawSourceRef);
      if (names.has(name)) throw new Error(`Canonical example name collision: ${locale}:${name}`);
      names.add(name);
      const sourceFamily = /^apps\/docs\/src\/demos\/(?:en|cn)\/([^/]+)\//.exec(entry.source)?.[1];
      const family = canonicalFamily(sourceFamily);
      if (!placements.has(family))
        throw new Error(`No native public family for ${locale}:${name} (${entry.source})`);
      const file = manifests[locale]?.[name];
      if (!file) throw new Error(`No runnable local example: ${locale}:${name}`);
      if (file !== canonicalDemoFile(file))
        throw new Error(`Noncanonical local example file: ${file}`);
      if (!/^(?:en|cn)\/[a-z0-9/-]+\.tsx$/.test(file))
        throw new Error(`Unsafe example file: ${file}`);
      await readFile(path.join(docs, "src/demos", file));
      placements.get(family).push({ name, file });
    }
    const overviewFile = `content/lenso/${locale}/react/components/index.mdx`;
    const overviewTitle = locale === "cn" ? "组件" : "Components";
    const overviewDescription =
      locale === "cn"
        ? "浏览当前公开组件系列的原生 API 与本地运行示例。"
        : "Browse the current public families, native APIs and local runnable examples.";
    const componentPages = families.map((family) => {
      const archivePage = archive.pages.find((page) => {
        if (page.locale !== locale || !page.slug.startsWith("react/components/")) return false;
        const sourceFamily = page.slug.split("/").at(-1);
        return (
          canonicalFamily(sourceFamily) === family ||
          sourceFamily.replaceAll("-", "") === family.replaceAll("-", "")
        );
      });
      const category = archivePage ? /\(([^)]+)\)/.exec(archivePage.file)?.[1] : undefined;
      const componentCategory = componentCategories.some(([key]) => key === category)
        ? category
        : "additional";
      const componentThumbnail = archivePage?.title?.trim().split(/\s+/)[0]?.toLowerCase();
      return { family, componentCategory, componentThumbnail };
    });
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
      const { componentCategory, componentThumbnail } = componentPages.find(
        (page) => page.family === family,
      );
      const description = descriptions[family]?.[locale === "cn" ? 1 : 0];
      if (!description) throw new Error(`No authored description for native family: ${family}`);
      const title = titles[family];
      const examples = placements.get(family);
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
      const noScenario =
        locale === "cn"
          ? `${title} 在当前维护的源场景清单中没有独立运行示例。公开导出与 API 表不代表独立示例覆盖。`
          : `${title} has no standalone runnable scene in the maintained source-scenario inventory. Its export and API table do not count as dedicated demo coverage.`;
      const rootPart =
        reference.families[family].parts.find(
          (part) => part.name.toLowerCase() === family.replaceAll("-", ""),
        ) ?? reference.families[family].parts[0];
      const archivePage = archive.pages.find(
        (page) =>
          page.locale === locale &&
          page.slug.startsWith("react/components/") &&
          canonicalFamily(page.slug.split("/").at(-1)) === family,
      );
      const primaryName = canonicalExampleName(archivePage?.previews?.[0] ?? "");
      const primary =
        examples.find((example) => example.name === primaryName) ??
        examples.find((example) => /-(?:basic|default)$/.test(example.name)) ??
        examples[0];
      const sections = [
        frontmatter(title, description),
        locale === "cn" ? "## 用法\n" : "## Usage\n",
        "```tsx",
        `import { ${rootPart.name} } from "@lenso/ui";`,
        "```",
        "",
        ...(primary ? [`<ComponentPreview name=${JSON.stringify(primary.name)} />`, ""] : []),
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
        ...examples
          .filter((example) => example !== primary)
          .flatMap(({ name }) => [
            `### ${name.replace(/^(?:dropdown|menu)-/, "").replaceAll("-", " ")}`,
            "",
            `<ComponentPreview name=${JSON.stringify(name)} />`,
            "",
          ]),
        family === "menu" ? menuGuide(locale) : "",
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
        ...(componentThumbnail ? { componentThumbnail } : {}),
      });
    }
  }
  return {
    index: { formatVersion: 1, lensoVersion: product.version, sourceFamilyMapping, pages },
    markdown,
  };
}

export async function writeDocsProjection(directory = root) {
  const { index, markdown } = await generateDocsProjection(directory);
  const docs = path.join(path.resolve(directory), "apps/docs");
  for (const [file, text] of markdown) {
    await mkdir(path.dirname(path.join(docs, file)), { recursive: true });
    await writeFile(path.join(docs, file), text);
  }
  await mkdir(path.join(docs, "src/generated"), { recursive: true });
  await writeFile(
    path.join(docs, "src/generated/lenso-docs-index.json"),
    `${JSON.stringify(index, null, 2)}\n`,
  );
  return index;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = await writeDocsProjection();
  console.log(`Lenso ${index.lensoVersion}: ${index.pages.length} authored public pages.`);
}
