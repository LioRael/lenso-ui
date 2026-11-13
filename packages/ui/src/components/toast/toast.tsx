"use client";
// UI SDK owns the notification queue and dismissal.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import * as SdkToast from "@ui-sdk/react/toast";
import type { Toast as ToastData } from "@ui-sdk/core/toast";
import { slotRender } from "../../utils/sdk-render.js";
import { toastStyles as s } from "@lenso/tokens/toast";
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { CloseIcon, DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/index.js";
import { Spinner } from "../spinner/spinner.js";
import { ProgressCircle } from "../progress-circle/progress-circle.js";
import { PillSwap, usePillSize, usePillTransition } from "./pill-motion.js";
import { PillNumber } from "./pill-number.js";
import { PillMarquee } from "./pill-marquee.js";

const ToastDataContext = React.createContext<ToastData<React.ReactNode> | null>(null);
type Tone = "default" | "accent" | "success" | "warning" | "danger";
type Variant = Tone | "glass" | "pill";
const PillContext = React.createContext<ToastData<React.ReactNode> | null>(null);
const IndicatorContext = React.createContext({ variant: "default" as Tone, loading: false });
export function ToastContent({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentPropsWithRef<"div">, "ref">> &
  Pick<React.ComponentPropsWithRef<"div">, "ref">) {
  const pill = React.useContext(PillContext);
  const compiled = stylex.props(s.fading, s.content, pill && s.pillContent, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "toast-content"
      }
    />
  );
}
export function ToastTitle({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkToast.ToastTitle>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkToast.ToastTitle>, "ref">) {
  const pill = React.useContext(PillContext);
  const content = (typeof children === "function" ? children({}) : children) ?? pill?.title;
  const compiled = stylex.props(s.title, pill && s.pillTitle, xstyle);
  return (
    <SdkToast.ToastTitle
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "toast-title"
      }
    >
      {pill ? (
        <PillSwap identity={React.isValidElement(content) ? content.type : content}>
          {content}
        </PillSwap>
      ) : typeof children === "function" ? (
        children({})
      ) : (
        children
      )}
    </SdkToast.ToastTitle>
  );
}
export function ToastMarquee({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(s.marquee, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="toast-marquee"
    >
      <PillMarquee>{children}</PillMarquee>
    </span>
  );
}
export function ToastDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkToast.ToastDescription>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkToast.ToastDescription>, "ref">) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <SdkToast.ToastDescription
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "toast-description"
      }
    />
  );
}
export function ToastClose({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkToast.ToastClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkToast.ToastClose>, "ref">) {
  const pill = React.useContext(PillContext);
  const compiled = stylex.props(
    closeButtonStyles.root,
    s.close,
    pill && s.pillControl,
    pill && s.pillClose,
    xstyle,
  );
  return (
    <SdkToast.ToastClose
      aria-label="Close"
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "toast-close"
      }
    >
      {children ?? <CloseIcon {...stylex.props(s.closeIcon)} data-lenso-slot="close-button-icon" />}
    </SdkToast.ToastClose>
  );
}
export function ToastAction({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkToast.ToastAction>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkToast.ToastAction>, "ref">) {
  const pill = React.useContext(PillContext);
  const compiled = stylex.props(
    s.fading,
    s.action,
    pill && s.pillControl,
    pill && s.pillAction,
    xstyle,
  );
  return (
    <SdkToast.ToastAction
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "toast-action"
      }
    >
      {children}
    </SdkToast.ToastAction>
  );
}
export function ToastIndicator({
  children,
  variant,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { variant?: Tone }) {
  const inherited = React.useContext(IndicatorContext);
  const pill = React.useContext(PillContext);
  const tone = variant ?? inherited.variant;
  const DefaultIcon =
    tone === "success"
      ? SuccessIcon
      : tone === "warning"
        ? WarningIcon
        : tone === "danger"
          ? DangerIcon
          : InfoIcon;
  const content =
    children ??
    (inherited.loading ? (
      pill ? (
        <span {...stylex.props(s.radialSpinner)}>
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} {...stylex.props(s.spinnerBar(index))} />
          ))}
        </span>
      ) : (
        <Spinner color="current" size="sm" />
      )
    ) : (
      <DefaultIcon data-lenso-slot="toast-default-icon" />
    ));
  const kind = React.isValidElement(content) ? content.type : content;
  const swapIdentity = React.useMemo(() => ({ kind, type: pill?.type }), [kind, pill?.type]);
  const previousKind = React.useRef(kind);
  const [swapped, setSwapped] = React.useState(false);
  React.useLayoutEffect(() => {
    if (previousKind.current !== kind) {
      previousKind.current = kind;
      setSwapped(true);
    }
  }, [kind]);
  const compiled = stylex.props(s.fading, s.indicator, pill && s.pillIndicator, xstyle);
  return (
    <span
      aria-hidden="true"
      {...props}
      data-swapped={swapped ? "true" : undefined}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "toast-indicator"
      }
    >
      {pill ? <PillSwap identity={swapIdentity}>{content}</PillSwap> : content}
    </span>
  );
}
/** A native progress value with a ring, message and rolling percentage. */
export function ToastProgress({
  children,
  value,
  min = 0,
  max = 100,
  xstyle,
  ...props
}: Omit<React.ComponentProps<typeof ProgressCircle.Root>, "children"> & {
  children?: React.ReactNode;
}) {
  const percentage =
    max > min
      ? Math.round(Math.max(0, Math.min(100, (((value ?? min) - min) / (max - min)) * 100)))
      : 0;
  return (
    <ProgressCircle.Root
      {...props}
      value={value}
      min={min}
      max={max}
      data-lenso-slot="toast-progress"
      xstyle={[s.pillProgress, xstyle]}
    >
      <ProgressCircle.Track xstyle={s.pillProgressTrack}>
        <ProgressCircle.TrackCircle xstyle={s.pillProgressTrackCircle} />
        <ProgressCircle.FillCircle xstyle={s.progressFill} />
      </ProgressCircle.Track>
      {children}
      {value != null && (
        <span aria-hidden="true" {...stylex.props(s.pillProgressValue)}>
          <PillNumber value={percentage} />%
        </span>
      )}
    </ProgressCircle.Root>
  );
}

