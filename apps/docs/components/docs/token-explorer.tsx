"use client";

import {
  BoxIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  CopyIcon,
  FolderIcon,
  Layers3Icon,
  PaletteIcon,
  SearchIcon,
  TypeIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType, type CSSProperties } from "react";

import tokenContract from "../../../../packages/tokens/src/contract.json";

import styles from "./token-explorer.module.css";

type ThemeMode = "dark" | "light";
type TokenKind = "primitive" | "semantic";

interface ContractToken {
  cssName: string;
  cssValue: string;
  path: string;
  type: string;
}

interface TokenItem extends ContractToken {
  kind: TokenKind;
  treeParts: string[];
}

interface TreeNode {
  children: TreeNode[];
  key: string;
  label: string;
  token?: TokenItem;
}

interface TokenContract {
  contexts: Record<ThemeMode, Record<string, ContractToken>>;
  primitivePaths: string[];
  primitives: Record<string, ContractToken>;
  semanticPaths: string[];
}

const contract = tokenContract as unknown as TokenContract;

const rootLabels: Record<TokenKind, string> = {
  primitive: "Primitive tokens",
  semantic: "Semantic tokens",
};

const rootIcons: Record<TokenKind, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  primitive: Layers3Icon,
  semantic: CircleDashedIcon,
};

const groupIcons: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  color: PaletteIcon,
  elevation: Layers3Icon,
  font: TypeIcon,
  opacity: CircleDashedIcon,
  radius: BoxIcon,
  size: BoxIcon,
  space: BoxIcon,
};

