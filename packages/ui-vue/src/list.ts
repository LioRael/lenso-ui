import { list, listKey, type ListKey, type ListOptions } from "@lenso/primitives/list/core";
import { listStyles as s } from "@lenso/tokens/list";
import { groupStyles } from "@lenso/tokens/surface";
import { Button } from "@ui-sdk/vue/button";
import { usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/vue/primitive";
import {
  defineComponent,
  h,
  inject,
  provide,
  shallowRef,
  watchPostEffect,
  type HTMLAttributes,
  type InjectionKey,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";
import { Checkbox } from "./checkbox.js";
import {
  htmlPart,
  partAttributes,
  sdkPart,
  type ComponentProps,
  type StyledPart,
} from "./parts.js";
import { SwipeActions, type SwipeAction } from "./swipe-actions.js";

const Model: InjectionKey<PrimitiveHandle<typeof list>> = Symbol("ListModel");
const SectionKey: InjectionKey<() => string | undefined> = Symbol("ListSection");
const Root = defineComponent({
  name: "LensoList",
  inheritAttrs: false,
  props: {
    value: Array as PropType<string[]>,
    modelValue: Array as PropType<string[]>,
    defaultValue: Array as PropType<string[]>,
    editing: Boolean,
    disabled: Boolean,
    controller: Object as PropType<ListOptions["controller"]>,
    onValueChange: Function as PropType<ListOptions["onValueChange"]>,
    onReorder: Function as PropType<ListOptions["onReorder"]>,
    variant: String as PropType<"grouped" | "plain">,
  },
  emits: {
    "update:modelValue": (_value: string[]) => true,
    "update:value": (_value: string[]) => true,
  },
  slots: Object as SlotsType<{
    default: (scope: { state: PrimitiveHandle<typeof list>["state"] }) => VNodeChild;
    render: (scope: {
      state: PrimitiveHandle<typeof list>["state"];
      props: Record<string, unknown>;
    }) => VNodeChild;
  }>,
  setup(props, { attrs, emit }) {
    const model = usePrimitive(list, () => ({
      value: props.value ?? props.modelValue,
      defaultValue: props.defaultValue,
      editing: props.editing,
      disabled: props.disabled,
      controller: props.controller,
      onReorder: props.onReorder,
      onValueChange(value, details) {
        props.onValueChange?.(value, details);
        if (!details.canceled) {
          emit("update:value", value);
          emit("update:modelValue", value);
        }
      },
    }));
    provide(Model, model);
    return usePart(
      model,
      "root",
      undefined,
      () =>
        partAttributes(
          "list-root",
          [
            props.variant !== "plain" && groupStyles.surface,
            s.root,
            props.variant !== "plain" && s.surface,
          ],
          { "aria-label": "List", ...attrs },
        ),
      "ul",
    );
  },
});
export const ListRoot: StyledPart<typeof Root, HTMLAttributes> = Root as unknown as StyledPart<
  typeof Root,
  HTMLAttributes
>;
export type ListRootProps = ComponentProps<typeof ListRoot>;

const Row = htmlPart("div", "list-row", () => [groupStyles.row, s.item]);
const Selection = htmlPart("span", "list-selection", () => s.selection);
const Reorder: StyledPart<typeof Button> = sdkPart(Button, "list-reorder", () => s.handle);
type ItemScope = { editing: boolean; isSelected: boolean };
const Item = defineComponent({
  name: "LensoListItem",
  inheritAttrs: false,
  props: {
    itemKey: [String, Number, BigInt] as PropType<ListKey>,
    textValue: String,
    height: String as PropType<"regular" | "tall">,
    disabled: Boolean,
    selectionLabel: String,
    reorderLabel: String,
    startActions: Array as PropType<readonly SwipeAction[]>,
    endActions: Array as PropType<readonly SwipeAction[]>,
  },
  slots: Object as SlotsType<{ default: (state: ItemScope) => VNodeChild }>,
  setup(props, { attrs, slots }) {
    const model = inject(Model, undefined);
    const section = inject(SectionKey, undefined);
    const node = shallowRef<HTMLLIElement>();
    const label = () => props.textValue ?? String(props.itemKey ?? "item");
    const disabled = () => props.disabled || model?.state.disabled || false;
    const key = () => (props.itemKey === undefined ? undefined : listKey(props.itemKey));
    const editing = () => props.itemKey !== undefined && Boolean(model?.state.editing);
    const selected = () => key() !== undefined && Boolean(model?.state.value.includes(key()!));

    watchPostEffect((cleanup) => {
      if (model && node.value && props.itemKey !== undefined) {
        cleanup(
          model.api.register({
            key: props.itemKey,
            node: node.value,
            text: label(),
            disabled: props.disabled,
            group: section?.(),
          }),
        );
      }
    });

    function dropPosition() {
      const draft = model?.state.reordering;
      if (!draft || !model || !key()) return undefined;
      const from = model.state.order.indexOf(draft.key);
      const to = draft.order.indexOf(draft.key);
      if (from === to || from < 0 || to < 0) return undefined;
      if (draft.order[to + (to < from ? 1 : -1)] !== key()) return undefined;
      return to < from ? "before" : "after";
    }

    function content() {
      const itemKey = props.itemKey;
      const isEditing = editing();
      const isSelected = selected();
      const inactive = disabled();
      return h(
        Row,
        { xstyle: props.height === "tall" && s.tall },
        {
          default: () => [
            isEditing &&
              h(
                Selection,
                { "data-list-selection": "" },
                {
                  default: () =>
                    h(
                      Checkbox,
                      {
                        "aria-label": props.selectionLabel ?? `Select ${label()}`,
                        checked: isSelected,
                        disabled: inactive,
                        onCheckedChange: (checked, details) =>
                          model?.api.setChecked(itemKey!, checked === true, {
                            event: details.event,
                          }),
                      },
                      {
                        default: () =>
                          h(
                            Checkbox.Control,
                            { xstyle: s.selectionControl },
                            {
                              default: () => h(Checkbox.Indicator),
                            },
                          ),
                      },
                    ),
                },
              ),
            slots.default?.({ editing: isEditing, isSelected }),
            isEditing &&
              h(
                Reorder,
                {
                  "aria-label": props.reorderLabel ?? `Reorder ${label()}`,
                  disabled: inactive,
                  "data-list-reorder": "",
                  onPointerdown: (event: PointerEvent) => model?.api.pointerdown(event, itemKey!),
                  onKeydown: (event: KeyboardEvent) => model?.api.keydown(event, itemKey!),
                  onClick: (event) => {
                    if (!event.defaultPrevented) model?.api.activate(itemKey!);
                  },
                },
                { default: () => h("span", { "aria-hidden": "true" }, "≡") },
              ),
          ],
        },
      );
    }

    return () => {
      const position = dropPosition();
      const swipe = !editing() && (props.startActions?.length || props.endActions?.length);
      return h(
        "li",
        {
          ...partAttributes(
            "list-item",
            [
              s.container,
              s.boundary,
              key() !== undefined && model?.state.reordering?.key === key() && s.dragged,
              position === "before" && s.dropBefore,
              position === "after" && s.dropAfter,
            ],
            attrs,
          ),
          ref: node,
        },
        [
          swipe
            ? h(
                SwipeActions,
                {
                  startActions: props.startActions,
                  endActions: props.endActions,
                  disabled: disabled(),
                },
                { default: content },
              )
            : content(),
        ],
      );
    };
  },
});
export const ListItem: StyledPart<typeof Item, HTMLAttributes> = Item as unknown as StyledPart<
  typeof Item,
  HTMLAttributes
>;
export type ListItemProps = ComponentProps<typeof ListItem>;

export const ListContent = htmlPart("div", "list-content", () => s.content);
export const ListTitle = htmlPart("span", "list-title", () => s.title);
export const ListDescription = htmlPart("span", "list-description", () => s.description);
export const ListLeading = htmlPart("span", "list-leading", () => s.leading);
export const ListTrailing = htmlPart("span", "list-trailing", () => s.trailing);
export const ListSeparator = htmlPart("li", "list-separator", () => s.separator);
export const ListAction: StyledPart<typeof Button> = sdkPart(Button, "list-action", () => s.action);

const Section = defineComponent({
  name: "LensoListSection",
  inheritAttrs: false,
  props: { id: String, title: String },
  setup(props, { attrs, slots }) {
    provide(SectionKey, () => props.id || props.title);
    return () =>
      h("li", partAttributes("list-section", s.section, { ...attrs, id: props.id }), [
        props.title &&
          h("div", partAttributes("list-section-heading", s.sectionHeading, {}), props.title),
        h("ul", slots["default"]?.()),
      ]);
  },
});
export const ListSection: StyledPart<typeof Section, HTMLAttributes> =
  Section as unknown as StyledPart<typeof Section, HTMLAttributes>;

const ListParts: {
  Root: typeof ListRoot;
  Item: typeof ListItem;
  Content: typeof ListContent;
  Title: typeof ListTitle;
  Description: typeof ListDescription;
  Leading: typeof ListLeading;
  Trailing: typeof ListTrailing;
  Separator: typeof ListSeparator;
  Action: typeof ListAction;
  Section: typeof ListSection;
} = {
  Root: ListRoot,
  Item: ListItem,
  Content: ListContent,
  Title: ListTitle,
  Description: ListDescription,
  Leading: ListLeading,
  Trailing: ListTrailing,
  Separator: ListSeparator,
  Action: ListAction,
  Section: ListSection,
};
export const List: typeof ListRoot & typeof ListParts = Object.assign(ListRoot, ListParts);

export { createListController } from "@lenso/primitives/list/core";
export type { ListController, ListKey, ListMove, ListReason } from "@lenso/primitives/list/core";
