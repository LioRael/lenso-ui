// Adapted from HeroUI v3.2.6 at e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// Apache-2.0; source scenarios retained, Base Field/Input own native state.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { SearchField, Label, Description, FieldError, Form, Button, Kbd, Spinner } from "@lenso/ui";
import { formWorkflowStyles as s } from "./form-workflow.stylex";

const meta = {
  component: SearchField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Forms/SearchField",
} satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

function Search({
  label = "Search",
  placeholder = "Search...",
  description,
  error,
  required = false,
  value,
  onValueChange,
  inputRef,
  custom = false,
  ...props
}: ComponentProps<typeof SearchField> & {
  label?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  inputRef?: ComponentProps<typeof SearchField.Input>["ref"];
  custom?: boolean;
}) {
  return (
    <SearchField {...props}>
      <Label required={required}>{label}</Label>
      <SearchField.Group>
        {custom ? (
          <SearchField.SearchIcon viewBox="0 0 16 16" stroke="none">
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              fill="currentColor"
              d="M12.5 4c0 .174-.071.513-.885.888S9.538 5.5 8 5.5s-2.799-.237-3.615-.612C3.57 4.513 3.5 4.174 3.5 4s.071-.513.885-.888S6.462 2.5 8 2.5s2.799.237 3.615.612c.814.375.885.714.885.888m-1.448 2.66C10.158 6.888 9.115 7 8 7s-2.158-.113-3.052-.34l1.98 2.905c.21.308.322.672.322 1.044v3.37q.088.02.25.021c.422 0 .749-.14.95-.316c.185-.162.3-.38.3-.684v-2.39c0-.373.112-.737.322-1.045zM8 1c3.314 0 6 1 6 3a3.24 3.24 0 0 1-.563 1.826l-3.125 4.584a.35.35 0 0 0-.062.2V13c0 1.5-1.25 2.5-2.75 2.5s-1.75-1-1.75-1v-3.89a.35.35 0 0 0-.061-.2L2.563 5.826A3.24 3.24 0 0 1 2 4c0-2 2.686-3 6-3m-.88 12.936q-.015-.008-.013-.01z"
            />
          </SearchField.SearchIcon>
        ) : (
          <SearchField.SearchIcon />
        )}
        <SearchField.Input
          ref={inputRef}
          required={required}
          value={value}
          onValueChange={onValueChange}
          placeholder={placeholder}
          xstyle={props.fullWidth ? s.wide : s.search}
        />
        <SearchField.ClearButton disabled={props.disabled}>
          {custom ? (
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                fill="currentColor"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M6.53 5.47a.75.75 0 0 0-1.06 1.06L6.94 8L5.47 9.47a.75.75 0 1 0 1.06 1.06L8 9.06l1.47 1.47a.75.75 0 1 0 1.06-1.06L9.06 8l1.47-1.47a.75.75 0 1 0-1.06-1.06L8 6.94z"
              />
            </svg>
          ) : undefined}
        </SearchField.ClearButton>
      </SearchField.Group>
      {error ? (
        <FieldError match>{error}</FieldError>
      ) : (
        description && <Description>{description}</Description>
      )}
    </SearchField>
  );
}
export const Default: Story = { render: () => <Search name="search" /> };
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Search name="primary-search" variant="primary" label="Primary variant" />
      <Search name="secondary-search" variant="secondary" label="Secondary variant" />
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.full)}>
      <Search fullWidth name="search" />
    </div>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Search
        name="search"
        label="Search products"
        placeholder="Search products..."
        description="Enter keywords to search for products"
      />
      <Search
        name="search-users"
        label="Search users"
        placeholder="Search users..."
        description="Search by name, email, or username"
      />
    </div>
  ),
};
export const Required: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Search required name="search" />
      <Search
        required
        name="search-query"
        label="Search query"
        placeholder="Enter search query..."
        description="Minimum 3 characters required"
      />
    </div>
  ),
};
export const Invalid: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Search
        invalid
        required
        name="search"
        value="ab"
        error="Search query must be at least 3 characters"
      />
      <Search
        invalid
        name="search-invalid"
        value="invalid@query"
        error="Invalid characters in search query"
      />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Search
        disabled
        name="search"
        value="Disabled search"
        description="This search field is disabled"
      />
      <Search disabled name="search-empty" description="This search field is disabled" />
    </div>
  ),
};
function ControlledSearch() {
  const [value, setValue] = useState("");
  return (
    <div {...stylex.props(s.stack)}>
      <Search
        name="search"
        value={value}
        onValueChange={setValue}
        description={`Current value: ${value || "(empty)"}`}
      />
      <div {...stylex.props(s.row)}>
        <Button variant="tertiary" onClick={() => setValue("")}>
          Clear
        </Button>
        <Button variant="tertiary" onClick={() => setValue("example query")}>
          Set example
        </Button>
      </div>
    </div>
  );
}
export const Controlled: Story = { render: () => <ControlledSearch /> };
function ValidatedSearch({ form = false }: { form?: boolean }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const invalid = value.length > 0 && value.length < 3;
  const field = (
    <Search
      required
      invalid={invalid}
      name="search"
      value={value}
      onValueChange={setValue}
      label={form ? "Search products" : "Search"}
      placeholder={form ? "Search products..." : "Search..."}
      fullWidth={form}
      error={invalid ? "Search query must be at least 3 characters" : undefined}
      description="Enter at least 3 characters to search"
    />
  );
  if (!form) return <div {...stylex.props(s.stack)}>{field}</div>;
  return (
    <Form
      xstyle={s.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (value.length < 3 || submitting) return;
        const query = new FormData(event.currentTarget).get("search");
        setSubmitting(true);
        timer.current = setTimeout(() => {
          console.log("Search submitted:", { query });
          setValue("");
          setSubmitting(false);
        }, 1500);
      }}
    >
      {field}
      <Button
        xstyle={s.wide}
        disabled={value.length < 3}
        isLoading={submitting}
        type="submit"
        variant="primary"
      >
        {submitting ? (
          <>
            <Spinner color="current" size="sm" />
            Searching...
          </>
        ) : (
          "Search"
        )}
      </Button>
    </Form>
  );
}
export const WithValidation: Story = { render: () => <ValidatedSearch /> };
export const CustomIcons: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Search
        name="search-custom"
        label="Search (Custom Icons)"
        custom
        description="Custom icon children"
      />
    </div>
  ),
};
export const FormExample: Story = { render: () => <ValidatedSearch form /> };
function KeyboardSearch() {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState("");
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        ref.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === ref.current) ref.current?.blur();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return (
    <div {...stylex.props(s.stack)}>
      <Search
        name="search"
        inputRef={ref}
        value={value}
        onValueChange={setValue}
        description="Use keyboard shortcut to quickly focus this field"
      />
      <div {...stylex.props(s.row, s.muted)}>
        <span>Press</span>
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>K</Kbd.Content>
        </Kbd>
        <span>to focus the search field</span>
      </div>
    </div>
  );
}
export const WithKeyboardShortcut: Story = { render: () => <KeyboardSearch /> };
