"use client";
// HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { Button as BaseButton } from "@base-ui/react/button";
import { searchFieldStyles, searchFieldGroupStyles } from "@lenso/tokens/search-field";
import { styledPart } from "../../utils/styled.js";
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
const Root = styledPart(Field.Root, "search-field", searchFieldStyles.root);
export type SearchFieldRootProps = React.ComponentProps<typeof Root> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export function SearchFieldRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
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
  return (
    <SearchContext value={context}>
      <FieldScope value={true}>
        <Root {...props} xstyle={[fullWidth && searchFieldGroupStyles.fullWidth, xstyle]} />
      </FieldScope>
    </SearchContext>
  );
}
const Group = styledPart("div", "search-field-group", searchFieldGroupStyles.root);
export function SearchFieldGroup({ xstyle, ...props }: React.ComponentProps<typeof Group>) {
  const { variant, fullWidth } = useSearch();
  return (
    <Group
      {...props}
      xstyle={[
        variant === "secondary" && searchFieldGroupStyles.secondary,
        fullWidth && searchFieldGroupStyles.fullWidth,
        xstyle,
      ]}
    />
  );
}
const Input = styledPart(BaseInput, "search-field-input", searchFieldGroupStyles.input);
export type SearchFieldInputProps = React.ComponentProps<typeof Input>;
export function SearchFieldInput({
  ref,
  value,
  defaultValue,
  onValueChange,
  onKeyDown,
  ...props
}: SearchFieldInputProps) {
  const context = useSearch();
  React.useEffect(() => {
    context.setEmpty(String(value ?? context.input.current?.value ?? defaultValue ?? "") === "");
  }, [value, defaultValue, context]);
  return (
    <Input
      type="search"
      {...props}
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
const Clear = styledPart(BaseButton, "search-field-clear-button", searchFieldStyles.clear);
export type SearchFieldClearButtonProps = React.ComponentProps<typeof Clear>;
export function SearchFieldClearButton({
  children = "×",
  onClick,
  disabled,
  ...props
}: SearchFieldClearButtonProps) {
  const { input, empty } = useSearch();
  return (
    <Clear
      type="button"
      aria-label="Clear search"
      {...props}
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
    </Clear>
  );
}
const Icon = styledPart("svg", "search-field-search-icon", searchFieldStyles.icon);
export type SearchFieldSearchIconProps = React.ComponentProps<typeof Icon>;
export function SearchFieldSearchIcon({ children, ...props }: SearchFieldSearchIconProps) {
  return (
    <Icon
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      {children ?? (
        <>
          <circle cx={11} cy={11} r={7} />
          <path d="m16 16 4 4" />
        </>
      )}
    </Icon>
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
