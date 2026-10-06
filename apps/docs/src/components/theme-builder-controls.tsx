"use client";

// Adapted from HeroUI v3.2.6 Theme Builder controls, Apache-2.0.
import { useEffect, useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { converter, formatHsl } from "culori";
import {
  ChevronsExpandVertical,
  FontCase,
  Lock,
  LockOpen,
  BucketPaint,
  CircleInfo,
  Plus,
} from "@gravity-ui/icons";
import { Button, ColorSlider, Kbd, ListBox, ListBoxItem, Popover, Slider, Switch } from "@lenso/ui";
import { ThemeBuilderColorPicker } from "./theme-builder-color-picker";
import { ThemeBuilderCustomFont } from "./theme-builder-custom-font";
import { builder as s } from "@/styles/theme-builder.stylex";
import {
  findMatchingTheme,
  getBuilderFont,
  fonts,
  formRadiusOptions,
  radiusOptions,
  themes,
  type BuilderSettings,
  validateBuilderSettings,
} from "@/lib/theme-builder-model";

export type AppearanceKey = Exclude<keyof BuilderSettings, "vibrantPalette">;
export interface BuilderControlsProps {
  settings: BuilderSettings;
  update: (changes: Partial<BuilderSettings>) => void;
  locks: ReadonlySet<AppearanceKey>;
  toggleLock: (key: AppearanceKey) => void;
}

function ControlLabel({
  label,
  variable,
  locks,
  toggleLock,
}: { label: string; variable: AppearanceKey } & Pick<
  BuilderControlsProps,
  "locks" | "toggleLock"
>) {
  const locked = locks.has(variable);
  return (
    <div {...stylex.props(s.label)}>
      {label}
      {(variable === "hue" || variable === "base") && (
        <span
          title={
            variable === "hue"
              ? "Adjust the accent hue and color"
              : "Adjust the tint of neutral surfaces"
          }
        >
          <CircleInfo width={16} height={16} aria-hidden="true" />
        </span>
      )}
      <Button
        variant="ghost"
        aria-label={`${locked ? "Unlock" : "Lock"} ${label}`}
        aria-pressed={locked}
        title={locked ? "Keep this value when shuffling" : "Lock this value when shuffling"}
        onClick={() => toggleLock(variable)}
        xstyle={[s.lock, locked && s.locked]}
      >
        {locked ? <Lock width={12} height={12} /> : <LockOpen width={12} height={12} />}
      </Button>
    </div>
  );
}

function OptionsPopover({
  label,
  value,
  icon,
  children,
  preset = false,
  onOpenChange,
  open,
  description,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  children: ReactNode;
  preset?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  description?: string;
}) {
  const fieldLayout = label !== "Font Family";
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger
        aria-label={`Choose ${label}`}
        xstyle={[s.controlButton, fieldLayout && s.choiceTrigger]}
      >
        {fieldLayout ? (
          <>
            <span {...stylex.props(s.choicePrefix)}>{icon}</span>
            <span {...stylex.props(s.choiceValue)}>{value}</span>
            <span {...stylex.props(s.choiceSuffix)}>
              <ChevronsExpandVertical width={12} height={12} aria-hidden="true" />
            </span>
          </>
        ) : (
          <>
            <span {...stylex.props(s.row)}>
              {icon}
              <span>{value}</span>
            </span>
            <ChevronsExpandVertical width={12} height={12} aria-hidden="true" />
          </>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={8} align="center">
          <Popover.Popup
            xstyle={[s.popover, Boolean(description) && s.radiusPopover, preset && s.presetPopover]}
          >
            {description ? (
              <div {...stylex.props(s.optionHeading)}>
                <Popover.Title xstyle={s.title}>{label}</Popover.Title>
                <Popover.Description xstyle={s.hint}>{description}</Popover.Description>
              </div>
            ) : (
              <Popover.Title xstyle={s.hidden}>{label}</Popover.Title>
            )}
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function AccentControl(props: BuilderControlsProps) {
  const { settings, update } = props;
  const color = `oklch(${settings.lightness} ${settings.chroma} ${settings.hue})`;
  const hsl = formatHsl(color) ?? "hsl(253.83, 100%, 50%)";
  const gradient = `linear-gradient(to right, ${[24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336, 360, 24].map((h) => `oklch(${settings.lightness} ${settings.chroma} ${h})`).join(", ")})`;
  return (
    <div {...stylex.props(s.control, s.accentControl)}>
      <ControlLabel label="Accent" variable="hue" {...props} />
      <div {...stylex.props(s.row, s.colorRow)}>
        <ColorSlider
          channel="hue"
          aria-label="Accent hue"
          value={hsl}
          onChange={(next) => update({ hue: converter("oklch")(next.toString("hsl"))?.h ?? 0 })}
          xstyle={s.gradientRoot}
        >
          <ColorSlider.Track xstyle={s.gradientTrack(gradient)} style={{ background: gradient }}>
            <ColorSlider.Thumb xstyle={s.sliderThumb} style={{ background: color }} />
          </ColorSlider.Track>
        </ColorSlider>
        <ThemeBuilderColorPicker settings={settings} update={update} />
      </div>
    </div>
  );
}

export function BaseControl(props: BuilderControlsProps) {
  const { settings, update } = props;
  const gradient = `linear-gradient(to right, oklch(0.7 0 ${settings.hue}), oklch(0.7 0.02 ${settings.hue}))`;
  return (
    <div {...stylex.props(s.control, s.baseControl)}>
      <ControlLabel label="Base" variable="base" {...props} />
      <Slider
        min={0}
        max={0.02}
        step={0.0001}
        value={settings.base}
        onValueChange={(value) => update({ base: value as number })}
        xstyle={s.gradientRoot}
      >
        <Slider.Control xstyle={s.gradientControl}>
          <Slider.Track xstyle={s.gradientTrack(gradient)}>
            <Slider.Thumb aria-label="Base chroma" xstyle={s.sliderThumb} />
          </Slider.Track>
        </Slider.Control>
      </Slider>
    </div>
  );
}

export function FontControl(props: BuilderControlsProps) {
  const { settings, update } = props;
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const customIds = [
    ...new Set([
      ...added,
      ...(!fonts.some((font) => font.id === settings.fontFamily) ? [settings.fontFamily] : []),
    ]),
  ];
  const choices = [...fonts, ...customIds.map(getBuilderFont)];
  useEffect(() => {
    if (!open) return;
    const links = [...fonts, ...added.map(getBuilderFont)]
      .filter((font) => font.id !== "inter")
      .map((font) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = font.cdnUrl;
        document.head.append(link);
        return link;
      });
    return () => links.forEach((link) => link.remove());
  }, [open, added]);
  return (
    <div {...stylex.props(s.control)}>
      <ControlLabel label="Font Family" variable="fontFamily" {...props} />
      <OptionsPopover
        label="Font Family"
        value={getBuilderFont(settings.fontFamily).label}
        icon={<FontCase width={16} height={16} aria-hidden="true" />}
        onOpenChange={setOpen}
      >
        <div {...stylex.props(s.stack)}>
          {!custom && (
            <div {...stylex.props(s.row)}>
              <p {...stylex.props(s.fontHeading)}>Suggested fonts</p>
              <Button size="sm" variant="ghost" onClick={() => setCustom(!custom)}>
                Add from CDN
                <Plus width={16} height={16} aria-hidden="true" />
              </Button>
            </div>
          )}
          {custom ? (
            <ThemeBuilderCustomFont
              onBack={() => setCustom(false)}
              onAdd={(url) => {
                const next = validateBuilderSettings({ ...settings, fontFamily: url });
                setAdded((previous) => [...new Set([...previous, next.fontFamily])]);
                update({ fontFamily: next.fontFamily });
              }}
            />
          ) : (
            <ListBox
              aria-label="Font Family"
              selectionMode="single"
              selectedKeys={new Set([settings.fontFamily])}
              onSelectionChange={(keys) => {
                const id = [...keys][0];
                if (typeof id === "string")
                  update(validateBuilderSettings({ ...settings, fontFamily: id }));
              }}
              xstyle={s.fontGrid}
            >
              {choices.map((font) => (
                <ListBoxItem
                  key={font.id}
                  itemKey={font.id}
                  textValue={font.label}
                  aria-label={font.label}
                  xstyle={[s.fontCard, settings.fontFamily === font.id && s.selectedOption]}
                  style={{ fontFamily: `"${font.label}", sans-serif` }}
                >
                  <span {...stylex.props(s.optionSymbol)}>Ag</span>
                  <span {...stylex.props(s.fontName)}>{font.label}</span>
                </ListBoxItem>
              ))}
            </ListBox>
          )}
        </div>
      </OptionsPopover>
    </div>
  );
}

export function RadiusControl({
  field = false,
  ...props
}: BuilderControlsProps & { field?: boolean }) {
  const { settings, update } = props;
  const key = field ? "formRadius" : "radius";
  const label = field ? "Radius Form" : "Radius";
  const options = field ? formRadiusOptions : radiusOptions;
  const selected = options.find((option) => option.id === settings[key])!;
  return (
    <div {...stylex.props(s.control)}>
      <ControlLabel label={label} variable={key} {...props} />
      <OptionsPopover
        label={label}
        value={selected.description.replace(/^./, (letter) => letter.toUpperCase())}
        icon={<span {...stylex.props(s.muted)}>{selected.label}</span>}
        description={
          field ? "Adjust the radius of form components" : "Adjust the radius of components"
        }
      >
        <ListBox
          aria-label={label}
          selectionMode="single"
          selectedKeys={new Set([settings[key]])}
          onSelectionChange={(keys) => {
            const id = [...keys][0];
            if (typeof id === "string") update(validateBuilderSettings({ ...settings, [key]: id }));
          }}
          xstyle={s.options}
        >
          {options.map((option) => (
            <ListBoxItem
              key={option.id}
              itemKey={option.id}
              textValue={option.description}
              aria-label={`${label} ${option.description}`}
              xstyle={[s.option, settings[key] === option.id && s.selectedOption]}
            >
              <span {...stylex.props(s.optionSymbol)}>{option.label}</span>
              <span {...stylex.props(s.optionCaption)}>{option.description}</span>
            </ListBoxItem>
          ))}
        </ListBox>
      </OptionsPopover>
    </div>
  );
}

function ThemeControl({ settings, update }: BuilderControlsProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.toLowerCase() !== "t" ||
        !window.matchMedia("(min-width: 640px)").matches
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest("input,textarea,select,[contenteditable],[role=dialog]")
      )
        return;
      event.preventDefault();
      update(themes[Math.floor(Math.random() * themes.length)]!.variables);
    };
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [update]);
  const match = findMatchingTheme(settings);
  const selected = themes.find((theme) => theme.id === match);
  return (
    <div {...stylex.props(s.control)}>
      <div {...stylex.props(s.label)}>Theme</div>
      <OptionsPopover
        label="Theme"
        value={selected?.label ?? "Custom"}
        icon={<BucketPaint width={16} height={16} aria-hidden="true" />}
        preset
        open={open}
        onOpenChange={setOpen}
      >
        <div>
          <PresetChoices settings={settings} update={update} />
          <div {...stylex.props(s.themeDetails)}>
            <div {...stylex.props(s.themeDescription)}>
              <span {...stylex.props(s.themeLabel)}>Vibrant palette</span>
              <span {...stylex.props(s.themeHint)}>More saturated soft foreground colors.</span>
            </div>
            <Switch
              aria-label="Vibrant palette"
              checked={settings.vibrantPalette ?? false}
              onCheckedChange={(checked) => update({ vibrantPalette: checked })}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
          <p {...stylex.props(s.randomHint)}>
            Pick a random theme with{" "}
            <Kbd>
              <Kbd.Content>T</Kbd.Content>
            </Kbd>
          </p>
        </div>
      </OptionsPopover>
    </div>
  );
}

