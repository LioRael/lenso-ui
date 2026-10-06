"use client";

// Adapted from HeroUI v3.2.6 custom-fonts.tsx and its English dictionary
// (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// Modified by Lenso contributors: native Base UI parts, StyleX, parent-owned
// font registration and the existing public Google Fonts stylesheet boundary.
import { useState } from "react";
import { ArrowLeft, Globe } from "@gravity-ui/icons";
import { Button, Description, FieldError, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { getBuilderFont } from "@/lib/theme-builder-model";
import { themeBuilderCustomFont as s } from "@/styles/theme-builder-custom-font.stylex";

interface ThemeBuilderCustomFontProps {
  onBack: () => void;
  onAdd: (url: string) => void;
}

function validateFontUrl(value: string): string | null {
  if (!value.trim()) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return "Please enter a valid URL";
  }
  if (url.protocol !== "https:") return "URL must use https protocol";
  try {
    getBuilderFont(value.trim());
    return null;
  } catch {
    return "Use a public Google Fonts stylesheet URL with one font family.";
  }
}

export function ThemeBuilderCustomFont({ onBack, onAdd }: ThemeBuilderCustomFontProps) {
  const [url, setUrl] = useState("");
  const [hasBlurred, setHasBlurred] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const validationError = validateFontUrl(url);
  const showError = (hasBlurred && validationError !== null) || importError !== null;

  function handleImport() {
    if (!url.trim() || validationError !== null) return;
    setImportError(null);
    try {
      onAdd(url.trim());
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Could not import font. Please check the font URL.",
      );
      return;
    }
    setUrl("");
    setHasBlurred(false);
    onBack();
  }

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.backRow)}>
        <Button type="button" variant="ghost" xstyle={s.back} onClick={onBack}>
          <ArrowLeft width={16} height={16} aria-hidden="true" />
          Back
        </Button>
      </div>
      <TextField invalid={showError}>
        <Label>Font URL</Label>
        <InputGroup variant="secondary">
          <InputGroup.Prefix>
            <Globe width={16} height={16} aria-hidden="true" {...stylex.props(s.globe)} />
          </InputGroup.Prefix>
          <InputGroup.Input
            value={url}
            placeholder="Paste font URL..."
            onChange={(event) => {
              setUrl(event.currentTarget.value);
              setImportError(null);
            }}
            onBlur={() => setHasBlurred(true)}
          />
        </InputGroup>
        <Description>Supports Google Fonts stylesheet URLs with one font family</Description>
        {showError ? <FieldError match>{importError ?? validationError}</FieldError> : null}
      </TextField>
      <Button
        type="button"
        fullWidth
        disabled={!url.trim() || validationError !== null}
        size="sm"
        variant="secondary"
        onClick={handleImport}
      >
        Import font
      </Button>
    </div>
  );
}
