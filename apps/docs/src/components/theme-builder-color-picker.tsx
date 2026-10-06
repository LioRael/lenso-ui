"use client";

/**
 * Derived from HeroUI v3.2.6, commit e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
 * Sources: components/color-picker/** and themes/components/accent-color-selector.tsx.
 * Modified: StyleX, Base UI overlays/ordinary controls, controlled BuilderSettings,
 * exact OKLCH edits, labelled controls and inert offscreen swatch pages.
 */
import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ChevronLeft, ChevronRight, Shuffle } from "@gravity-ui/icons";
import { converter, formatHsl, parse } from "culori";
import {
  ColorPicker as AriaColorPicker,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  parseColor,
  type Color,
} from "react-aria-components";
import { Button, ColorArea, ColorSlider, InputGroup, Popover, Select } from "@lenso/ui";
import type { BuilderSettings } from "@/lib/theme-builder-model";
import { picker as s } from "@/styles/theme-builder-color-picker.stylex";

const formats = ["hex", "hsl", "rgb", "hsb", "oklch"] as const;
type Format = (typeof formats)[number];
const toOklch = converter("oklch");
const swatches = [
  "hsla(338, 77%, 78%, 1)",
  "hsla(309, 23%, 55%, 1)",
  "hsla(355, 85%, 66%, 1)",
  "hsla(16, 100%, 67%, 1)",
  "hsla(47, 92%, 66%, 1)",
  "hsla(152, 80%, 56%, 1)",
  "hsla(197, 59%, 64%, 1)",
  "hsla(220, 13%, 18%, 1)",
  "hsla(220, 70%, 50%, 1)",
  "hsla(210, 100%, 56%, 1)",
  "hsla(180, 100%, 25%, 1)",
  "hsla(170, 50%, 65%, 1)",
  "hsla(150, 60%, 75%, 1)",
  "hsla(280, 60%, 60%, 1)",
  "hsla(270, 50%, 70%, 1)",
  "hsla(350, 100%, 88%, 1)",
];
const pages = [swatches.slice(0, 8), swatches.slice(8)];

