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
  MoonIcon,
  PaletteIcon,
  SearchIcon,
  SunIcon,
  TypeIcon,
} from "lucide-react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useState, type ComponentType, type CSSProperties } from "react";

import { SegmentedControl } from "@lenso/ui/segmented-control";

import tokenContract from "../../../../packages/tokens/src/contract.json";

import { styles } from "./token-explorer.stylex";

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
  return <span {...stylex.props(styles.swatch)} style={{ backgroundColor: value }} />;
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
    <li
      {...stylex.props(styles.treeItem)}
      role="treeitem"
      aria-expanded={isLeaf ? undefined : isOpen}
    >
      <button
        {...stylex.props(styles.treeRow, selected && styles.selectedRow)}
        onClick={() => (node.token ? onSelect(node.token) : onToggle(node.key))}
        style={{ "--tree-depth": depth } as CSSProperties}
        type="button"
      >
        <span {...stylex.props(styles.chevron)}>
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
        <span {...stylex.props(styles.treeLabel, isLeaf ? styles.tokenLabel : styles.groupLabel)}>
          {toTitle(node.label)}
        </span>
        {!isLeaf && <span {...stylex.props(styles.treeMetadata)}>{leafCount(node)}</span>}
        {isLeaf && (
          <span {...stylex.props(styles.treeMetadata, styles.inlineValue)}>
            {tokenValue(node.token!, mode).cssValue}
          </span>
        )}
      </button>
      {!isLeaf && isOpen && (
        <ul
          {...stylex.props(styles.treeGroup)}
          style={{ "--tree-parent-depth": depth } as CSSProperties}
        >
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
      <div {...stylex.props(styles.previewCanvas)}>
        <div {...stylex.props(styles.colorPreview)} style={{ backgroundColor: value.cssValue }} />
      </div>
    );
  }

  if (token.type === "fontFamily") {
    return (
      <div {...stylex.props(styles.previewCanvas)}>
        <span {...stylex.props(styles.typePreview)} style={{ fontFamily: value.cssValue }}>
          Ag
        </span>
      </div>
    );
  }

  if (token.type === "number") {
    return (
      <div {...stylex.props(styles.previewCanvas)}>
        <div {...stylex.props(styles.blockPreview)} style={{ opacity: Number(value.cssValue) }} />
      </div>
    );
  }

  if (token.path.startsWith("radius.")) {
    return (
      <div {...stylex.props(styles.previewCanvas)}>
        <div
          {...stylex.props(styles.blockPreview, styles.radiusPreview)}
          style={{ borderRadius: value.cssValue }}
        />
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.previewCanvas)}>
      <div {...stylex.props(styles.measurePreview)}>
        <span
          {...stylex.props(styles.measureBar)}
          style={{ width: `min(160px, calc(${value.cssValue} * 4))` }}
        />
        <code {...stylex.props(styles.measureCode)}>{value.cssValue}</code>
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
    <button
      {...stylex.props(styles.copyValue)}
      onClick={copy}
      title={`Copy ${children}`}
      type="button"
    >
      <code {...stylex.props(styles.copyCode)}>{value}</code>
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
    <aside {...stylex.props(styles.panel, styles.details)} aria-label="Token details">
      <div>
        <p {...stylex.props(styles.eyebrow)}>
          {token.kind === "semantic" ? "Semantic token" : "Primitive token"}
        </p>
        <h2 {...stylex.props(styles.detailsTitle)}>{toTitle(pathParts.at(-1) ?? token.path)}</h2>
        <div {...stylex.props(styles.pathCrumbs)}>
          {pathParts.slice(0, -1).map((part) => (
            <span {...stylex.props(styles.pathCrumb)} key={part}>
              {part}
            </span>
          ))}
        </div>
      </div>

      <TokenPreview token={token} value={value} />

      <div {...stylex.props(styles.modeSection)}>
        <span {...stylex.props(styles.fieldLabel)}>MODE</span>
        <div {...stylex.props(styles.modeControl)}>
          <SegmentedControl.Root
            aria-label="Token theme mode"
            onValueChange={(value) => onModeChange(value as ThemeMode)}
            value={mode}
            width="fill"
          >
            <SegmentedControl.Item value="light">
              <SunIcon aria-hidden="true" size={13} />
              Light
            </SegmentedControl.Item>
            <SegmentedControl.Item value="dark">
              <MoonIcon aria-hidden="true" size={13} />
              Dark
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>
      </div>

      <dl {...stylex.props(styles.detailsList)}>
        <div {...stylex.props(styles.detailsEntry)}>
          <dt {...stylex.props(styles.detailsTerm)}>VALUE</dt>
          <dd {...stylex.props(styles.detailsDefinition)}>
            <CopyValue value={value.cssValue}>resolved value</CopyValue>
          </dd>
        </div>
        <div {...stylex.props(styles.detailsEntry)}>
          <dt {...stylex.props(styles.detailsTerm)}>CSS VARIABLE</dt>
          <dd {...stylex.props(styles.detailsDefinition)}>
            <CopyValue value={`var(${value.cssName})`}>CSS variable</CopyValue>
          </dd>
        </div>
        <div {...stylex.props(styles.detailsEntry)}>
          <dt {...stylex.props(styles.detailsTerm)}>TYPE</dt>
          <dd {...stylex.props(styles.detailsDefinition, styles.plainValue)}>{value.type}</dd>
        </div>
        <div {...stylex.props(styles.detailsEntry)}>
          <dt {...stylex.props(styles.detailsTerm)}>PATH</dt>
          <dd {...stylex.props(styles.detailsDefinition)}>
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
    <section {...stylex.props(styles.explorer)} aria-label="Token explorer">
      <div {...stylex.props(styles.panel, styles.browser)}>
        <div {...stylex.props(styles.browserHeader)}>
          <div {...stylex.props(styles.browserTitleGroup)}>
            <h2 {...stylex.props(styles.browserTitle)}>Token tree</h2>
            <span {...stylex.props(styles.browserCount)}>
              {filteredTokens.length} of {allTokens.length}
            </span>
          </div>
          <label {...stylex.props(styles.search)}>
            <SearchIcon aria-hidden="true" size={14} />
            <span {...stylex.props(styles.visuallyHidden)}>Search tokens</span>
            <input
              {...stylex.props(styles.searchInput)}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search path or CSS variable"
              type="search"
              value={query}
            />
            <kbd {...stylex.props(styles.searchHint)}>⌘ K</kbd>
          </label>
        </div>

        <div {...stylex.props(styles.treeScroller)}>
          {trees.length > 0 ? (
            <ul {...stylex.props(styles.treeList)} role="tree" aria-label="Design tokens">
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
            <div {...stylex.props(styles.emptyState)}>
              <SearchIcon size={18} />
              <p {...stylex.props(styles.emptyMessage)}>No tokens match “{query}”.</p>
              <button
                {...stylex.props(styles.clearSearch)}
                onClick={() => setQuery("")}
                type="button"
              >
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
