import {
  ActivityIndicator,
  I18nManager,
  Text,
  View,
  type TextProps,
  type ViewProps,
} from "react-native";
import { css } from "react-strict-dom";
import { NativeStyle } from "./styles";
import { colors } from "./theme.css";
import { useLensoAppearance } from "./provider";
import type { NativeStyles } from "./types";
import { Button as CloseAction } from "./button";

export type BoxProps = Omit<ViewProps, "style"> & NativeStyles;
export type NativeTextProps = Omit<TextProps, "style"> &
  Omit<NativeStyles, "style"> & { style?: TextProps["style"] };
const s = css.create({
  box: { display: "flex", flexDirection: "column" },
  surface: { backgroundColor: colors.background },
  secondary: { backgroundColor: colors.secondaryBackground },
  card: { borderRadius: 20, padding: 20, gap: 12, backgroundColor: colors.secondaryBackground },
  group: { display: "flex", flexDirection: "column", gap: 8 },
  text: { color: colors.label, fontSize: 17 },
  secondaryText: { color: colors.secondaryLabel, fontSize: 15 },
  error: { color: colors.destructive, fontSize: 13 },
  title: { fontWeight: "600" },
  normal: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  bold: { fontWeight: "700" },
  h1: { fontSize: 34, fontWeight: "700" },
  h2: { fontSize: 28, fontWeight: "700" },
  h3: { fontSize: 24, fontWeight: "600" },
  h4: { fontSize: 20, fontWeight: "600" },
  h5: { fontSize: 17, fontWeight: "600" },
  h6: { fontSize: 15, fontWeight: "600" },
  small: { fontSize: 15 },
  xs: { fontSize: 13 },
  code: { fontFamily: "monospace", fontSize: 15 },
  label: { fontSize: 15, fontWeight: "600" },
  badge: {
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.fill,
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  alert: { borderRadius: 12, padding: 16, gap: 6, backgroundColor: colors.secondaryBackground },
  empty: { padding: 24, gap: 8, alignItems: "center" },
  separator: { height: 1, backgroundColor: colors.fill, alignSelf: "stretch" },
  vertical: { width: 1, height: "100%" },
  skeleton: { minHeight: 16, borderRadius: 6, backgroundColor: colors.fill },
});

function Box({ xstyle, style, ...props }: BoxProps) {
  return (
    <NativeStyle xstyle={[s.box, xstyle]} style={style}>
      {(resolved, native) => <View {...native} {...props} style={resolved} />}
    </NativeStyle>
  );
}
export interface TypographyProps extends NativeTextProps {
  type?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "body-sm" | "body-xs" | "code";
  color?: "default" | "secondary" | "danger";
  weight?: "normal" | "medium" | "semibold" | "bold";
  align?: "start" | "center" | "end";
  truncate?: boolean;
}
const typeStyles = {
  h1: s.h1,
  h2: s.h2,
  h3: s.h3,
  h4: s.h4,
  h5: s.h5,
  h6: s.h6,
  body: s.text,
  "body-sm": s.small,
  "body-xs": s.xs,
  code: s.code,
};
const weightStyles = { normal: s.normal, medium: s.medium, semibold: s.title, bold: s.bold };
export function Typography({
  type = "body",
  color = "default",
  weight,
  align = "start",
  truncate = false,
  xstyle,
  style,
  ...props
}: TypographyProps) {
  return (
    <NativeStyle<TextProps>
      as="span"
      xstyle={[
        s.text,
        typeStyles[type],
        color === "secondary" && s.secondaryText,
        color === "danger" && s.error,
        weight && weightStyles[weight],
        xstyle,
      ]}
      style={style}
    >
      {(resolved, native) => (
        <Text
          {...native}
          accessibilityRole={type.startsWith("h") ? "header" : "text"}
          {...props}
          numberOfLines={truncate ? 1 : props.numberOfLines}
          style={[
            {
              textAlign:
                align === "start"
                  ? "auto"
                  : align === "end"
                    ? I18nManager.isRTL
                      ? "left"
                      : "right"
                    : "center",
            },
            resolved,
          ]}
        />
      )}
    </NativeStyle>
  );
}
export function Heading({
  level = 1,
  ...props
}: Omit<TypographyProps, "type"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return <Typography {...props} type={`h${level}`} />;
}
export function Paragraph({
  size = "base",
  ...props
}: Omit<TypographyProps, "type"> & { size?: "base" | "sm" | "xs" }) {
  return <Typography {...props} type={size === "base" ? "body" : `body-${size}`} />;
}
export function Code(props: Omit<TypographyProps, "type">) {
  return <Typography {...props} type="code" />;
}
export function Label({ xstyle, ...props }: NativeTextProps) {
  return <Typography {...props} xstyle={[s.label, xstyle]} />;
}
export function Description({ xstyle, ...props }: NativeTextProps) {
  return <Typography {...props} xstyle={[s.secondaryText, xstyle]} />;
}
export function FieldError({ xstyle, ...props }: NativeTextProps) {
  return <Typography accessibilityRole="alert" {...props} xstyle={[s.error, xstyle]} />;
}

export function Surface({
  variant = "default",
  xstyle,
  ...props
}: BoxProps & { variant?: "default" | "secondary" | "transparent" }) {
  return (
    <Box
      {...props}
      xstyle={[variant === "default" && s.surface, variant === "secondary" && s.secondary, xstyle]}
    />
  );
}
function CardRoot({ xstyle, ...props }: BoxProps) {
  return <Box {...props} xstyle={[s.card, xstyle]} />;
}
function Stack({ xstyle, ...props }: BoxProps) {
  return <Box {...props} xstyle={[s.group, xstyle]} />;
}
function Title({ xstyle, ...props }: NativeTextProps) {
  return <Typography {...props} xstyle={[s.title, xstyle]} />;
}
export const Card = Object.assign(CardRoot, {
  Root: CardRoot,
  Header: Stack,
  Body: Stack,
  Footer: Stack,
  Title,
  Description,
});

export function Separator({
  orientation = "horizontal",
  xstyle,
  ...props
}: BoxProps & { orientation?: "horizontal" | "vertical" }) {
  return (
    <Box
      {...props}
      accessible={false}
      xstyle={[s.separator, orientation === "vertical" && s.vertical, xstyle]}
    />
  );
}
export function Badge({
  children,
  xstyle,
  ...props
}: Omit<BoxProps, "children"> & { children: string | number }) {
  return (
    <Box {...props} xstyle={[s.badge, xstyle]}>
      <Typography xstyle={s.badgeText}>{children}</Typography>
    </Box>
  );
}
export const Chip = Badge;
export const Tag = Badge;
function AlertRoot({ xstyle, ...props }: BoxProps) {
  return <Box accessibilityRole="alert" {...props} xstyle={[s.alert, xstyle]} />;
}
export const Alert = Object.assign(AlertRoot, { Root: AlertRoot, Title, Description });
function EmptyRoot({ xstyle, ...props }: BoxProps) {
  return <Box {...props} xstyle={[s.empty, xstyle]} />;
}
export const EmptyState = Object.assign(EmptyRoot, {
  Root: EmptyRoot,
  Title,
  Description,
  Action: Stack,
});
export function Skeleton({
  loading = true,
  children,
  xstyle,
  ...props
}: BoxProps & { loading?: boolean }) {
  return loading ? (
    <Box
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      xstyle={[s.skeleton, xstyle]}
    />
  ) : (
    children
  );
}
export function Spinner({
  size = "small",
  accessibilityLabel = "Loading",
  ...props
}: Omit<BoxProps, "children"> & { size?: "small" | "large" }) {
  const { palette } = useLensoAppearance();
  return (
    <Box {...props}>
      <ActivityIndicator
        size={size}
        color={palette.tint}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
      />
    </Box>
  );
}
export function Fieldset({ legend, children, xstyle, ...props }: BoxProps & { legend?: string }) {
  return (
    <Stack {...props} xstyle={xstyle}>
      {legend !== undefined && <Label>{legend}</Label>}
      {children}
    </Stack>
  );
}
export function InputGroup(props: BoxProps) {
  return <Stack {...props} />;
}
export function ButtonGroup({ style, ...props }: BoxProps) {
  return <Box {...props} style={[{ flexDirection: "row", flexWrap: "wrap", gap: 8 }, style]} />;
}
export function Toolbar(props: BoxProps) {
  return <ButtonGroup {...props} accessibilityRole="toolbar" />;
}
export function CloseButton({
  onPress,
  accessibilityLabel = "Close",
  ...props
}: Omit<import("./types").ButtonProps, "children">) {
  return (
    <CloseAction {...props} accessibilityLabel={accessibilityLabel} onPress={onPress}>
      ×
    </CloseAction>
  );
}