export function BuilderControls(props: BuilderControlsProps) {
  return (
    <>
      <div {...stylex.props(s.footerGroup)}>
        <AccentControl {...props} />
        <BaseControl {...props} />
        <FontControl {...props} />
      </div>
      <div {...stylex.props(s.footerGroup)}>
        <RadiusControl {...props} />
        <RadiusControl field {...props} />
        <ThemeControl {...props} />
      </div>
    </>
  );
}

export function PresetChoices({
  settings,
  update,
  mobile = false,
}: Pick<BuilderControlsProps, "settings" | "update"> & { mobile?: boolean }) {
  const selected = findMatchingTheme(settings);
  return (
    <ListBox
      aria-label="Theme presets"
      selectionMode="single"
      selectedKeys={new Set(selected ? [selected] : [])}
      onSelectionChange={(keys) => {
        const theme = themes.find((theme) => theme.id === [...keys][0]);
        if (theme) update(theme.variables);
      }}
      xstyle={mobile ? s.mobilePresets : s.presets}
    >
      {themes.map((theme) => {
        const content = (
          <>
            <img
              width={36}
              height={36}
              alt=""
              src={`/theme-presets/${theme.id === "uber" ? "black" : theme.id}.png`}
              {...stylex.props(s.presetImage)}
            />
            <span {...stylex.props(s.presetName)}>{theme.label}</span>
          </>
        );
        return (
          <ListBoxItem
            key={theme.id}
            itemKey={theme.id}
            textValue={theme.label}
            aria-label={`Apply ${theme.label} theme`}
            title={theme.label}
            xstyle={[s.preset, mobile && s.mobilePreset, selected === theme.id && s.selectedPreset]}
          >
            {content}
          </ListBoxItem>
        );
      })}
    </ListBox>
  );
}
