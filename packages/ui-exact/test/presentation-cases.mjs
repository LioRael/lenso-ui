import assert from "node:assert/strict";

/** Compare metadata-only styles with the compiled class branch for every recipe. */
export async function checkPresentationCases(page, kinds) {
  const results = await page.evaluate(async (kinds) => {
    const { presentationCases } = await import(
      new URL("./modules/lenso-ui/presentation.js", document.baseURI).href
    );
    const { styleRules } = await import(
      new URL("./modules/style-config/index.js", document.baseURI).href
    );
    const fixture = document.createElement("div");
    fixture.style.cssText = "position:fixed;left:-10000px;top:0;width:320px";
    fixture.setAttribute("aria-hidden", "true");
    fixture.inert = true;
    document.getElementById("exact-root").append(fixture);
    const results = [];
    try {
      for (const entry of presentationCases(styleRules)) {
        if (kinds && !kinds.includes(entry.kind)) continue;
        const wrapper = document.createElement("div");
        if (entry.inputGroup) wrapper.dataset.slot = "input-group";
        const svg = [
          "checkbox-checkmark",
          "checkbox-mixed",
          "disclosure-indicator",
          "accordion-indicator",
          "breadcrumbs-chevron",
          "progress-circle-track",
          "progress-circle-track-circle",
          "progress-circle-fill-circle",
          "spinner-icon",
          "modal-close-glyph",
          "alert-icon",
          "close-button-icon",
          "search-field-icon",
          "search-field-clear-icon",
        ].includes(entry.kind);
        let tag =
          entry.kind.includes("button") || entry.kind === "search-field-clear"
            ? "button"
            : entry.kind === "input" ||
                entry.kind === "choice-input" ||
                entry.kind === "search-field-input"
              ? "input"
              : entry.kind === "textarea"
                ? "textarea"
                : "div";
        if (
          ["pagination-link", "pagination-previous", "pagination-next", "toolbar-link"].includes(
            entry.kind,
          )
        )
          tag = "a";
        const node = svg
          ? document.createElementNS(
              "http://www.w3.org/2000/svg",
              entry.kind.endsWith("-circle") ? "circle" : "svg",
            )
          : document.createElement(tag);
        for (const [key, value] of Object.entries(entry.data)) node.dataset[key] = value;
        for (const [key, value] of Object.entries(entry.attributes ?? {}))
          node.setAttribute(key, value);
        if (entry.kind === "glass-container-surface") node.setAttribute("hidden", "");
        if (entry.kind === "search-field-input") {
          node.setAttribute("type", "search");
          node.setAttribute("data-native", "");
        }
        if (node instanceof HTMLTextAreaElement) node.rows = Number(entry.data.lensoRows);
        if (node instanceof HTMLInputElement) node.value = "Sample";
        else if (!svg) node.textContent = "Sample";
        const reference = node.cloneNode(true);
        reference.removeAttribute("data-lenso-kind");
        reference.dataset.lensoReady = "";
        reference.setAttribute("class", entry.classes.join(" "));
        const referenceWrapper = wrapper.cloneNode(false);
        wrapper.append(node);
        referenceWrapper.append(reference);
        fixture.append(wrapper, referenceWrapper);
        const properties = [
          "width",
          "height",
          "display",
          "position",
          "fontSize",
          "fontWeight",
          "color",
          "backgroundColor",
          "borderRadius",
          "paddingTop",
          "paddingLeft",
          "opacity",
          "strokeWidth",
        ];
        if (entry.kind === "search-field-input")
          properties.push("borderTopWidth", "appearance", "lineHeight");
        const actual = getComputedStyle(node);
        const expected = getComputedStyle(reference);
        const differences = properties
          .filter((property) => actual[property] !== expected[property])
          .map((property) => ({
            property,
            metadata: actual[property],
            classes: expected[property],
          }));
        if (entry.kind === "scroll-shadow") {
          for (const property of [
            "mask-image",
            "mask-size",
            "mask-position",
            "mask-repeat",
            "overflow-x",
            "overflow-y",
            "scrollbar-width",
            "animation-name",
            "animation-duration",
            "animation-timing-function",
            "animation-fill-mode",
            "animation-range",
            "animation-timeline",
            "--scroll-shadow-size",
            "--scroll-shadow-offset",
            "--scroll-shadow-before",
            "--scroll-shadow-after",
            "--scroll-shadow-observed-before",
            "--scroll-shadow-observed-after",
          ]) {
            const metadata = actual.getPropertyValue(property),
              classes = expected.getPropertyValue(property);
            if (metadata !== classes) differences.push({ property, metadata, classes });
          }
        }
        if (entry.kind === "button") {
          const radius = actual.borderRadius;
          node.dataset.lensoReady = "";
          if (getComputedStyle(node).borderRadius === radius)
            differences.push({
              property: "initialized metadata fallback",
              metadata: radius,
              classes: "must retire after initialization",
            });
        }
        results.push({ kind: entry.kind, selector: entry.selector, differences });
        wrapper.remove();
        referenceWrapper.remove();
      }
    } finally {
      fixture.remove();
    }
    return results;
  }, kinds);
  for (const kind of kinds ?? [])
    assert.ok(
      results.some((entry) => entry.kind === kind),
      `Missing presentation cases for ${kind}`,
    );
  assert.deepEqual(
    results.filter((entry) => entry.differences.length),
    [],
  );
  return results.length;
}