function detectFormat(value: string): Format | null {
  const input = value.trim().toLowerCase();
  if (/^#?[0-9a-f]{3,8}$/.test(input)) return "hex";
  if (/^hsla?\s*\(/.test(input)) return "hsl";
  if (/^rgba?\s*\(/.test(input)) return "rgb";
  if (/^hsba?\s*\(/.test(input)) return "hsb";
  if (/^oklch\s*\(/.test(input)) return "oklch";
  return null;
}

type AccentChanges = Pick<BuilderSettings, "lightness" | "chroma" | "hue">;

function colorChanges(
  value: string | { mode: "hsl"; h: number; s: number; l: number },
  fallbackHue: number,
): AccentChanges | null {
  const color = toOklch(value);
  if (!color) return null;
  const hue = color.h ?? fallbackHue;
  if (![color.l, color.c, hue].every(Number.isFinite)) return null;
  if (color.l < 0 || color.l > 1 || color.c < 0 || color.c > 0.4) return null;
  return { lightness: color.l, chroma: color.c, hue: ((hue % 360) + 360) % 360 };
}

function readInput(value: string, format: Format, fallbackHue: number) {
  let input = value.trim();
  if (!input || detectFormat(input) !== format) return null;
  try {
    if (format === "hex") {
      if (!/^#?(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(input)) {
        return null;
      }
      if (!input.startsWith("#")) input = `#${input}`;
    }
    if (format === "hsb") {
      // Culori uses HSV, while RAC's native color model calls it HSB.
      const match = input.match(
        /^hsba?\(\s*([\d.+-]+)\s*(?:,|\s)\s*([\d.+-]+)%\s*(?:,|\s)\s*([\d.+-]+)%(?:\s*(?:,|\/)\s*([\d.]+))?\s*\)$/i,
      );
      if (!match) return null;
      const [, h, saturation, brightness, alpha = "1"] = match;
      const channels = [Number(h), Number(saturation), Number(brightness), Number(alpha)];
      if (!channels.every(Number.isFinite)) return null;
      if (channels[1]! < 0 || channels[1]! > 100 || channels[2]! < 0 || channels[2]! > 100) {
        return null;
      }
      if (channels[3]! < 0 || channels[3]! > 1) return null;
      input = parseColor(`hsba(${h}, ${saturation}%, ${brightness}%, ${alpha})`).toString("hsl");
    } else if (!parse(input)) {
      return null;
    }
    return colorChanges(input, fallbackHue);
  } catch {
    return null;
  }
}

function Swatches() {
  const [page, setPage] = useState(0);
  return (
    <div {...stylex.props(s.carousel)}>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Previous color swatches"
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
        xstyle={s.pageButton}
      >
        <ChevronLeft width={16} height={16} aria-hidden="true" />
      </Button>
      <div {...stylex.props(s.viewport)}>
        <div {...stylex.props(s.pages(page))}>
          {pages.map((colors, index) => (
            <div
              key={colors[0]}
              inert={index !== page}
              aria-hidden={index !== page}
              {...stylex.props(s.page)}
            >
              <ColorSwatchPicker aria-label="Accent color swatches" {...stylex.props(s.swatches)}>
                {colors.map((color) => (
                  <ColorSwatchPickerItem
                    key={color}
                    color={color}
                    className={({ isSelected, isFocusVisible }) =>
                      stylex.props(
                        s.swatch,
                        isSelected && s.selectedSwatch,
                        isFocusVisible && s.focusedSwatch,
                      ).className ?? ""
                    }
                  >
                    <ColorSwatch {...stylex.props(s.swatchColor)} />
                  </ColorSwatchPickerItem>
                ))}
              </ColorSwatchPicker>
            </div>
          ))}
        </div>
      </div>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Next color swatches"
        disabled={page === pages.length - 1}
        onClick={() => setPage(page + 1)}
        xstyle={s.pageButton}
      >
        <ChevronRight width={16} height={16} aria-hidden="true" />
      </Button>
    </div>
  );
}

export function ThemeBuilderColorPicker({
  settings,
  update,
}: {
  settings: BuilderSettings;
  update: (changes: Partial<BuilderSettings>) => void;
}) {
  const [format, setFormat] = useState<Format>("hex");
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [nativeValue, setNativeValue] = useState<{ key: string; color: Color } | null>(null);
  const oklch = `oklch(${settings.lightness} ${settings.chroma} ${settings.hue})`;
  const externalColor = useMemo(() => parseColor(formatHsl(oklch) ?? "#006FEE"), [oklch]);
  // Keep RAC's precise channels (and hue at zero saturation) until an external edit.
  const color = nativeValue?.key === oklch ? nativeValue.color : externalColor;
  const displayed =
    format === "oklch"
      ? `oklch(${Number(settings.lightness.toFixed(4))} ${Number(settings.chroma.toFixed(4))} ${Number(settings.hue.toFixed(4))})`
      : color.toString(format);

  function changeColor(next: Color) {
    const hsl = next.toFormat("hsl");
    const changes = colorChanges(
      {
        mode: "hsl",
        h: hsl.getChannelValue("hue"),
        s: hsl.getChannelValue("saturation") / 100,
        l: hsl.getChannelValue("lightness") / 100,
      },
      settings.hue,
    );
    if (changes) {
      setNativeValue({
        key: `oklch(${changes.lightness} ${changes.chroma} ${changes.hue})`,
        color: next,
      });
      update(changes);
    }
    setDraft(null);
    setInvalid(false);
  }

  function resetDraft() {
    setDraft(null);
    setInvalid(false);
  }

  return (
    <AriaColorPicker value={color} onChange={changeColor}>
      <Popover.Root onOpenChange={() => resetDraft()}>
        <Popover.Trigger aria-label="Pick accent color" xstyle={s.trigger}>
          <span aria-hidden="true" {...stylex.props(s.rainbow)} />
          <span aria-hidden="true" {...stylex.props(s.triggerRing)} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="top" align="center" sideOffset={8}>
            <Popover.Popup aria-label="Accent color" xstyle={s.popup}>
              <div {...stylex.props(s.content)}>
                <Swatches />
                <ColorArea
                  aria-label="Accent saturation and lightness"
                  colorSpace="hsl"
                  xChannel="saturation"
                  yChannel="lightness"
                  xstyle={s.area}
                >
                  <ColorArea.Thumb
                    xstyle={s.areaThumb}
                    style={({ color: thumbColor }) => ({ background: thumbColor.toString("css") })}
                  />
                </ColorArea>
                <div {...stylex.props(s.hueRow)}>
                  <ColorSlider
                    aria-label="Accent hue"
                    channel="hue"
                    colorSpace="hsl"
                    xstyle={s.slider}
                  >
                    <ColorSlider.Track
                      xstyle={s.track}
                      style={({ defaultStyle }) => ({ background: defaultStyle.background })}
                    >
                      <ColorSlider.Thumb
                        xstyle={s.sliderThumb}
                        style={({ color: thumbColor }) => ({
                          background: thumbColor.toString("css"),
                        })}
                      />
                    </ColorSlider.Track>
                  </ColorSlider>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    aria-label="Shuffle accent color"
                    xstyle={s.shuffle}
                    onClick={() =>
                      changeColor(
                        parseColor(
                          `hsl(${Math.floor(Math.random() * 360)}, ${50 + Math.floor(Math.random() * 50)}%, ${40 + Math.floor(Math.random() * 30)}%)`,
                        ),
                      )
                    }
                  >
                    <Shuffle width={16} height={16} aria-hidden="true" />
                  </Button>
                </div>
                <InputGroup
                  fullWidth
                  variant="secondary"
                  xstyle={s.field}
                  data-invalid={invalid || undefined}
                >
                  <InputGroup.Input
                    aria-label="Accent color"
                    aria-invalid={invalid || undefined}
                    value={draft ?? displayed}
                    xstyle={s.input}
                    spellCheck={false}
                    onFocus={() => setDraft(displayed)}
                    onBlur={resetDraft}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        resetDraft();
                        event.currentTarget.blur();
                      }
                    }}
                    onChange={(event) => {
                      const value = event.target.value;
                      const detected = detectFormat(value) ?? format;
                      setDraft(value);
                      setFormat(detected);
                      const changes = readInput(value, detected, settings.hue);
                      setInvalid(!changes);
                      if (changes) {
                        setNativeValue(null);
                        update(changes);
                      }
                    }}
                  />
                  <InputGroup.Suffix xstyle={s.suffix}>
                    <Select
                      items={formats.map((value) => ({ value, label: value.toUpperCase() }))}
                      value={format}
                      onValueChange={(value) => {
                        if (value && formats.includes(value)) {
                          setFormat(value);
                          resetDraft();
                        }
                      }}
                    >
                      <Select.Trigger aria-label="Color format" xstyle={s.formatTrigger}>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner sideOffset={4} alignItemWithTrigger={false}>
                          <Select.Popover>
                            <Select.List>
                              {formats.map((value) => (
                                <Select.Item key={value} value={value}>
                                  <Select.ItemText>{value.toUpperCase()}</Select.ItemText>
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.List>
                          </Select.Popover>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select>
                  </InputGroup.Suffix>
                </InputGroup>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </AriaColorPicker>
  );
}
