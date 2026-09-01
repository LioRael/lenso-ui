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
import * as stylex from "@stylexjs/stylex";
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
import { styles } from "./theme-lab.stylex";

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
    backgroundColor: normalizedValue,
    color: contentColor,
  } as CSSProperties;
  const formattedValue = `LCH(${lch.l.toFixed(2)}% ${lch.c.toFixed(2)} ${(lch.h ?? 0).toFixed(1)})`;

  return (
    <label {...stylex.props(styles.fieldText, styles.colorField)}>
      <span>{label}</span>
      <span {...stylex.props(styles.colorControl)} style={fieldStyle}>
        <PipetteIcon
          aria-hidden="true"
          size={13}
          strokeWidth={2.2}
          {...stylex.props(styles.colorControlIcon)}
        />
        <span {...stylex.props(styles.colorValue)}>{formattedValue}</span>
        <ChevronsUpDownIcon
          aria-hidden="true"
          size={13}
          strokeWidth={2}
          {...stylex.props(styles.colorControlIcon, styles.colorControlTrailingIcon)}
        />
        <input
          aria-label={`${label} picker`}
          {...stylex.props(styles.colorPicker)}
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
    <div {...stylex.props(styles.fieldText, styles.rangeField)}>
      <span {...stylex.props(styles.rangeLabel)}>
        <span>{label}</span>
        <output {...stylex.props(styles.rangeOutput)}>{value}</output>
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
    <div {...stylex.props(styles.derivedField)}>
      <span>{label}</span>
      <label {...stylex.props(styles.numericLabel)}>
        <span {...stylex.props(styles.numericLabelCode)}>L</span>
        <input
          aria-label={`${label} lightness offset`}
          max={12}
          min={-12}
          onChange={update("lightness")}
          step={0.5}
          type="number"
          value={value.lightness}
          {...stylex.props(styles.numericInput)}
        />
      </label>
      <label {...stylex.props(styles.numericLabel)}>
        <span {...stylex.props(styles.numericLabelCode)}>C</span>
        <input
          aria-label={`${label} chroma offset`}
          max={12}
          min={-12}
          onChange={update("chroma")}
          step={0.5}
          type="number"
          value={value.chroma}
          {...stylex.props(styles.numericInput)}
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
    <div {...stylex.props(styles.contrastBadge)} data-passes={passes ? "" : undefined}>
      <span>{label}</span>
      <strong {...stylex.props(styles.contrastValue)}>{value.toFixed(2)}:1</strong>
      <span {...stylex.props(styles.contrastStatus, passes && styles.contrastPass)}>
        {passes ? "AA" : "Check"}
      </span>
    </div>
  );
}

