import {
  createContext,
  createEffect,
  createSignal,
  omit,
  Show,
  useContext,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import type { TableKey } from "@lenso/primitives/table/core";
import { TagGroupContext, tagId } from "./tag-group.jsx";
import { tagStyles } from "@lenso/tokens/tag";
import { Button as SdkRemoveButton } from "@ui-sdk/solid/button";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

const Item = htmlPart<
  "li",
  {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "surface";
    selected?: boolean;
    disabled?: boolean;
  }
>(
  "li",
  "tag",
  (props) => [
    tagStyles.root,
    tagStyles[props.size ?? "md"],
    tagStyles[props.variant ?? "default"],
    props.selected && tagStyles.selected,
    props.disabled && tagStyles.disabled,
  ],
  "size",
  "variant",
  "selected",
  "disabled",
);
const Cell = htmlPart("span", "tag-cell", () => tagStyles.cell);
const Remove: StyledPart<typeof SdkRemoveButton> = sdkPart(
  SdkRemoveButton,
  "tag-remove-button",
  () => tagStyles.removeButton,
);

const Removal = createContext<{
  label: () => string;
  disabled: () => boolean;
  remove: () => void;
} | null>(null);
export function TagRemoveButton(props: ComponentProps<typeof Remove>) {
  const owner = useContext(Removal);
  return (
    <Remove
      aria-label={owner ? "Remove " + owner.label() : "Remove"}
      {...props}
      disabled={props.disabled || owner?.disabled()}
      onClick={(event, details) => {
        const cb = props.onClick;
        const result =
          typeof cb === "function" ? cb(event, details) : cb?.[0](cb[1], event, details);
        if (!event.defaultPrevented) owner?.remove();
        return result;
      }}
    />
  );
}
export function TagRoot(
  props: Omit<ComponentProps<typeof Item>, "children"> & {
    children?:
      | JSX.Element
      | ((state: {
          allowsRemoving: boolean;
          isSelected: boolean;
          isDisabled: boolean;
        }) => JSX.Element);
    itemKey?: TableKey;
    textValue?: string;
    remove?: JSX.Element;
  },
) {
  const group = useContext(TagGroupContext);
  const [node, setNode] = createSignal<HTMLLIElement>();
  const key = () => props.itemKey;
  const disabled = () =>
    Boolean(
      props.disabled ||
      group?.props.disabled ||
      (key() !== undefined && group?.props.disabledKeys?.has(key()!)),
    );
  const selected = () => props.selected ?? (key() !== undefined && group?.selected().has(key()!));
  const managed = () => group && key() !== undefined;
  const removed = () => key() !== undefined && group?.isRemoved(key()!);
  createEffect(
    () => [removed() ? undefined : node(), key(), disabled()] as const,
    ([el, k, d]) => (el && k !== undefined ? group?.register(k, el, d) : undefined),
  );
  const label = () => props.textValue ?? String(key() ?? "tag");
  const remove = () => {
    if (!disabled() && key() !== undefined) group?.remove(key()!);
  };
  const removable = () =>
    Boolean(managed() && (group?.items() || group?.props.onRemove || group?.props.onItemsChange));
  return (
    <Removal value={{ label, disabled, remove }}>
      <Show when={!removed()}>
        <Item
          {...omit(props, "itemKey", "textValue", "ref", "children", "remove")}
          ref={[setNode, props.ref]}
          size={props.size ?? group?.props.size}
          variant={props.variant ?? group?.props.variant}
          disabled={disabled()}
          selected={selected()}
          role={managed() ? "row" : props.role}
          aria-label={props["aria-label"] ?? (managed() ? label() : undefined)}
          aria-disabled={disabled() ? "true" : props["aria-disabled"]}
          data-selected={selected() ? "" : undefined}
          data-collection-item={managed() ? "tag" : undefined}
          data-material="glass-small"
          aria-selected={
            managed() && group?.props.selectionMode && group.props.selectionMode !== "none"
              ? selected()
                ? "true"
                : "false"
              : undefined
          }
          tabindex={
            managed()
              ? disabled()
                ? -1
                : Number(
                    group!.handle.api.roving.tabIndex(group!.state(), {
                      key: tagId(key()!),
                      props: { value: tagId(key()!) },
                    }),
                  )
              : props.tabindex
          }
          onClick={(e) => {
            const cb = props.onClick;
            if (typeof cb === "function") cb(e);
            else if (cb) cb[0](cb[1], e);
            if (
              !e.defaultPrevented &&
              managed() &&
              !disabled() &&
              !(e.target as Element).closest("button")
            )
              group!.select(key()!, e);
          }}
          onKeyDown={(e) => {
            const cb = props.onKeyDown;
            if (typeof cb === "function") cb(e);
            else if (cb) cb[0](cb[1], e);
            if (e.defaultPrevented || e.target !== e.currentTarget || !managed() || disabled())
              return;
            if (removable() && (e.key === "Delete" || e.key === "Backspace")) {
              e.preventDefault();
              remove();
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              group!.select(key()!, e);
            } else {
              const move = group!.handle.api.roving.keydown(e, e.currentTarget);
              if (move?.shift) {
                const node = group!.handle.api.roving.items().find((x) => x.key === move.key);
                const dest = group!.items()?.find((x) => tagId(x.key) === node?.key);
                if (dest) group!.select(dest.key, e, move.from);
              }
            }
          }}
        >
          <Cell role={managed() ? "gridcell" : undefined}>
            {typeof props.children === "function"
              ? props.children({
                  allowsRemoving: removable(),
                  isSelected: !!selected(),
                  isDisabled: disabled(),
                })
              : props.children}
          </Cell>
          {managed() && removable() && (
            <span role={managed() ? "gridcell" : undefined}>
              {props.remove ?? <TagRemoveButton>×</TagRemoveButton>}
            </span>
          )}
        </Item>
      </Show>
    </Removal>
  );
}
export const Tag: typeof TagRoot & {
  Root: typeof TagRoot;
  RemoveButton: typeof TagRemoveButton;
} = Object.assign(TagRoot, {
  Root: TagRoot,
  RemoveButton: TagRemoveButton,
});
