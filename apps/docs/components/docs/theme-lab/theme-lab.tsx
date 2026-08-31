"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  ClipboardIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PipetteIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";
import { converter, wcagContrast, type Lch } from "culori";
import { useMemo, useState, type ChangeEvent, type CSSProperties } from "react";

import { Button } from "@lenso/ui/button";
import { Menu } from "@lenso/ui/menu";
import { SegmentedControl } from "@lenso/ui/segmented-control";
import { Slider } from "@lenso/ui/slider";
import { Switch } from "@lenso/ui/switch";
import { TextField } from "@lenso/ui/text-field";
import { ThemeScope } from "@lenso/ui/theme-scope";

import {
  defaultThemeRecipes,
  generateTheme,
  serializeThemeCss,
  serializeThemeRecipe,
  themeTokenPaths,
  type ColorAdjustment,
  type DerivedThemeInput,
  type GeneratedTheme,
  type ThemeMode,
  type ThemeRecipe,
  type ThemeTokenPath,
} from "./color-model";
import styles from "./theme-lab.module.css";

const colorPattern = /^#[0-9a-f]{6}$/i;
const emptyAdjustment: ColorAdjustment = { chroma: 0, hue: 0, lightness: 0 };
const toLch = converter("lch");

const tokenLabels: Record<ThemeTokenPath, string> = {
  "color.action.primary": "Primary action",
  "color.action.primaryContent": "Action content",
  "color.action.primaryHover": "Primary hover",
  "color.border.control": "Control border",
  "color.border.dialog": "Dialog border",
  "color.border.popover": "Popover border",
  "color.content.primary": "Primary content",
  "color.content.secondary": "Secondary content",
  "color.content.tertiary": "Tertiary content",
  "color.focus.ring": "Focus ring",
  "color.surface.canvas": "Canvas",
  "color.surface.control": "Control",
  "color.surface.dialog": "Dialog",
  "color.surface.elevated": "Elevated",
  "color.surface.interactiveHover": "Interactive hover",
  "color.surface.overlayHover": "Overlay hover",
  "color.surface.panel": "Panel",
  "color.surface.popover": "Menu / popover",
  "color.surface.selected": "Selected",
  "color.surface.surface": "Surface",
  "color.switch.trackOn": "Switch on",
  "color.switch.trackOnHover": "Switch on hover",
};

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const normalizedValue = colorPattern.test(value) ? value.toLowerCase() : "#000000";
  const lch = toLch(normalizedValue) as Lch;
  const contentColor =
    wcagContrast(normalizedValue, "#ffffff") >= wcagContrast(normalizedValue, "#111214")
      ? "#ffffff"
      : "#111214";
  const fieldStyle = {
    "--theme-color-field-content": contentColor,
    "--theme-color-field-fill": normalizedValue,
  } as CSSProperties;
  const formattedValue = `LCH(${lch.l.toFixed(2)}% ${lch.c.toFixed(2)} ${(lch.h ?? 0).toFixed(1)})`;

  return (
    <label className={styles.colorField}>
      <span>{label}</span>
      <span className={styles.colorControl} style={fieldStyle}>
        <PipetteIcon aria-hidden="true" size={13} strokeWidth={2.2} />
        <span className={styles.colorValue}>{formattedValue}</span>
        <ChevronsUpDownIcon aria-hidden="true" size={13} strokeWidth={2} />
        <input
          aria-label={`${label} picker`}
          className={styles.colorPicker}
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={normalizedValue}
        />
      </span>
    </label>
  );
}

