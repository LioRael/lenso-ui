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
export const exampleGroups = [
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
