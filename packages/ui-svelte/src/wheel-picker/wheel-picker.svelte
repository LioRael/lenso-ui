<script module lang="ts">
  export type WheelPickerProps = PartProps<"div", StateOf<typeof wheelPicker, "root">> &
    WheelOptions &
    StyleXProps & {
      emptyLabel?: string;
      name?: string;
      form?: string;
      required?: boolean;
    };
</script>

<script lang="ts">
  import { wheelPicker, type WheelOptions } from "@lenso/primitives/wheel-picker/core";
  import { wheelPickerStyles as s } from "@lenso/tokens/wheel-picker";
  import { bindScrollPicker, type StateOf } from "@ui-sdk/core";
  import { Part, usePart, usePrimitive, type PartProps } from "@ui-sdk/svelte/primitive";
  import { createAttachmentKey } from "svelte/attachments";
  import { ListBox } from "../list-box/index.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  let {
    options,
    value,
    defaultValue,
    onValueChange,
    controller,
    disabled,
    readOnly,
    name,
    form,
    required,
    emptyLabel = "No options",
    children: content,
    xstyle,
    class: className,
    style,
    ...rest
  }: WheelPickerProps = $props();
  const id = $props.id();
  const handle = usePrimitive(wheelPicker, () => ({
    id,
    options,
    value,
    defaultValue,
    onValueChange,
    controller,
    disabled,
    readOnly,
  }));
  const root = usePart(handle, "root");
  let selected = $state(handle.api.getValue());
  $effect(() => {
    const update = () => {
      selected = handle.api.getValue();
    };
    update();
    return handle.instance.subscribe(update);
  });
  const presentation = $derived(styled([s.root, disabled && s.disabled], xstyle, className, style));
  const attachment = {
    [createAttachmentKey()](node: HTMLElement) {
      const items = options;
      let active = true;
      const bind = () =>
        bindScrollPicker(node, {
          onSelect(index, { event }) {
            const item = items[index];
            if (!item) return;
            const accepted = handle.api.setValue(item.value, {
              reason:
                event instanceof KeyboardEvent
                  ? "list-navigation"
                  : event instanceof PointerEvent
                    ? "drag"
                    : "scroll",
              event,
            });
            if (!accepted) {
              queueMicrotask(() => {
                if (!active) return;
                unbind();
                unbind = bind();
              });
            }
          },
        });
      let unbind = bind();
      return () => {
        active = false;
        unbind();
      };
    },
  };
</script>

{#snippet contents(state: StateOf<typeof wheelPicker, "root">)}
  {#if content}
    {@render content(state)}
  {:else}
    <div aria-hidden="true" {...attributes(s.band)}></div>
    <ListBox
      {...attachment}
      data-agent-hidden=""
      aria-label={rest["aria-label"]}
      aria-labelledby={rest["aria-labelledby"]}
      {name}
      {form}
      {required}
      {disabled}
      {readOnly}
      value={selected}
      activation="automatic"
      loop={false}
      keepInView={false}
      xstyle={[s.viewport, disabled && s.disabledViewport]}
      onValueChange={(next, details) => {
        if (details.reason === "reset") {
          handle.api.reset();
          details.cancel();
        } else if (!handle.api.setValue(next, { reason: details.reason, event: details.event })) {
          details.cancel();
        }
      }}
    >
      {#each options as item (item.value)}
        <ListBox.Item
          value={item.value}
          label={item.label}
          aria-label={item.label}
          disabled={item.disabled}
          xstyle={s.option}
        >
          <span data-wheel-label="" aria-hidden="true" {...attributes(s.label)}>{item.label}</span>
        </ListBox.Item>
      {/each}
    </ListBox>
    {#if !options.length}<div {...attributes(s.empty)}>{emptyLabel}</div>{/if}
  {/if}
{/snippet}

{#if root.present}
  <Part
    tag="div"
    part={root}
    props={{ "data-lenso-slot": "wheel-picker", ...rest, ...presentation, children: contents }}
  />
{/if}
