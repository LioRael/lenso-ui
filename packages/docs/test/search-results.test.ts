import { expect, test } from "bun:test";
import { compactSearchResults, prioritizeSearchPages } from "../src/search-results.ts";

test("exact page names precede incidental headings without separating their snippets", () => {
  const page = (id: string, content: string) => ({
    id,
    content,
    url: `/${id}`,
    type: "page" as const,
  });
  const checkbox = page("checkbox", "Checkbox");
  const incidental = { ...page("checkbox-form", "Form"), type: "heading" as const };
  const form = page("form", "Form");
  const snippet = { ...page("form-body", "Submit a form"), type: "text" as const };
  const fieldset = page("fieldset", "Form sections");
  expect(prioritizeSearchPages([checkbox, incidental, form, snippet, fieldset], " form ")).toEqual([
    form,
    snippet,
    fieldset,
    checkbox,
    incidental,
  ]);
});

test("body matches stay with their page while section targets remain keyboard reachable", () => {
  const page = { id: "button", type: "page" as const, url: "/button", content: "Button" };
  const heading = {
    id: "variants",
    type: "heading" as const,
    url: "/button#variants",
    content: "Variants",
  };
  const body = {
    id: "body",
    type: "text" as const,
    url: "/button#variants",
    content: "Button variants",
  };
  const next = { id: "group", type: "page" as const, url: "/button-group", content: "ButtonGroup" };
  expect(compactSearchResults([page, heading, body, next], "button")).toEqual([
    { ...page, summary: body.content },
    heading,
    next,
  ]);
  expect(page).not.toHaveProperty("summary");
});