function PreviewWorkspace({ generated, mode }: { generated: GeneratedTheme; mode: ThemeMode }) {
  return (
    <ThemeScope
      className={stylex.props(styles.previewTheme).className}
      overrides={generated.tokens}
      theme={mode}
    >
      <div {...stylex.props(styles.previewApp)}>
        <aside {...stylex.props(styles.previewSidebar)}>
          <div {...stylex.props(styles.previewWorkspaceName)}>
            <span {...stylex.props(styles.previewMark)}>L</span>
            Lenso
            <ChevronDownIcon
              aria-hidden="true"
              size={12}
              {...stylex.props(styles.previewWorkspaceIcon)}
            />
          </div>
          <nav aria-label="Theme preview navigation" {...stylex.props(styles.previewNav)}>
            <button type="button" {...stylex.props(styles.previewNavButton)}>
              <SearchIcon aria-hidden="true" size={13} /> Search
              <kbd {...stylex.props(styles.previewNavTrailing)}>⌘ K</kbd>
            </button>
            <button type="button" {...stylex.props(styles.previewNavButton)}>
              <CircleIcon aria-hidden="true" size={12} /> Inbox
              <span {...stylex.props(styles.previewNavTrailing)}>4</span>
            </button>
            <button
              type="button"
              {...stylex.props(styles.previewNavButton, styles.previewSelectedNav)}
            >
              <CircleIcon aria-hidden="true" size={12} /> Agent tasks
            </button>
          </nav>
          <div {...stylex.props(styles.previewSidebarLabel)}>Workspace</div>
          <nav aria-label="Theme preview workspace" {...stylex.props(styles.previewNav)}>
            <button type="button" {...stylex.props(styles.previewNavButton)}>
              Active
            </button>
            <button type="button" {...stylex.props(styles.previewNavButton)}>
              Backlog
            </button>
            <button type="button" {...stylex.props(styles.previewNavButton)}>
              Projects
            </button>
          </nav>
        </aside>

        <main {...stylex.props(styles.previewMain)}>
          <header {...stylex.props(styles.previewHeader)}>
            <div {...stylex.props(styles.previewHeaderLead)}>
              <span {...stylex.props(styles.previewHeaderMeta)}>Workspace</span>
              <strong {...stylex.props(styles.previewHeaderTitle)}>Agent tasks</strong>
            </div>
            <div {...stylex.props(styles.previewHeaderActions)}>
              <Menu.Root>
                <Menu.ControlTrigger
                  className={stylex.props(styles.previewHeaderButton).className}
                >
                  View
                </Menu.ControlTrigger>
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
              <Button
                className={stylex.props(styles.previewHeaderButton).className}
                size="compact"
              >
                <PlusIcon aria-hidden="true" size={13} /> New issue
              </Button>
            </div>
          </header>

          <div {...stylex.props(styles.previewToolbar)}>
            <TextField.Root
              className={stylex.props(styles.previewSearch).className}
              size="compact"
            >
              <TextField.Control aria-label="Filter preview issues" placeholder="Filter issues…" />
            </TextField.Root>
            <Button size="compact" variant="secondary">
              All statuses
            </Button>
          </div>

          <section aria-label="Preview issue list" {...stylex.props(styles.previewList)}>
            <div {...stylex.props(styles.previewGroupHeader)}>
              <span>In progress</span>
              <span>3</span>
            </div>
            {[
              ["LNS-142", "Refine theme generation", "Design system"],
              ["LNS-138", "Audit overlay hierarchy", "Interface"],
              ["LNS-127", "Sync semantic tokens", "Foundations"],
            ].map(([identifier, title, label], index) => (
              <article
                className={stylex.props(
                  styles.previewRow,
                  index > 0 && styles.previewRowBorder,
                  index === 0 && styles.previewSelectedRow,
                ).className}
                key={identifier}
              >
                <CircleIcon aria-hidden="true" size={13} />
                <span {...stylex.props(styles.previewRowMeta)}>{identifier}</span>
                <strong {...stylex.props(styles.previewRowTitle)}>{title}</strong>
                <small {...stylex.props(styles.previewRowPill)}>{label}</small>
                <MoreHorizontalIcon aria-hidden="true" size={14} />
              </article>
            ))}
          </section>
        </main>

        <aside {...stylex.props(styles.previewInspector)}>
          <div {...stylex.props(styles.previewInspectorHeader)}>
            <span>Properties</span>
            <MoreHorizontalIcon aria-hidden="true" size={14} />
          </div>
          <div {...stylex.props(styles.previewInspectorBody)}>
            <p {...stylex.props(styles.previewInspectorEyebrow)}>Selected issue</p>
            <h3 {...stylex.props(styles.previewInspectorTitle)}>Refine theme generation</h3>
            <dl {...stylex.props(styles.previewInspectorList)}>
              <div {...stylex.props(styles.previewInspectorListRow)}>
                <dt {...stylex.props(styles.previewInspectorTerm)}>Status</dt>
                <dd {...stylex.props(styles.previewInspectorDefinition)}>In progress</dd>
              </div>
              <div {...stylex.props(styles.previewInspectorListRow)}>
                <dt {...stylex.props(styles.previewInspectorTerm)}>Priority</dt>
                <dd {...stylex.props(styles.previewInspectorDefinition)}>High</dd>
              </div>
              <div {...stylex.props(styles.previewInspectorListRow)}>
                <dt {...stylex.props(styles.previewInspectorTerm)}>Live updates</dt>
                <dd {...stylex.props(styles.previewInspectorDefinition, styles.previewSwitchValue)}>
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
    <aside aria-label="Generated token inspector" {...stylex.props(styles.inspector)}>
      <div {...stylex.props(styles.panelHeading)}>
        <div {...stylex.props(styles.headingCopy)}>
          <span {...stylex.props(styles.sectionLabel)}>Resolved output</span>
          <h2 {...stylex.props(styles.headingTitle)}>Color tokens</h2>
        </div>
        <span {...stylex.props(styles.panelCount)}>{themeTokenPaths.length}</span>
      </div>

      <div {...stylex.props(styles.tokenList)}>
        {themeTokenPaths.map((path) => (
          <button
            aria-pressed={selected === path}
            className={stylex.props(
              styles.tokenRow,
              selected === path && styles.selectedTokenRow,
            ).className}
            key={path}
            onClick={() => setSelected(path)}
            type="button"
          >
            <span
              {...stylex.props(styles.tokenSwatch)}
              style={{ background: generated.tokens[path] }}
            />
            <span {...stylex.props(styles.tokenCopy)}>
              <strong {...stylex.props(styles.tokenName)}>{tokenLabels[path]}</strong>
              <small {...stylex.props(styles.tokenPath)}>{path}</small>
            </span>
            <code {...stylex.props(styles.tokenCode)}>{generated.tokens[path]}</code>
          </button>
        ))}
      </div>

      <div {...stylex.props(styles.adjustmentPanel)}>
        <div {...stylex.props(styles.adjustmentHeading)}>
          <span>Token adjustment</span>
          <button
            disabled={!recipe.adjustments[selected]}
            onClick={() => onAdjustmentChange(null)}
            type="button"
            {...stylex.props(styles.adjustmentButton)}
          >
            Reset
          </button>
        </div>
        <strong {...stylex.props(styles.adjustmentName)}>{tokenLabels[selected]}</strong>
        <div {...stylex.props(styles.adjustmentGrid)}>
          <label {...stylex.props(styles.numericLabel)}>
            <span {...stylex.props(styles.numericLabelCode)}>L</span>
            <input
              aria-label="Token lightness offset"
              max={30}
              min={-30}
              onChange={update("lightness")}
              step={0.5}
              type="number"
              value={adjustment.lightness}
              {...stylex.props(styles.numericInput)}
            />
          </label>
          <label {...stylex.props(styles.numericLabel)}>
            <span {...stylex.props(styles.numericLabelCode)}>C</span>
            <input
              aria-label="Token chroma offset"
              max={30}
              min={-30}
              onChange={update("chroma")}
              step={0.5}
              type="number"
              value={adjustment.chroma}
              {...stylex.props(styles.numericInput)}
            />
          </label>
          <label {...stylex.props(styles.numericLabel)}>
            <span {...stylex.props(styles.numericLabelCode)}>H</span>
            <input
              aria-label="Token hue offset"
              max={180}
              min={-180}
              onChange={update("hue")}
              step={1}
              type="number"
              value={adjustment.hue}
              {...stylex.props(styles.numericInput)}
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
    <section aria-label="Theme Lab" {...stylex.props(styles.lab)}>
      <header {...stylex.props(styles.labHeader)}>
        <div {...stylex.props(styles.labHeaderCopy)}>
          <p {...stylex.props(styles.labEyebrow)}>FOUNDATION TOOL · GENERATED THEMES</p>
          <h1 {...stylex.props(styles.labTitle)}>Theme Lab</h1>
          <span {...stylex.props(styles.labDescription)}>
            Derive and inspect one coherent semantic palette in the live interface.
          </span>
        </div>
        <div {...stylex.props(styles.labActions)}>
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            {...stylex.props(styles.headerButton)}
            onClick={() => {
              setRecipes((current) => ({ ...current, [mode]: defaultThemeRecipes[mode] }));
              setSelectedToken("color.surface.popover");
            }}
            type="button"
          >
            <RotateCcwIcon aria-hidden="true" size={13} /> Reset
          </button>
          <button onClick={() => copy("json")} type="button" {...stylex.props(styles.headerButton)}>
            {copied === "json" ? (
              <CheckIcon aria-hidden="true" size={13} />
            ) : (
              <ClipboardIcon aria-hidden="true" size={13} />
            )}
            JSON
          </button>
          <button onClick={() => copy("css")} type="button" {...stylex.props(styles.headerButton)}>
            {copied === "css" ? (
              <CheckIcon aria-hidden="true" size={13} />
            ) : (
              <ClipboardIcon aria-hidden="true" size={13} />
            )}
            CSS
          </button>
        </div>
      </header>

      <div {...stylex.props(styles.workspace)}>
        <aside aria-label="Theme recipe inputs" {...stylex.props(styles.controls)}>
          <div {...stylex.props(styles.panelHeading)}>
            <div {...stylex.props(styles.headingCopy)}>
              <span {...stylex.props(styles.sectionLabel)}>Recipe</span>
              <h2 {...stylex.props(styles.headingTitle)}>Base inputs</h2>
            </div>
            <span {...stylex.props(styles.panelCount)}>{mode}</span>
          </div>

          <div {...stylex.props(styles.controlSection)}>
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

          <div {...stylex.props(styles.controlSection)}>
            <div {...stylex.props(styles.sectionLabel)}>Derived themes</div>
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

          <div {...stylex.props(styles.controlSection)}>
            <div {...stylex.props(styles.sectionLabel)}>Rendered contrast</div>
            <div {...stylex.props(styles.contrastGrid)}>
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

        <div {...stylex.props(styles.workArea)}>
          <div {...stylex.props(styles.previewHeading)}>
            <div {...stylex.props(styles.headingCopy)}>
              <span {...stylex.props(styles.sectionLabel)}>Work</span>
              <h2 {...stylex.props(styles.headingTitle)}>Live product preview</h2>
            </div>
            <code {...stylex.props(styles.previewHeadingCode)}>{recipe.base}</code>
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
