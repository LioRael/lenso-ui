"use client";
import { usePlaygroundLog } from "../../shared/playground-log";
import { Button, Description, FieldError, Form, Label, SearchField, Spinner } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", width: 280, flexDirection: "column", gap: 16 },
  full: { width: "100%" },
});
export function FormExample() {
  const log = usePlaygroundLog();
  const [value, setValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const MIN_LENGTH = 3;
  const isInvalid = value.length > 0 && value.length < MIN_LENGTH;
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value.length < MIN_LENGTH || isSubmitting) return;
    setIsSubmitting(true);
    timer.current = setTimeout(() => {
      log("Search submitted:", { query: value });
      setValue("");
      setIsSubmitting(false);
    }, 1500);
  };
  return (
    <Form xstyle={styles.root} onSubmit={handleSubmit}>
      <SearchField invalid={isInvalid} name="search">
        <Label>Search products</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            required
            xstyle={styles.full}
            placeholder="Search products..."
            value={value}
            onValueChange={setValue}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
        {isInvalid ? (
          <FieldError match>Search query must be at least {MIN_LENGTH} characters</FieldError>
        ) : (
          <Description style={{ display: "block" }}>
            Enter at least {MIN_LENGTH} characters to search
          </Description>
        )}
      </SearchField>
      <Button
        xstyle={styles.full}
        disabled={value.length < MIN_LENGTH}
        isLoading={isSubmitting}
        type="submit"
        variant="prominent"
      >
        {isSubmitting ? (
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
