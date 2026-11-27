import type { TableKey } from "@lenso/primitives/table/core";
import { tagStyles } from "@lenso/tokens/tag";
import { Button as SdkButton, type ButtonActionDetails } from "@ui-sdk/vue/button";
import {
  defineComponent,
  h,
  inject,
  provide,
  shallowRef,
  watch,
  type InjectionKey,
  type LiHTMLAttributes,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";
import {
  htmlPart,
  partAttributes,
  sdkPart,
  type ComponentProps,
  type StyledPart,
} from "./parts.js";
import { TagGroupContext, tagId } from "./tag-group.js";

const Cell = htmlPart("span", "tag-cell", () => tagStyles.cell);
const Remove: StyledPart<typeof SdkButton> = sdkPart(
  SdkButton,
  "tag-remove-button",
  () => tagStyles.removeButton,
);
const Removal: InjectionKey<{ label: () => string; disabled: () => boolean; remove: () => void }> =
  Symbol("TagRemoval");

export const TagRemoveButton: typeof Remove = defineComponent({
  name: "LensoTagRemoveButton",
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    onClick: Function as PropType<ComponentProps<typeof Remove>["onClick"]>,
  },
  setup(props, { attrs, slots }) {
    const owner = inject(Removal, undefined);
    return () =>
      h(
        Remove,
        {
          "aria-label": owner ? `Remove ${owner.label()}` : "Remove",
          ...attrs,
          disabled: props.disabled || owner?.disabled(),
          onClick(event: MouseEvent, details: ButtonActionDetails) {
            const result = props.onClick?.(event, details);
            if (!event.defaultPrevented) owner?.remove();
            return result;
          },
        },
        slots,
      );
  },
}) as unknown as typeof Remove;

export type TagState = {
  allowsRemoving: boolean;
  isSelected: boolean;
  isDisabled: boolean;
};

const Item = defineComponent({
  name: "LensoTag",
  inheritAttrs: false,
  props: {
    itemKey: [String, Number, BigInt] as PropType<TableKey>,
    textValue: String,
    selected: { type: Boolean, default: undefined },
    disabled: Boolean,
    size: String as PropType<"sm" | "md" | "lg">,
    variant: String as PropType<"default" | "surface">,
    onClick: Function as PropType<(event: MouseEvent) => void>,
    onKeydown: Function as PropType<(event: KeyboardEvent) => void>,
  },
  slots: Object as SlotsType<{
    default?: (state: TagState) => VNodeChild;
    remove?: () => VNodeChild;
  }>,
  setup(props, { attrs, slots }) {
    const group = inject(TagGroupContext, undefined);
    const node = shallowRef<HTMLLIElement>();
    const label = () => props.textValue ?? String(props.itemKey ?? "tag");
    const disabled = () =>
      props.disabled ||
      !!group?.props.disabled ||
      (props.itemKey !== undefined && !!group?.props.disabledKeys?.has(props.itemKey));
    const selected = () =>
      props.selected ?? (props.itemKey !== undefined && !!group?.selected().has(props.itemKey));
    const removable = () =>
      props.itemKey !== undefined &&
      Boolean(group?.items() || group?.props.onRemove || group?.props.onItemsChange);
    const remove = () => {
      if (props.itemKey !== undefined && !disabled()) group?.remove(props.itemKey);
    };
    provide(Removal, { label, disabled, remove });

    watch(
      [node, () => props.itemKey, disabled],
      ([element, key, inactive], _, cleanup) => {
        if (group && element && key !== undefined) cleanup(group.register(key, element, inactive));
      },
      { flush: "post" },
    );

    function click(event: MouseEvent) {
      props.onClick?.(event);
      if (
        event.defaultPrevented ||
        disabled() ||
        props.itemKey === undefined ||
        (event.target instanceof Element && event.target.closest("button"))
      )
        return;
      group?.select(props.itemKey, event);
    }
    function keydown(event: KeyboardEvent) {
      props.onKeydown?.(event);
      const key = props.itemKey;
      if (
        !group ||
        key === undefined ||
        disabled() ||
        event.defaultPrevented ||
        event.target !== event.currentTarget
      )
        return;
      if (removable() && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        remove();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        group.select(key, event);
      } else if (node.value) {
        const moved = group.handle.api.roving.keydown(event, node.value);
        if (moved?.shift) {
          const target = group.keyForId(moved.key);
          if (target !== undefined) group.select(target, event, moved.from);
        }
      }
    }

    return () => {
      const key = props.itemKey;
      if (key !== undefined && group?.isRemoved(key)) return null;
      const managed = !!group && key !== undefined;
      const inactive = disabled();
      const isSelected = selected();
      const allowsRemoving = removable();
      const mode = group?.props.selectionMode ?? "none";
      const id = key === undefined ? undefined : tagId(key);
      return h(
        "li",
        {
          ...partAttributes(
            "tag",
            [
              tagStyles.root,
              tagStyles[props.size ?? group?.props.size ?? "md"],
              tagStyles[props.variant ?? group?.props.variant ?? "default"],
              isSelected && tagStyles.selected,
              inactive && tagStyles.disabled,
            ],
            {
              ...attrs,
              role: managed ? "row" : attrs["role"],
              "aria-label": attrs["aria-label"] ?? (managed ? label() : undefined),
              "aria-disabled": inactive ? "true" : attrs["aria-disabled"],
              "aria-selected": managed && mode !== "none" ? String(isSelected) : undefined,
              "data-selected": isSelected ? "" : undefined,
              "data-collection-item": managed ? "tag" : undefined,
              "data-material": "glass-small",
              tabindex:
                group && id !== undefined
                  ? inactive
                    ? -1
                    : Number(
                        group.handle.api.roving.tabIndex(group.handle.state, {
                          key: id,
                          props: { value: id },
                        }),
                      )
                  : attrs["tabindex"],
            },
          ),
          ref: node,
          onClick: click,
          onKeydown: keydown,
        },
        [
          h(
            Cell,
            { role: managed ? "gridcell" : undefined },
            {
              default: () => slots.default?.({ allowsRemoving, isSelected, isDisabled: inactive }),
            },
          ),
          allowsRemoving &&
            h("span", { role: "gridcell" }, [
              slots.remove?.() ?? h(TagRemoveButton, null, { default: () => "×" }),
            ]),
        ],
      );
    };
  },
});
export const TagRoot: StyledPart<typeof Item, LiHTMLAttributes> = Item as unknown as StyledPart<
  typeof Item,
  LiHTMLAttributes
>;
export type TagProps = ComponentProps<typeof TagRoot>;
export const Tag: typeof TagRoot & { Root: typeof TagRoot; RemoveButton: typeof TagRemoveButton } =
  Object.assign(TagRoot, { Root: TagRoot, RemoveButton: TagRemoveButton });

export type TagRootProps = TagProps;
