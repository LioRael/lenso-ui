// HeroUI v3.2.6 Checkbox appearance (Apache-2.0), on the native public Table input.
// The input alone owns selection and keyboard activation; the sibling is decorative.
import * as stylex from "@stylexjs/stylex";
import { Table } from "@lenso/ui";
import { useId } from "react";
const selectionStyles = stylex.create({
  label: {
    position: "relative",
    display: "inline-flex",
    width: 16,
    height: 16,
    verticalAlign: "middle",
  },
  input: {
    position: "absolute",
    inset: 0,
    width: 16,
    height: 16,
    opacity: 0,
    margin: 0,
    zIndex: 1,
    cursor: "var(--cursor-interactive)",
  },
  control: {
    display: "inline-flex",
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    borderWidth: "var(--border-width-field)",
    borderStyle: "solid",
    borderColor: {
      default: null,
      ":is(span)": "var(--field-border)",
      ":is(input:checked + *, input:indeterminate + *)": "transparent",
    },
    backgroundColor: {
      default: null,
      ":is(span)": "var(--field-background)",
      ":is(input:checked + *, input:indeterminate + *)": "var(--accent)",
    },
    color: "var(--accent-foreground)",
    boxShadow: "var(--field-shadow)",
    outline: {
      default: null,
      ":is(span)": "none",
      ":is(input:focus-visible + *)": "2px solid var(--focus)",
    },
    outlineOffset: 2,
    pointerEvents: "none",
  },
  secondary: {
    backgroundColor: {
      default: null,
      ":is(span)": "var(--default)",
      ":is(input:checked + *, input:indeterminate + *)": "var(--accent)",
    },
    boxShadow: "none",
  },
  check: {
    width: 10,
    height: 10,
    opacity: { default: null, ":is(svg)": 0, ":is(input:checked + * *)": 1 },
  },
  mixed: {
    position: "absolute",
    width: 12,
    height: 12,
    opacity: { default: null, ":is(svg)": 0, ":is(input:indeterminate + * *)": 1 },
  },
});
export function CollectionSelection({
  label,
  secondary = false,
  indeterminate = false,
}: {
  label: string;
  secondary?: boolean;
  indeterminate?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} {...stylex.props(selectionStyles.label)}>
      <Table.SelectionCheckbox
        id={id}
        aria-label={label}
        xstyle={selectionStyles.input}
        ref={(input) => {
          if (input) input.indeterminate = indeterminate;
        }}
      />
      <span
        aria-hidden="true"
        {...stylex.props(selectionStyles.control, secondary && selectionStyles.secondary)}
      >
        <svg
          {...stylex.props(selectionStyles.check)}
          viewBox="0 0 17 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="1 9 7 14 15 4" />
        </svg>
        <svg
          {...stylex.props(selectionStyles.mixed)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <line x1="21" x2="3" y1="12" y2="12" />
        </svg>
      </span>
    </label>
  );
}