function RangeField({
  label,
  maximum,
  minimum,
  onChange,
  step = 1,
  value,
}: {
  label: string;
  maximum: number;
  minimum: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  return (
    <div className={styles.rangeField}>
      <span className={styles.rangeLabel}>
        <span>{label}</span>
        <output>{value}</output>
      </span>
      <Slider.Root
        max={maximum}
        min={minimum}
        onValueChange={(nextValue) =>
          onChange(Array.isArray(nextValue) ? (nextValue[0] ?? value) : nextValue)
        }
        step={step}
        value={value}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label={label} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}

function DerivedField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: DerivedThemeInput) => void;
  value: DerivedThemeInput;
}) {
  const update = (key: keyof DerivedThemeInput) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [key]: Number(event.target.value) });
  };

  return (
    <div className={styles.derivedField}>
      <span>{label}</span>
      <label>
        <span>L</span>
        <input
          aria-label={`${label} lightness offset`}
          max={12}
          min={-12}
          onChange={update("lightness")}
          step={0.5}
          type="number"
          value={value.lightness}
        />
      </label>
      <label>
        <span>C</span>
        <input
          aria-label={`${label} chroma offset`}
          max={12}
          min={-12}
          onChange={update("chroma")}
          step={0.5}
          type="number"
          value={value.chroma}
        />
      </label>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  return (
    <SegmentedControl.Root
      aria-label="Theme mode"
      onValueChange={(value) => onChange(value as ThemeMode)}
      value={mode}
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
  );
}

function ContrastBadge({ label, value }: { label: string; value: number }) {
  const passes = value >= 4.5;
  return (
    <div className={styles.contrastBadge} data-passes={passes ? "" : undefined}>
      <span>{label}</span>
      <strong>{value.toFixed(2)}:1</strong>
      <span>{passes ? "AA" : "Check"}</span>
    </div>
  );
}

function PreviewWorkspace({ generated, mode }: { generated: GeneratedTheme; mode: ThemeMode }) {
  return (
    <ThemeScope className={styles.previewTheme} overrides={generated.tokens} theme={mode}>
      <div className={styles.previewApp}>
        <aside className={styles.previewSidebar}>
          <div className={styles.previewWorkspaceName}>
            <span className={styles.previewMark}>L</span>
            Lenso
            <ChevronDownIcon aria-hidden="true" size={12} />
          </div>
          <nav aria-label="Theme preview navigation">
            <button type="button">
              <SearchIcon aria-hidden="true" size={13} /> Search
              <kbd>⌘ K</kbd>
            </button>
            <button type="button">
              <CircleIcon aria-hidden="true" size={12} /> Inbox
              <span>4</span>
            </button>
            <button className={styles.previewSelectedNav} type="button">
              <CircleIcon aria-hidden="true" size={12} /> Agent tasks
            </button>
          </nav>
          <div className={styles.previewSidebarLabel}>Workspace</div>
          <nav aria-label="Theme preview workspace">
            <button type="button">Active</button>
            <button type="button">Backlog</button>
            <button type="button">Projects</button>
          </nav>
        </aside>

        <main className={styles.previewMain}>
          <header className={styles.previewHeader}>
            <div>
              <span>Workspace</span>
              <strong>Agent tasks</strong>
            </div>
            <div className={styles.previewHeaderActions}>
              <Menu.Root>
                <Menu.ControlTrigger>View</Menu.ControlTrigger>
                <Menu.Portal>
                  <Menu.Positioner align="end">
                    <Menu.Popup>
                      <Menu.Item>List</Menu.Item>
                      <Menu.Item>Board</Menu.Item>
                      <Menu.Separator />
                      <Menu.Item>Configure view…</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
              <Button size="compact">
                <PlusIcon aria-hidden="true" size={13} /> New issue
              </Button>
            </div>
          </header>

          <div className={styles.previewToolbar}>
            <TextField.Root className={styles.previewSearch} size="compact">
              <TextField.Control aria-label="Filter preview issues" placeholder="Filter issues…" />
            </TextField.Root>
            <Button size="compact" variant="secondary">
              All statuses
            </Button>
          </div>

          <section className={styles.previewList} aria-label="Preview issue list">
            <div className={styles.previewGroupHeader}>
              <span>In progress</span>
              <span>3</span>
            </div>
            {[
              ["LNS-142", "Refine theme generation", "Design system"],
              ["LNS-138", "Audit overlay hierarchy", "Interface"],
              ["LNS-127", "Sync semantic tokens", "Foundations"],
            ].map(([identifier, title, label], index) => (
              <article
                className={index === 0 ? styles.previewSelectedRow : styles.previewRow}
                key={identifier}
              >
                <CircleIcon aria-hidden="true" size={13} />
                <span>{identifier}</span>
                <strong>{title}</strong>
                <small>{label}</small>
                <MoreHorizontalIcon aria-hidden="true" size={14} />
              </article>
            ))}
          </section>
        </main>

        <aside className={styles.previewInspector}>
          <div className={styles.previewInspectorHeader}>
            <span>Properties</span>
            <MoreHorizontalIcon aria-hidden="true" size={14} />
          </div>
          <div className={styles.previewInspectorBody}>
            <p>Selected issue</p>
            <h3>Refine theme generation</h3>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>In progress</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>High</dd>
              </div>
              <div>
                <dt>Live updates</dt>
                <dd className={styles.previewSwitchValue}>
                  <Switch.Root aria-label="Live preview updates" defaultChecked size="compact">
                    <Switch.Thumb />
                  </Switch.Root>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </ThemeScope>
  );
}