export type ToastRegionProps = StyleXProps<React.ComponentProps<typeof SdkToast.ToastRegion>>;
export function ToastRegion({
  xstyle,
  style,
  children,
  side = "bottom",
  align = "center",
  ...props
}: ToastRegionProps) {
  const compiled = stylex.props(s.viewport, xstyle);
  return (
    <SdkToast.ToastRegion
      {...props}
      side={side}
      align={align}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("section", props["data-lenso-slot"] ?? "toast-region", props.render)}
    >
      {(data, item) => (
        <ToastDataContext value={data}>
          {children ? (
            children(data, item)
          ) : (
            <ToastRoot>
              <ToastContent>
                <ToastTitle />
                <ToastDescription />
                <ToastAction />
                <ToastClose />
              </ToastContent>
            </ToastRoot>
          )}
        </ToastDataContext>
      )}
    </SdkToast.ToastRegion>
  );
}
export type ToastRootProps = StyleXProps<React.ComponentProps<typeof SdkToast.Toast>> & {
  variant?: Variant;
};
export function ToastRoot({
  variant = "glass",
  xstyle,
  style,
  children,
  ...props
}: ToastRootProps) {
  const data = React.useContext(ToastDataContext);
  const pill = variant === "pill",
    glass = variant === "glass" || pill;
  const material = pill ? presentationMaterials.compact : presentationMaterials.toast;
  const measure = usePillSize(pill),
    previous = usePillTransition(measure, data?.type, data?.version, pill);
  const appearance = glass
    ? data?.type === "error"
      ? "danger"
      : (data?.type ?? "default")
    : variant;
  const tone: Tone =
    appearance === "accent" ||
    appearance === "success" ||
    appearance === "warning" ||
    appearance === "danger"
      ? appearance
      : "default";
  const indicator = React.useMemo(
    () => ({ variant: tone, loading: data?.type === "loading" }),
    [tone, data?.type],
  );
  const compiled = stylex.props(
    glass && materialStyles.root,
    s.root,
    glass && s.glass,
    pill && s.pill,
    glass && materialStyles.accessible,
    xstyle,
  );
  return (
    <PillContext value={pill ? data : null}>
      <IndicatorContext value={indicator}>
        <SdkToast.Toast
          {...props}
          {...compiled}
          style={mergeStyle(compiled.style, style)}
          render={slotRender("li", props["data-lenso-slot"] ?? "toast", props.render)}
          data-variant={variant}
          data-tone={tone}
          data-material={glass ? material : undefined}
        >
          {(state) => (
            <>
              {glass && <MaterialBackground variant={material} liveGeometry={pill} />}{" "}
              {pill ? (
                <div {...stylex.props(s.pillClip)}>
                  <div
                    ref={measure}
                    data-lenso-slot="toast-pill-measure"
                    {...stylex.props(s.pillMeasure)}
                  >
                    {typeof children === "function" ? children(state) : children}
                  </div>
                  <div ref={previous} aria-hidden="true" inert {...stylex.props(s.pillPrevious)} />
                </div>
              ) : typeof children === "function" ? (
                children(state)
              ) : (
                children
              )}
            </>
          )}
        </SdkToast.Toast>
      </IndicatorContext>
    </PillContext>
  );
}
export const createToaster = SdkToast.createToaster;
export const toast = SdkToast.toast;
export const Toast = Object.assign(ToastRoot, {
  Root: ToastRoot,
  Region: ToastRegion,
  Content: ToastContent,
  Title: ToastTitle,
  Description: ToastDescription,
  Close: ToastClose,
  Action: ToastAction,
  Indicator: ToastIndicator,
  Progress: ToastProgress,
  Marquee: ToastMarquee,
});
