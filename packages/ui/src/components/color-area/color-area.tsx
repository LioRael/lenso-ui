"use client";
// Modified: native Base UI channel sliders plus a two-axis pointer coordinator.
import {
  createContext,
  use,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type PointerEvent,
} from "react";
import { Slider as Base } from "@base-ui/react/slider";
import { useRender } from "@base-ui/react/use-render";
import { useDirection } from "@base-ui/react/direction-provider";
import type { Color } from "react-stately/Color";
import {
  useColorAreaState,
  type ColorAreaState,
  type ColorAreaProps,
} from "react-stately/useColorAreaState";
import { sliderStyles } from "@lenso/tokens/slider";
import { useSliderThumbRef } from "../../utils/interaction/slider.js";
import { colorAreaStyles as styles } from "@lenso/tokens/color-area";
import * as stylex from "@stylexjs/stylex";
import { assignRef } from "../../utils/interaction/ref.js";
import { type StyleXProps } from "../../utils/styled.js";
import { ColorValueContext } from "../../utils/color-state.js";
import { colorAreaGradient } from "../../utils/color-gradient.js";
import { useLocale } from "../../utils/locale.js";
type AreaRenderState = { [K in keyof Base.Root.State]: Base.Root.State[K] } & {
  isDisabled: boolean;
  isDragging: boolean;
  state: ColorAreaState;
};
const AreaContext = createContext<{
  model: ColorAreaState;
  label?: string;
  locale: string;
  direction: "ltr" | "rtl";
} | null>(null);
function useArea() {
  const state = use(AreaContext);
  if (!state) throw new Error("ColorArea.Thumb requires ColorArea.Root");
  return state;
}
export type ColorAreaRootProps = StyleXProps<
  Omit<
    ComponentPropsWithRef<typeof Base.Root<number>>,
    "value" | "defaultValue" | "onChange" | "children" | "style" | "render"
  >
> &
  ColorAreaProps & {
    showDots?: boolean;
    xName?: string;
    yName?: string;
    children?: ReactNode | ((state: AreaRenderState) => ReactNode);
    style?: CSSProperties | ((state: AreaRenderState) => CSSProperties | undefined);
    render?: useRender.RenderProp<AreaRenderState>;
  };
