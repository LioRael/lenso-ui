import { breadcrumbsStyles } from "@lenso/tokens/breadcrumbs";
import {
  cloneVNode,
  defineComponent,
  h,
  inject,
  provide,
  type InjectionKey,
  type VNodeChild,
  type Component,
} from "vue";
import { LinkRoot } from "./link.js";
import { partAttributes, type HtmlPart, type StyleXArgument, htmlPart } from "./parts.js";
import { slotElements } from "./slot-elements.js";

const Trail: InjectionKey<{ disabled: () => boolean; separator: () => VNodeChild }> =
  Symbol("Breadcrumbs");
export const BreadcrumbsRoot = defineComponent({
  inheritAttrs: false,
  props: { disabled: Boolean, separator: String },
  setup(props, { attrs, slots }) {
    provide(Trail, {
      disabled: () => props.disabled,
      separator: () => slots["separator"]?.() ?? props.separator,
    });
    return () => {
      const items = slotElements(slots["default"]?.());
      const last = items.map((item) => item.type).lastIndexOf(BreadcrumbsItem);
      return h(
        "nav",
        partAttributes("breadcrumbs-nav", undefined, { "aria-label": "Breadcrumb", ...attrs }),
        [
          h(
            "ol",
            partAttributes("breadcrumbs", breadcrumbsStyles.root, {}),
            items.map((item, index) =>
              item.type === BreadcrumbsItem &&
              (item.props?.["isCurrent"] ?? item.props?.["is-current"]) == null
                ? cloneVNode(item, { isCurrent: index === last })
                : item,
            ),
          ),
        ],
      );
    };
  },
}) as unknown as HtmlPart<"nav", { disabled?: boolean; separator?: string }>;
export const BreadcrumbsItem = defineComponent({
  inheritAttrs: false,
  props: { disabled: { type: Boolean, default: undefined }, isCurrent: Boolean },
  setup(props, { attrs, slots }) {
    const trail = inject(Trail, undefined);
    return () => {
      const disabled = props.disabled ?? trail?.disabled();
      const block = (event: Event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      };
      return h("li", partAttributes("breadcrumbs-item", breadcrumbsStyles.item, {}), [
        h(
          LinkRoot as Component,
          {
            ...attrs,
            "aria-current": props.isCurrent ? "page" : undefined,
            "data-current": props.isCurrent || undefined,
            ...(disabled && {
              href: undefined,
              role: attrs["role"] ?? "link",
              "aria-disabled": "true",
              tabindex: -1,
              onClickCapture: block,
              onKeydownCapture: (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") block(e);
              },
            }),
            xstyle: [
              breadcrumbsStyles.link,
              props.isCurrent && breadcrumbsStyles.current,
              attrs["xstyle"] as StyleXArgument,
            ],
          },
          slots,
        ),
        !props.isCurrent &&
          h(
            BreadcrumbsSeparator,
            { "aria-hidden": "true", xstyle: breadcrumbsStyles.lastSeparator },
            {
              default: () =>
                trail?.separator() ??
                h("svg", { viewBox: "0 0 12 12", width: "100%", height: "100%", fill: "none" }, [
                  h("path", {
                    d: "m4.5 3 3 3-3 3",
                    stroke: "currentColor",
                    "stroke-width": 1.5,
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                  }),
                ]),
            },
          ),
      ]);
    };
  },
}) as unknown as HtmlPart<"a", { isCurrent?: boolean; disabled?: boolean }>;

export const BreadcrumbsSeparator = htmlPart(
  "span",
  "breadcrumbs-separator",
  () => breadcrumbsStyles.separator,
);

export const Breadcrumbs: typeof BreadcrumbsRoot & {
  Root: typeof BreadcrumbsRoot;
  Item: typeof BreadcrumbsItem;
  Separator: typeof BreadcrumbsSeparator;
} = Object.assign(BreadcrumbsRoot, {
  Root: BreadcrumbsRoot,
  Item: BreadcrumbsItem,
  Separator: BreadcrumbsSeparator,
});
