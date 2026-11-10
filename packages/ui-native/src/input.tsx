import { useMemo, type ComponentPropsWithRef } from "react";
import { Text, TextInput, View } from "react-native";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import type { InputProps, TextFieldProps } from "./types";

type NativeInputProps = ComponentPropsWithRef<typeof TextInput>;
function InputHost({
  native,
  ref,
  onFocus,
  onBlur,
  onSelectionChange,
  ...props
}: NativeInputProps & { native: NativeInputProps }) {
  const composedRef = useMemo(
    () => (node: React.ComponentRef<typeof TextInput> | null) => {
      const cleanups = [native.ref, ref].map((target) => {
        if (typeof target === "function") {
          const cleanup = target(node);
          return typeof cleanup === "function" ? cleanup : () => target(null);
        }
        if (target) {
          target.current = node;
          return () => {
            target.current = null;
          };
        }
        return undefined;
      });
      return () => {
        for (const cleanup of cleanups) cleanup?.();
      };
    },
    [native.ref, ref],
  );
  return (
    <TextInput
      {...native}
      {...props}
      ref={composedRef}
      onFocus={(event) => {
        native.onFocus?.(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        native.onBlur?.(event);
        onBlur?.(event);
      }}
      onSelectionChange={(event) => {
        native.onSelectionChange?.(event);
        onSelectionChange?.(event);
      }}
    />
  );
}

export function Input({
  disabled = false,
  readOnly = false,
  invalid = false,
  editable = true,
  multiline = false,
  xstyle,
  style,
  ...props
}: InputProps) {
  const { palette } = useLensoAppearance();
  return (
    <NativeStyle<NativeInputProps>
      as={multiline ? "textarea" : "input"}
      xstyle={xstyle}
      style={style}
    >
      {(resolved, native) => (
        <InputHost
          native={native}
          {...props}
          editable={editable && !disabled && !readOnly}
          multiline={multiline}
          accessibilityState={{ ...props.accessibilityState, disabled }}
          placeholderTextColor={props.placeholderTextColor ?? palette.secondaryLabel}
          selectionColor={props.selectionColor ?? palette.tint}
          style={[
            {
              minHeight: multiline ? 100 : 44,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: palette.secondaryBackground,
              color: palette.label,
              fontSize: 17,
              borderWidth: invalid ? 1 : 0,
              borderColor: palette.destructive,
              opacity: disabled ? 0.4 : 1,
              textAlignVertical: multiline ? "top" : "center",
            },
            resolved,
          ]}
        />
      )}
    </NativeStyle>
  );
}
export function Textarea(props: InputProps) {
  return <Input {...props} multiline />;
}
export function TextField({
  label,
  description,
  errorMessage,
  invalid = Boolean(errorMessage),
  testID,
  ...props
}: TextFieldProps) {
  const { palette } = useLensoAppearance();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: palette.label, fontSize: 15, fontWeight: "600" }}>{label}</Text>
      <Input
        {...props}
        testID={testID}
        invalid={invalid}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={errorMessage ?? description ?? props.accessibilityHint}
      />
      {(errorMessage || description) && (
        <Text
          accessibilityRole={errorMessage ? "alert" : "text"}
          style={{
            color: errorMessage ? palette.destructive : palette.secondaryLabel,
            fontSize: 13,
          }}
        >
          {errorMessage ?? description}
        </Text>
      )}
    </View>
  );
}
export function SearchField(props: InputProps) {
  return (
    <Input
      accessibilityRole="search"
      returnKeyType="search"
      clearButtonMode="while-editing"
      autoCorrect={false}
      {...props}
    />
  );
}
