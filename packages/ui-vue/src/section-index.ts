import { sectionIndex, type SectionIndexItem } from "@lenso/primitives/section-index/core";
import { sectionIndexStyles } from "@lenso/tokens/section-index";
import { createParts } from "@ui-sdk/vue/primitive";
import { defineComponent, h, type PropType } from "vue";
import { sdkPart, type ComponentProps, type StyledPart } from "./parts.js";

const tags = { root: "nav", item: "a" } as const;
const parts: ReturnType<typeof createParts<typeof sectionIndex, typeof tags>> = createParts(
  sectionIndex,
  tags,
);
const Root: StyledPart<typeof parts.Root> = sdkPart(parts.Root, "section-index", (props) => [
  sectionIndexStyles.root,
  props.disabled && sectionIndexStyles.disabled,
]);
const Item: StyledPart<typeof parts.Item> = sdkPart(
  parts.Item,
  "section-index-item",
  () => sectionIndexStyles.item,
);

export type SectionIndexProps = ComponentProps<typeof Root>;
export const SectionIndex: typeof Root = defineComponent({
  name: "LensoSectionIndex",
  inheritAttrs: false,
  props: { items: { type: Array as PropType<readonly SectionIndexItem[]>, required: true } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        Root,
        { "aria-label": "Section index", ...attrs, items: props.items },
        {
          ...slots,
          default:
            slots["default"] ??
            (() =>
              props.items.map((item) =>
                h(
                  Item,
                  {
                    key: item.value,
                    value: item.value,
                    href: item.href,
                    disabled: item.disabled,
                  },
                  { default: () => item.label },
                ),
              )),
        },
      );
  },
}) as unknown as typeof Root;

export { createSectionIndexController } from "@lenso/primitives/section-index/core";
export type {
  SectionIndexController,
  SectionIndexItem,
  SectionIndexReason,
} from "@lenso/primitives/section-index/core";
