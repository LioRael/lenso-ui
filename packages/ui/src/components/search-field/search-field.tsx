"use client";
import { Field as SdkField, type FieldState } from "@ui-sdk/react/field";
import { slotRender } from "../../utils/sdk-render.js";
import * as React from "react";
import { clearInput } from "../../utils/clear-input.js";
import { Input as SdkInput, type InputState } from "@ui-sdk/react/input";
import { NativeButton as SdkButton } from "../../utils/native-button.js";
import { searchFieldStyles, searchFieldGroupStyles } from "@lenso/tokens/search-field";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { useGlassRef } from "@lenso/glass/react";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { FieldScope } from "../textfield/field-scope.js";

type SearchContextValue = {
  input: React.RefObject<HTMLInputElement | null>;
  registerInput: (input: HTMLInputElement | null) => void;
  empty: boolean;
  inputDisabled: boolean;
  setEmpty: React.Dispatch<React.SetStateAction<boolean>>;
  variant: "primary" | "secondary";
  fullWidth: boolean;
};
const SearchContext = React.createContext<SearchContextValue | null>(null);
function useSearch() {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error("SearchField parts must be inside SearchField.Root");
  return context;
}
export type SearchFieldRootProps = StyleXProps<React.ComponentProps<typeof SdkField>> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-lenso-slot"?: unknown;
};
export function SearchFieldRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: SearchFieldRootProps) {
  const input = React.useRef<HTMLInputElement>(null);
  const [empty, setEmpty] = React.useState(true);
  const [inputDisabled, setInputDisabled] = React.useState(false);
  React.useEffect(() => {
    const node = input.current;
    if (!node) return;
    const sync = () => setInputDisabled(node.disabled);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(node, { attributes: true, attributeFilter: ["disabled"] });
    return () => observer.disconnect();
  }, []);
  const registerInput = React.useCallback((node: HTMLInputElement | null) => {
    input.current = node;
  }, []);
  const context = React.useMemo(
    () => ({ input, registerInput, empty, inputDisabled, setEmpty, variant, fullWidth }),
    [empty, inputDisabled, variant, fullWidth, registerInput],
  );
  const compiled = stylex.props(
    searchFieldStyles.root,
    fullWidth && searchFieldGroupStyles.fullWidth,
    xstyle,
  );
  return (
    <SearchContext value={context}>
      <FieldScope value={true}>
        <SdkField
          {...props}
          {...compiled}
          style={mergeStyle<FieldState>(compiled.style, style)}
          render={slotRender("div", slot ?? "search-field", props.render)}
        />
      </FieldScope>
    </SearchContext>
  );
}
export function SearchFieldGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ref,
  onPointerDown,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const { variant, fullWidth, input, inputDisabled } = useSearch();
  const glassRef = useFocusMethodRef(useGlassRef(ref, true));
  const compiled = stylex.props(
    liquidMaterialStyles.small,
    searchFieldGroupStyles.root,
    variant === "secondary" && searchFieldGroupStyles.secondary,
    fullWidth && searchFieldGroupStyles.fullWidth,
    xstyle,
  );
  return (
    <div
      {...props}
      {...compiled}
      ref={glassRef}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (
          !event.defaultPrevented &&
          event.target instanceof Element &&
          !event.target.closest("input, button, a[href], [tabindex]")
        )
          input.current?.focus();
      }}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "search-field-group"}
      data-disabled={inputDisabled ? "" : undefined}
    />
  );
}
export type SearchFieldInputProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkInput>, "ref"> & React.RefAttributes<HTMLElement>
> & { "data-lenso-slot"?: unknown };
export function SearchFieldInput({
  ref,
  value,
  defaultValue,
  onValueChange,
  onKeyDown,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: SearchFieldInputProps) {
  const context = useSearch();
  React.useEffect(() => {
    context.setEmpty(String(value ?? context.input.current?.value ?? defaultValue ?? "") === "");
  }, [value, defaultValue, context]);
  const compiled = stylex.props(searchFieldGroupStyles.input, xstyle);
  return (
    <SdkInput
      type="search"
      {...props}
      {...compiled}
      style={mergeStyle<InputState>(compiled.style, style)}
      render={slotRender("input", slot ?? "search-field-input", props.render)}
      value={value}
      defaultValue={defaultValue}
      ref={(node) => {
        context.registerInput(node as HTMLInputElement | null);
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      onValueChange={(next, details) => {
        context.setEmpty(next === "");
        onValueChange?.(next, details);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          event.key === "Escape" &&
          event.currentTarget.value &&
          !event.currentTarget.readOnly &&
          !event.currentTarget.disabled
        ) {
          event.preventDefault();
          clearInput(event.currentTarget);
        }
      }}
    />
  );
}

export type SearchFieldClearButtonProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkButton>, "ref"> & React.RefAttributes<HTMLElement>
> & { "data-lenso-slot"?: unknown };
export function SearchFieldClearButton({
  children = (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      {...stylex.props(searchFieldStyles.clearIcon)}
    >
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  ),
  onClick,
  onPointerDown,
  disabled,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: SearchFieldClearButtonProps) {
  const { input, empty, inputDisabled } = useSearch();
  const compiled = stylex.props(searchFieldStyles.clear, xstyle);
  return (
    <SdkButton
      type="button"
      aria-label="Clear search"
      {...props}
      {...compiled}
      style={mergeStyle<import("@ui-sdk/react/button").ButtonState>(compiled.style, style)}
      data-lenso-slot={slot ?? "search-field-clear-button"}
      disabled={disabled || empty || inputDisabled}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        event.preventDefault();
      }}
      onClick={(event, details) => {
        onClick?.(event, details);
        if (
          !event.defaultPrevented &&
          input.current &&
          !input.current.disabled &&
          !input.current.readOnly
        )
          clearInput(input.current);
      }}
    >
      {children}
    </SdkButton>
  );
}
export type SearchFieldSearchIconProps = StyleXProps<React.ComponentPropsWithRef<"svg">> & {
  "data-lenso-slot"?: unknown;
};
export function SearchFieldSearchIcon({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: SearchFieldSearchIconProps) {
  const compiled = stylex.props(searchFieldStyles.icon, xstyle);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "search-field-search-icon"}
    >
      {children ?? (
        <>
          <circle cx={7} cy={7} r={4.75} />
          <path d="m10.5 10.5 3.25 3.25" />
        </>
      )}
    </svg>
  );
}
export const SearchField = Object.assign(SearchFieldRoot, {
  Root: SearchFieldRoot,
  Group: SearchFieldGroup,
  Input: SearchFieldInput,
  SearchIcon: SearchFieldSearchIcon,
  ClearButton: SearchFieldClearButton,
});
export type SearchFieldProps = SearchFieldRootProps;
export type SearchFieldGroupProps = React.ComponentProps<typeof SearchFieldGroup>;
