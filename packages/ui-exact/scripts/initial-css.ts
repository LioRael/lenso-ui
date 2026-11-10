import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

export interface PresentationCase {
  kind: string;
  selector: string;
  classes: string[];
}

/** Alias the compiled atomic rules; their declarations and specificity stay shared. */
export function initialCSS(css: string, cases: PresentationCase[]) {
  const aliases = new Map<string, Set<string>>();
  for (const entry of cases)
    for (const name of entry.classes) {
      const selectors = aliases.get(name) ?? new Set<string>();
      selectors.add(`${entry.selector}:not([data-lenso-ready])`);
      aliases.set(name, selectors);
    }
  const root = postcss.parse(css);
  const parsedAliases = new Map<string, selectorParser.Node>();
  const compound = (selector: string) => {
    const node = selectorParser().astSync(selector).first?.first;
    if (!node) throw new Error(`Invalid initial Lenso selector: ${selector}`);
    return node;
  };
  const states = new Map([
    ["data-invalid", "lenso-invalid"],
    ["data-disabled", "lenso-disabled"],
    ["data-checked", "lenso-checked"],
    ["data-indeterminate", "lenso-indeterminate"],
    ["data-open", "lenso-open"],
    ["data-panel-open", "lenso-panel-open"],
  ]);
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
    let changed = false;
    const selector = selectorParser().astSync(rule.selector);
    const classes: selectorParser.ClassName[] = [];
    selector.walkClasses((node) => {
      classes.push(node);
    });
    for (const node of classes) {
      const selectors = aliases.get(node.value);
      if (!selectors) continue;
      changed = true;
      let alias = parsedAliases.get(node.value);
      if (!alias) {
        alias = compound(`:is(${node.toString()},:where(${[...selectors].join(",")}))`);
        parsedAliases.set(node.value, alias);
      }
      node.replaceWith(alias.clone());
    }
    if (!changed) return;
    const attributes: selectorParser.Attribute[] = [];
    selector.walkAttributes((node) => {
      attributes.push(node);
    });
    for (const node of attributes) {
      const word = states.get(node.attribute);
      if (word && !node.operator)
        node.replaceWith(
          compound(`:is(${node.toString()},:where(:not([data-lenso-ready]))[data-${word}="true"])`),
        );
    }
    rule.selector = selector.toString();
  });
  return root.toString();
}