function TokenInspector({
  generated,
  onAdjustmentChange,
  recipe,
  selected,
  setSelected,
}: {
  generated: GeneratedTheme;
  onAdjustmentChange: (adjustment: ColorAdjustment | null) => void;
  recipe: ThemeRecipe;
  selected: ThemeTokenPath;
  setSelected: (path: ThemeTokenPath) => void;
}) {
  const adjustment = recipe.adjustments[selected] ?? emptyAdjustment;
  const update = (key: keyof ColorAdjustment) => (event: ChangeEvent<HTMLInputElement>) => {
    onAdjustmentChange({ ...adjustment, [key]: Number(event.target.value) });
  };

  return (
    <aside className={styles.inspector} aria-label="Generated token inspector">
      <div className={styles.panelHeading}>
        <div>
          <span>Resolved output</span>
          <h2>Color tokens</h2>
        </div>
        <span>{themeTokenPaths.length}</span>
      </div>

      <div className={styles.tokenList}>
        {themeTokenPaths.map((path) => (
          <button
            aria-pressed={selected === path}
            className={styles.tokenRow}
            key={path}
            onClick={() => setSelected(path)}
            type="button"
          >
            <span className={styles.tokenSwatch} style={{ background: generated.tokens[path] }} />
            <span>
              <strong>{tokenLabels[path]}</strong>
              <small>{path}</small>
            </span>
            <code>{generated.tokens[path]}</code>
          </button>
        ))}
      </div>

      <div className={styles.adjustmentPanel}>
        <div className={styles.adjustmentHeading}>
          <span>Token adjustment</span>
          <button
            disabled={!recipe.adjustments[selected]}
            onClick={() => onAdjustmentChange(null)}
            type="button"
          >
            Reset
          </button>
        </div>
        <strong>{tokenLabels[selected]}</strong>
        <div className={styles.adjustmentGrid}>
          <label>
            <span>L</span>
            <input
              aria-label="Token lightness offset"
              max={30}
              min={-30}
              onChange={update("lightness")}
              step={0.5}
              type="number"
              value={adjustment.lightness}
            />
          </label>
          <label>
            <span>C</span>
            <input
              aria-label="Token chroma offset"
              max={30}
              min={-30}
              onChange={update("chroma")}
              step={0.5}
              type="number"
              value={adjustment.chroma}
            />
          </label>
          <label>
            <span>H</span>
            <input
              aria-label="Token hue offset"
              max={180}
              min={-180}
              onChange={update("hue")}
              step={1}
              type="number"
              value={adjustment.hue}
            />
          </label>
        </div>
      </div>
    </aside>
  );
}

