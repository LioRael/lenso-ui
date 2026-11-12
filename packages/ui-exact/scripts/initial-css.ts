import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

export interface PresentationCase {
  kind: string;
  selector: string;
  classes: string[];
}

interface SelectorBranch {
  terminal: boolean;
  children: Map<string, SelectorBranch>;
}

/** Factor identical compound-selector tails without creating new combinations. */
export function compactSelectors(selectors: string[]) {
  const root: SelectorBranch = { terminal: false, children: new Map() };
  const complex: string[] = [];
  for (const selector of selectors) {
    const parsed = selectorParser().astSync(selector);
    const compound = parsed.first;
    if (
      parsed.nodes.length !== 1 ||
      !compound ||
      compound.nodes.some((node) => node.type === "combinator")
    ) {
      complex.push(selector);
      continue;
    }
    let branch = root;
    for (const node of compound.nodes) {
      const token = node.toString();
      let child = branch.children.get(token);
      if (!child) {
        child = { terminal: false, children: new Map() };
        branch.children.set(token, child);
      }
      branch = child;
    }
    branch.terminal = true;
  }
  const alternatives = (values: string[]) =>
    values.length === 1 ? values[0]! : `:is(${values.join(",")})`;
  const render = (branch: SelectorBranch): string => {
    if (branch.terminal) return "";
    const tails = new Map<string, string[]>();
    for (const [token, child] of branch.children) {
      const suffix = render(child);
      const prefixes = tails.get(suffix) ?? [];
      prefixes.push(token);
      tails.set(suffix, prefixes);
    }
    return alternatives(
      [...tails].map(([suffix, prefixes]) => `${alternatives(prefixes)}${suffix}`),
    );
  };
  const factored = root.children.size ? [render(root)] : [];
  return [...factored, ...complex].join(",");
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
  const definitions = new Set<string>();
  root.walkRules((rule) => {
    selectorParser()
      .astSync(rule.selector)
      .walkClasses((node) => {
        definitions.add(node.value);
      });
  });
  for (const name of aliases.keys())
    if (!definitions.has(name)) throw new Error(`Missing compiled StyleX CSS for ${name}`);
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
    ["data-active", "lenso-active"],
    ["data-attached", "lenso-attached"],
    ["data-pending", "lenso-loading"],
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
        alias = compound(`:is(${node.toString()},:where(${compactSelectors([...selectors])}))`);
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
      // Exact owns data-pressed as transient pointer feedback. Toggle selection
      // is already authored as aria-pressed and must survive pointer release.
      if (node.attribute === "data-pressed" && !node.operator) {
        node.replaceWith(
          compound(
            ':is([data-pressed]:not(:where([data-slot="toggle-button"],[data-slot="glass-toggle-button"])),:where([data-slot="toggle-button"],[data-slot="glass-toggle-button"])[aria-pressed="true"])',
          ),
        );
        continue;
      }
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