function toTitle(label: string): string {
  return label
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function makeTokens(kind: TokenKind): TokenItem[] {
  if (kind === "primitive") {
    return contract.primitivePaths.map((path) => ({
      ...contract.primitives[path]!,
      kind,
      treeParts: path.split(".").slice(1),
    }));
  }

  return contract.semanticPaths.map((path) => ({
    ...contract.contexts.light[path]!,
    kind,
    treeParts: path.split("."),
  }));
}

const allTokens = [...makeTokens("semantic"), ...makeTokens("primitive")];

function buildTree(kind: TokenKind, tokens: TokenItem[]): TreeNode {
  const root: TreeNode = { children: [], key: kind, label: rootLabels[kind] };

  for (const token of tokens) {
    let current = root;
    token.treeParts.forEach((part, index) => {
      const key = `${kind}.${token.treeParts.slice(0, index + 1).join(".")}`;
      let child = current.children.find((candidate) => candidate.key === key);
      if (!child) {
        child = { children: [], key, label: part };
        current.children.push(child);
      }
      current = child;
    });
    current.token = token;
  }

  return root;
}

function leafCount(node: TreeNode): number {
  if (node.token) return 1;
  return node.children.reduce((total, child) => total + leafCount(child), 0);
}

function tokenValue(token: TokenItem, mode: ThemeMode): ContractToken {
  if (token.kind === "primitive") return contract.primitives[token.path]!;
  return contract.contexts[mode][token.path]!;
}

function TokenSwatch({ value }: { value: string }) {
  return <span className={styles.swatch} style={{ backgroundColor: value }} />;
}

function TreeBranch({
  depth,
  expanded,
  mode,
  node,
  onSelect,
  onToggle,
  selectedPath,
}: {
  depth: number;
  expanded: Set<string>;
  mode: ThemeMode;
  node: TreeNode;
  onSelect: (token: TokenItem) => void;
  onToggle: (key: string) => void;
  selectedPath: string;
}) {
  const isLeaf = Boolean(node.token);
  const isOpen = expanded.has(node.key);
  const selected = node.token?.path === selectedPath;
  const Icon =
    depth === 0
      ? rootIcons[node.key as TokenKind]
      : depth === 1
        ? (groupIcons[node.label] ?? FolderIcon)
        : FolderIcon;

  return (
    <li className={styles.treeItem} role="treeitem" aria-expanded={isLeaf ? undefined : isOpen}>
      <button
        className={[styles.treeRow, selected ? styles.selected : ""].filter(Boolean).join(" ")}
        onClick={() => (node.token ? onSelect(node.token) : onToggle(node.key))}
        style={{ "--tree-depth": depth } as CSSProperties}
        type="button"
      >
        <span className={styles.chevron}>
          {isLeaf ? null : isOpen ? (
            <ChevronDownIcon size={13} strokeWidth={1.75} />
          ) : (
            <ChevronRightIcon size={13} strokeWidth={1.75} />
          )}
        </span>
        {isLeaf && node.token?.type === "color" ? (
          <TokenSwatch value={tokenValue(node.token, mode).cssValue} />
        ) : (
          <Icon size={13} strokeWidth={1.6} />
        )}
        <span className={isLeaf ? styles.tokenLabel : styles.groupLabel}>
          {toTitle(node.label)}
        </span>
        {!isLeaf && <span className={styles.count}>{leafCount(node)}</span>}
        {isLeaf && (
          <span className={styles.inlineValue}>{tokenValue(node.token!, mode).cssValue}</span>
        )}
      </button>
      {!isLeaf && isOpen && (
        <ul className={styles.treeGroup}>
          {node.children.map((child) => (
            <TreeBranch
              depth={depth + 1}
              expanded={expanded}
              key={child.key}
              mode={mode}
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TokenPreview({ token, value }: { token: TokenItem; value: ContractToken }) {
  if (token.type === "color") {
    return (
      <div className={styles.previewCanvas}>
        <div className={styles.colorPreview} style={{ backgroundColor: value.cssValue }} />
      </div>
    );
  }

  if (token.type === "fontFamily") {
    return (
      <div className={styles.previewCanvas}>
        <span className={styles.typePreview} style={{ fontFamily: value.cssValue }}>
          Ag
        </span>
      </div>
    );
  }

  if (token.type === "number") {
    return (
      <div className={styles.previewCanvas}>
        <div className={styles.opacityPreview} style={{ opacity: Number(value.cssValue) }} />
      </div>
    );
  }

  if (token.path.startsWith("radius.")) {
    return (
      <div className={styles.previewCanvas}>
        <div className={styles.radiusPreview} style={{ borderRadius: value.cssValue }} />
      </div>
    );
  }

  return (
    <div className={styles.previewCanvas}>
      <div className={styles.measurePreview}>
        <span style={{ width: `min(160px, calc(${value.cssValue} * 4))` }} />
        <code>{value.cssValue}</code>
      </div>
    </div>
  );
}

function CopyValue({ children, value }: { children: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button className={styles.copyValue} onClick={copy} title={`Copy ${children}`} type="button">
      <code>{value}</code>
      {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
    </button>
  );
}

function TokenDetails({
  mode,
  onModeChange,
  token,
}: {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  token: TokenItem;
}) {
  const value = tokenValue(token, mode);
  const pathParts = token.path.split(".");

  return (
    <aside className={styles.details} aria-label="Token details">
      <div className={styles.detailsHeading}>
        <p>{token.kind === "semantic" ? "Semantic token" : "Primitive token"}</p>
        <h2>{toTitle(pathParts.at(-1) ?? token.path)}</h2>
        <div className={styles.pathCrumbs}>
          {pathParts.slice(0, -1).map((part) => (
            <span key={part}>{part}</span>
          ))}
        </div>
      </div>

      <TokenPreview token={token} value={value} />

      <div className={styles.modeSection}>
        <span className={styles.fieldLabel}>MODE</span>
        <div className={styles.segmented}>
          {(["light", "dark"] as const).map((nextMode) => (
            <button
              aria-pressed={mode === nextMode}
              className={mode === nextMode ? styles.segmentSelected : ""}
              key={nextMode}
              onClick={() => onModeChange(nextMode)}
              type="button"
            >
              {nextMode}
            </button>
          ))}
        </div>
      </div>

      <dl className={styles.detailsList}>
        <div>
          <dt>VALUE</dt>
          <dd>
            <CopyValue value={value.cssValue}>resolved value</CopyValue>
          </dd>
        </div>
        <div>
          <dt>CSS VARIABLE</dt>
          <dd>
            <CopyValue value={`var(${value.cssName})`}>CSS variable</CopyValue>
          </dd>
        </div>
        <div>
          <dt>TYPE</dt>
          <dd className={styles.plainValue}>{value.type}</dd>
        </div>
        <div>
          <dt>PATH</dt>
          <dd>
            <CopyValue value={token.path}>token path</CopyValue>
          </dd>
        </div>
      </dl>
    </aside>
  );
}

export function TokenExplorer() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [query, setQuery] = useState("");
  const [selectedPath, setSelectedPath] = useState("color.surface.canvas");
  const [expanded, setExpanded] = useState(
    () => new Set(["semantic", "semantic.color", "semantic.color.surface"]),
  );

  useEffect(() => {
    setMode(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTokens = useMemo(
    () =>
      normalizedQuery
        ? allTokens.filter(
            (token) =>
              token.path.toLowerCase().includes(normalizedQuery) ||
              token.cssName.toLowerCase().includes(normalizedQuery),
          )
        : allTokens,
    [normalizedQuery],
  );

  const trees = useMemo(
    () =>
      (["semantic", "primitive"] as const)
        .map((kind) =>
          buildTree(
            kind,
            filteredTokens.filter((token) => token.kind === kind),
          ),
        )
        .filter((tree) => tree.children.length > 0),
    [filteredTokens],
  );

  const visibleExpanded = useMemo(() => {
    if (!normalizedQuery) return expanded;
    const next = new Set<string>();
    for (const token of filteredTokens) {
      next.add(token.kind);
      token.treeParts.forEach((_, index) => {
        if (index < token.treeParts.length - 1) {
          next.add(`${token.kind}.${token.treeParts.slice(0, index + 1).join(".")}`);
        }
      });
    }
    return next;
  }, [expanded, filteredTokens, normalizedQuery]);

  const selectedToken = allTokens.find((token) => token.path === selectedPath) ?? allTokens[0]!;

  const toggle = (key: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section className={styles.explorer} aria-label="Token explorer">
      <div className={styles.browser}>
        <div className={styles.browserHeader}>
          <div>
            <h2>Token tree</h2>
            <span>
              {filteredTokens.length} of {allTokens.length}
            </span>
          </div>
          <label className={styles.search}>
            <SearchIcon aria-hidden="true" size={14} />
            <span className={styles.visuallyHidden}>Search tokens</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search path or CSS variable"
              type="search"
              value={query}
            />
            <kbd>⌘ K</kbd>
          </label>
        </div>

        <div className={styles.treeScroller}>
          {trees.length > 0 ? (
            <ul className={styles.tree} role="tree" aria-label="Design tokens">
              {trees.map((tree) => (
                <TreeBranch
                  depth={0}
                  expanded={visibleExpanded}
                  key={tree.key}
                  mode={mode}
                  node={tree}
                  onSelect={(token) => setSelectedPath(token.path)}
                  onToggle={toggle}
                  selectedPath={selectedPath}
                />
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <SearchIcon size={18} />
              <p>No tokens match “{query}”.</p>
              <button onClick={() => setQuery("")} type="button">
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      <TokenDetails mode={mode} onModeChange={setMode} token={selectedToken} />
    </section>
  );
}