export function ThemeLab() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [recipes, setRecipes] = useState(defaultThemeRecipes);
  const [selectedToken, setSelectedToken] = useState<ThemeTokenPath>("color.surface.popover");
  const [copied, setCopied] = useState<"css" | "json" | null>(null);
  const recipe = recipes[mode];
  const generated = useMemo(() => generateTheme(recipe), [recipe]);

  const updateRecipe = (updater: (current: ThemeRecipe) => ThemeRecipe) => {
    setRecipes((current) => ({ ...current, [mode]: updater(current[mode]) }));
  };

  const copy = async (format: "css" | "json") => {
    const value =
      format === "json"
        ? serializeThemeRecipe(recipe, generated)
        : serializeThemeCss(recipe, generated);
    await navigator.clipboard.writeText(value);
    setCopied(format);
    window.setTimeout(() => setCopied(null), 1400);
  };

  const updateDerived = (key: keyof ThemeRecipe["derived"], value: DerivedThemeInput) => {
    updateRecipe((current) => ({
      ...current,
      derived: { ...current.derived, [key]: value },
    }));
  };

  const updateAdjustment = (adjustment: ColorAdjustment | null) => {
    updateRecipe((current) => {
      const adjustments = { ...current.adjustments };
      if (adjustment) adjustments[selectedToken] = adjustment;
      else delete adjustments[selectedToken];
      return { ...current, adjustments };
    });
  };

  return (
    <section className={styles.lab} aria-label="Theme Lab">
      <header className={styles.labHeader}>
        <div>
          <p>FOUNDATION TOOL · GENERATED THEMES</p>
          <h1>Theme Lab</h1>
          <span>Derive and inspect one coherent semantic palette in the live interface.</span>
        </div>
        <div className={styles.labActions}>
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            className={styles.headerButton}
            onClick={() => {
              setRecipes((current) => ({ ...current, [mode]: defaultThemeRecipes[mode] }));
              setSelectedToken("color.surface.popover");
            }}
            type="button"
          >
            <RotateCcwIcon aria-hidden="true" size={13} /> Reset
          </button>
          <button className={styles.headerButton} onClick={() => copy("json")} type="button">
            {copied === "json" ? (
              <CheckIcon aria-hidden="true" size={13} />
            ) : (
              <ClipboardIcon aria-hidden="true" size={13} />
            )}
            JSON
          </button>
          <button className={styles.headerButton} onClick={() => copy("css")} type="button">
            {copied === "css" ? (
              <CheckIcon aria-hidden="true" size={13} />
            ) : (
              <ClipboardIcon aria-hidden="true" size={13} />
            )}
            CSS
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.controls} aria-label="Theme recipe inputs">
          <div className={styles.panelHeading}>
            <div>
              <span>Recipe</span>
              <h2>Base inputs</h2>
            </div>
            <span>{mode}</span>
          </div>

          <div className={styles.controlSection}>
            <ColorField
              label="Base color"
              onChange={(base) => updateRecipe((current) => ({ ...current, base }))}
              value={recipe.base}
            />
            <ColorField
              label="Accent color"
              onChange={(accent) => updateRecipe((current) => ({ ...current, accent }))}
              value={recipe.accent}
            />
            <RangeField
              label="Contrast"
              maximum={100}
              minimum={0}
              onChange={(contrast) => updateRecipe((current) => ({ ...current, contrast }))}
              value={recipe.contrast}
            />
          </div>

          <div className={styles.controlSection}>
            <div className={styles.sectionLabel}>Derived themes</div>
            <DerivedField
              label="Elevated"
              onChange={(value) => updateDerived("elevated", value)}
              value={recipe.derived.elevated}
            />
            <DerivedField
              label="Menu"
              onChange={(value) => updateDerived("menu", value)}
              value={recipe.derived.menu}
            />
          </div>

          <div className={styles.controlSection}>
            <div className={styles.sectionLabel}>Rendered contrast</div>
            <div className={styles.contrastGrid}>
              <ContrastBadge label="Primary / canvas" value={generated.contrast.primaryOnCanvas} />
              <ContrastBadge
                label="Secondary / canvas"
                value={generated.contrast.secondaryOnCanvas}
              />
              <ContrastBadge
                label="Tertiary / canvas"
                value={generated.contrast.tertiaryOnCanvas}
              />
              <ContrastBadge label="Action content" value={generated.contrast.accentContent} />
            </div>
          </div>
        </aside>

        <div className={styles.workArea}>
          <div className={styles.previewHeading}>
            <div>
              <span>Work</span>
              <h2>Live product preview</h2>
            </div>
            <code>{recipe.base}</code>
          </div>
          <PreviewWorkspace generated={generated} mode={mode} />
        </div>

        <TokenInspector
          generated={generated}
          onAdjustmentChange={updateAdjustment}
          recipe={recipe}
          selected={selectedToken}
          setSelected={setSelectedToken}
        />
      </div>
    </section>
  );
}
