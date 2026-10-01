"use client";
// HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { Button as BaseButton } from "@base-ui/react/button";
import { searchFieldStyles, searchFieldGroupStyles } from "@lenso/tokens/search-field";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { FieldScope } from "../textfield/field-scope.js";

type SearchContextValue = {
  input: React.RefObject<HTMLInputElement | null>;
  registerInput: (input: HTMLInputElement | null) => void;
  empty: boolean;
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
export type SearchFieldRootProps = StyleXProps<Field.Root.Props> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function SearchFieldRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SearchFieldRootProps) {
  const input = React.useRef<HTMLInputElement>(null);
  const [empty, setEmpty] = React.useState(true);
  const registerInput = React.useCallback((node: HTMLInputElement | null) => {
    input.current = node;
  }, []);
  const context = React.useMemo(
    () => ({ input, registerInput, empty, setEmpty, variant, fullWidth }),
    [empty, variant, fullWidth, registerInput],
  );
  const compiled = stylex.props(
    searchFieldStyles.root,
    fullWidth && searchFieldGroupStyles.fullWidth,
    xstyle,
  );
  return (
    <SearchContext value={context}>
      <FieldScope value={true}>
        <Field.Root
          {...props}
          {...compiled}
          style={mergeStyle<Field.Root.State>(compiled.style, style)}
          data-slot={slot ?? "search-field"}
        />
      </FieldScope>
    </SearchContext>
  );
}
export function SearchFieldGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const { variant, fullWidth } = useSearch();
  const compiled = stylex.props(
    searchFieldGroupStyles.root,
    variant === "secondary" && searchFieldGroupStyles.secondary,
    fullWidth && searchFieldGroupStyles.fullWidth,
    xstyle,
  );
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "search-field-group"}
    />
  );
}
export type SearchFieldInputProps = StyleXProps<
  Omit<BaseInput.Props, "ref"> & React.RefAttributes<HTMLElement>
> & { "data-slot"?: unknown };
export function SearchFieldInput({
  ref,
  value,
  defaultValue,
  onValueChange,
  onKeyDown,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SearchFieldInputProps) {
  const context = useSearch();
  React.useEffect(() => {
    context.setEmpty(String(value ?? context.input.current?.value ?? defaultValue ?? "") === "");
  }, [value, defaultValue, context]);
  const compiled = stylex.props(searchFieldGroupStyles.input, xstyle);
  return (
    <BaseInput
      type="search"
      {...props}
      {...compiled}
      style={mergeStyle<BaseInput.State>(compiled.style, style)}
      data-slot={slot ?? "search-field-input"}
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
          clearSearch(event.currentTarget);
        }
      }}
    />
  );
}

// Dispatch through the real input so Base Field updates validity, touched state and onValueChange identically to typing.
function clearSearch(input: HTMLInputElement) {
  const view = input.ownerDocument.defaultView;
  if (!view) return;
  Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")?.set?.call(input, "");
  input.dispatchEvent(new view.Event("input", { bubbles: true }));
  input.focus();
}
export type SearchFieldClearButtonProps = StyleXProps<
  Omit<BaseButton.Props, "ref"> & React.RefAttributes<HTMLElement>
> & { "data-slot"?: unknown };
export function SearchFieldClearButton({
  children = "×",
  onClick,
  disabled,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SearchFieldClearButtonProps) {
  const { input, empty } = useSearch();
  const compiled = stylex.props(searchFieldStyles.clear, xstyle);
  return (
    <BaseButton
      type="button"
      aria-label="Clear search"
      {...props}
      {...compiled}
      style={mergeStyle<BaseButton.State>(compiled.style, style)}
      data-slot={slot ?? "search-field-clear-button"}
      disabled={disabled || empty}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          input.current &&
          !input.current.disabled &&
          !input.current.readOnly
        )
          clearSearch(input.current);
      }}
    >
      {children}
    </BaseButton>
  );
}
export type SearchFieldSearchIconProps = StyleXProps<React.ComponentPropsWithRef<"svg">> & {
  "data-slot"?: unknown;
};
export function SearchFieldSearchIcon({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SearchFieldSearchIconProps) {
  const compiled = stylex.props(searchFieldStyles.icon, xstyle);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "search-field-search-icon"}
    >
      {children ?? (
        <>
          <circle cx={11} cy={11} r={7} />
          <path d="m16 16 4 4" />
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