export function ColorAreaRoot({
  value,
  defaultValue,
  colorSpace,
  xChannel,
  yChannel,
  onChange,
  onChangeEnd,
  isDisabled,
  disabled = isDisabled,
  showDots,
  xName,
  yName,
  name,
  form,
  children,
  render,
  style,
  xstyle,
  onValueChange,
  onValueCommitted,
  ...props
}: ColorAreaRootProps) {
  const parent = use(ColorValueContext);
  const { locale } = useLocale();
  const direction = useDirection();
  const inherits = value === undefined && defaultValue === undefined && parent;
  const model = useColorAreaState({
    value: inherits ? parent.color : value,
    defaultValue,
    colorSpace,
    xChannel,
    yChannel,
    isDisabled: disabled,
    onChangeEnd,
    onChange(color) {
      if (inherits) parent.setColor(color);
      onChange?.(color);
    },
  });
  const pointer = useRef<{ id: number; value: typeof model.value } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const xRange = model.value.getChannelRange(model.channels.xChannel);
  const yRange = model.value.getChannelRange(model.channels.yChannel);
  const gradient = colorAreaGradient(model.value, model.channels, direction);
  const compiled = stylex.props(
    styles.root,
    disabled && styles.disabled,
    showDots && styles.dots,
    xstyle,
  );
  const map = (native: Base.Root.State): AreaRenderState => ({
    ...native,
    isDisabled: native.disabled,
    isDragging: model.isDragging,
    state: model,
  });
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const x = (event.clientX - box.left) / box.width;
    model.setColorFromPoint(
      direction === "rtl" ? 1 - x : x,
      (event.clientY - box.top) / box.height,
    );
  };
  return (
    <AreaContext value={{ model, label: props["aria-label"], locale, direction }}>
      <Base.Root<number>
        {...props}
        {...compiled}
        thumbAlignment="edge"
        value={model.xValue}
        disabled={disabled}
        min={xRange.minValue}
        max={xRange.maxValue}
        step={xRange.step}
        largeStep={xRange.pageSize}
        name={xName ?? name}
        form={form}
        onValueChange={(next, details) => {
          onValueChange?.(next, details);
          if (!details.isCanceled) model.setXValue(next);
        }}
        onValueCommitted={(next, details) => {
          onValueCommitted?.(next, details);
          onChangeEnd?.(model.value.withChannelValue(model.channels.xChannel, next));
        }}
        data-slot={props["data-slot"] ?? "color-area"}
        style={(native) => ({
          ...compiled.style,
          ...gradient,
          forcedColorAdjust: "none",
          ...(typeof style === "function" ? style(map(native)) : style),
        })}
        render={(nativeProps, nativeState) => (
          <ColorAreaFrame {...nativeProps} render={render} state={map(nativeState)}>
            <Base.Control
              data-lg-slider-control=""
              {...stylex.props(styles.control)}
              onPointerDownCapture={(event) => {
                if (disabled || event.defaultPrevented || event.button !== 0 || !event.isPrimary)
                  return;
                event.preventDefault();
                pointer.current = { id: event.pointerId, value: model.value };
                event.currentTarget.setPointerCapture(event.pointerId);
                inputRef.current?.focus({ preventScroll: true });
                model.setDragging(true);
                update(event);
              }}
              onPointerMove={(event) => {
                if (pointer.current?.id === event.pointerId) update(event);
              }}
              onPointerUp={(event) => {
                if (pointer.current?.id !== event.pointerId) return;
                update(event);
                pointer.current = null;
                model.setDragging(false);
                event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={(event) => {
                if (pointer.current?.id !== event.pointerId) return;
                const before = pointer.current.value;
                pointer.current = null;
                model.setValue(before);
                model.setDragging(false);
              }}
              onLostPointerCapture={() => {
                if (pointer.current) {
                  pointer.current = null;
                  model.setDragging(false);
                }
              }}
            >
              <AreaInputRef value={inputRef}>
                {typeof children === "function" ? children(map(nativeState)) : children}
              </AreaInputRef>
              <Base.Root<number>
                value={model.yValue}
                min={yRange.minValue}
                max={yRange.maxValue}
                step={yRange.step}
                largeStep={yRange.pageSize}
                orientation="vertical"
                disabled={disabled}
                name={yName}
                form={form}
                {...stylex.props(styles.secondaryAxis)}
                onValueChange={model.setYValue}
                onValueCommitted={(next) =>
                  onChangeEnd?.(model.value.withChannelValue(model.channels.yChannel, next))
                }
              >
                <Base.Control {...stylex.props(styles.control)}>
                  <Base.Thumb
                    aria-label={`${props["aria-label"] ?? "Color"} ${model.value.getChannelName(model.channels.yChannel, locale)}`}
                    getAriaValueText={() =>
                      model.value.formatChannelValue(model.channels.yChannel, locale)
                    }
                  />
                </Base.Control>
              </Base.Root>
            </Base.Control>
          </ColorAreaFrame>
        )}
      />
    </AreaContext>
  );
}
const AreaInputRef = createContext<React.RefObject<HTMLInputElement | null> | null>(null);
function ColorAreaFrame({
  render,
  state,
  ref,
  ...props
}: useRender.ComponentProps<"div", AreaRenderState> & { state: AreaRenderState }) {
  return useRender({
    defaultTagName: "div",
    render,
    state,
    stateAttributesMapping: { state: () => null },
    ref,
    props,
  });
}
export function ColorAreaThumb({
  ref,
  children,
  xstyle,
  style,
  onKeyDown,
  inputRef,
  ...props
}: StyleXProps<Omit<ComponentPropsWithRef<typeof Base.Thumb>, "style">> & {
  style?:
    | CSSProperties
    | ((
        state: Base.Thumb.State & { color: Color; defaultStyle: CSSProperties },
      ) => CSSProperties | undefined);
}) {
  const { model, label, locale } = useArea();
  const primaryInput = use(AreaInputRef);
  const presentationRef = useSliderThumbRef(ref);
  const position = model.getThumbPosition();
  const compiled = stylex.props(styles.thumb, model.isDragging && styles.dragging, xstyle);
  return (
    <Base.Thumb
      ref={presentationRef}
      data-lg-slider-thumb=""
      {...props}
      {...compiled}
      inputRef={(node) => {
        const primaryCleanup = assignRef(primaryInput ?? undefined, node);
        const callerCleanup = assignRef(inputRef, node);
        return () => {
          primaryCleanup();
          callerCleanup();
        };
      }}
      aria-label={
        props["aria-label"] ??
        `${label ?? "Color"} ${model.value.getChannelName(model.channels.xChannel, locale)}`
      }
      getAriaValueText={() =>
        `${model.value.formatChannelValue(model.channels.xChannel, locale)}, ${model.value.formatChannelValue(model.channels.yChannel, locale)}, ${model.value.getColorName(locale)}`
      }
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          if (event.key === "ArrowUp")
            model.incrementY(event.shiftKey ? model.yChannelPageStep : model.yChannelStep);
          else model.decrementY(event.shiftKey ? model.yChannelPageStep : model.yChannelStep);
        }
      }}
      data-slot={props["data-slot"] ?? "color-area-thumb"}
      style={(native) => ({
        ...compiled.style,
        top: `${position.y * 100}%`,
        "--lg-color-thumb": model.getDisplayColor().toString("css"),
        ...(typeof style === "function"
          ? style({
              ...native,
              color: model.getDisplayColor(),
              defaultStyle: { backgroundColor: model.getDisplayColor().toString("css") },
            })
          : style),
      })}
    >
      <span aria-hidden="true" {...stylex.props(sliderStyles.optical)}>
        <span
          {...stylex.props(sliderStyles.face)}
          style={{ backgroundColor: model.getDisplayColor().toString("css") }}
        />
      </span>
      {children}
    </Base.Thumb>
  );
}
