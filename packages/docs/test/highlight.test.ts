import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement, Fragment } from "react";
import { highlightSource } from "../dist/highlight.js";

test("highlights authored languages and aliases with both theme colors", async () => {
  for (const language of ["tsx", "ts", "js", "jsonc", "css", "html", "bash", "sh"]) {
    const markup = renderToStaticMarkup(
      createElement(Fragment, null, await highlightSource("const answer = 42", language)),
    );

    assert.match(markup, /const/);
    assert.match(markup, />1</);
  }
});

test("unknown languages fall back to plain text and preserve numbered rows", async () => {
  const markup = renderToStaticMarkup(
    createElement(Fragment, null, await highlightSource("first\nsecond\n", "not-a-language")),
  );

  assert.match(markup, /first/);
  assert.match(markup, /second/);
  assert.match(markup, />1</);
  assert.match(markup, />2</);
  assert.doesNotMatch(markup, />3</);
});
