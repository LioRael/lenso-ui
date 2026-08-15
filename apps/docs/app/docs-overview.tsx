"use client";

import { useTheme } from "next-themes";

import { Button } from "@lenso/ui/button";

import { DocsShell } from "./docs-shell";
import { useIsClient } from "./use-is-client";

const foundations = [
  ["Colors", "160 semantic roles · Light/Dark"],
  ["Typography", "10 shared styles · IBM Plex Sans"],
  ["Spacing & radius", "24px rhythm · pill controls"],
  ["Elevation", "Panel · overlay · tooltip · dialog"],
] as const;

const patterns = [
  ["Application shell", "Sidebar + raised main surface"],
  ["Settings page", "Back-to-app navigation + sections"],
  ["Data views", "Table/list selection + floating actions"],
] as const;

function ThemeSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      aria-label={on ? "Use light theme" : "Use dark theme"}
      aria-pressed={on}
      className="theme-switch"
      onClick={onChange}
      type="button"
    >
      <span className="theme-switch-track">
        <span className="theme-switch-thumb" />
      </span>
    </button>
  );
}

function CompactSelect() {
  return (
    <button aria-label="Density: Default" className="compact-select" type="button">
      <span>Default</span>
      <span aria-hidden="true" className="select-chevron" />
    </button>
  );
}

function SectionCard({ description, title }: { description: string; title: string }) {
  return (
    <article className="index-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export function DocsOverview() {
  const isClient = useIsClient();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = isClient && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(dark ? "light" : "dark");

  return (
    <DocsShell
      actions={["Components", "Get started"]}
      breadcrumbs={["Documentation", "Overview"]}
      current="overview"
      theme={dark ? "dark" : "light"}
    >
      <div className="docs-content">
        <section className="overview-section" id="overview">
          <div className="overview-copy">
            <p className="docs-eyebrow">LENSO UI · DESIGN SYSTEM</p>
            <h1>Build focused tools, without rebuilding the basics.</h1>
            <p className="overview-description">
              A compact, token-first interface system for Lenso products. Calm hierarchy,
              predictable states, and implementation-ready components.
            </p>
            <div className="metadata-pills">
              <span>Light + Dark</span>
              <span>264 tokens</span>
            </div>
          </div>

          <article className="live-preview">
            <div className="preview-header">
              <h2>Component primitives</h2>
              <span>LIVE</span>
            </div>
            <div className="preview-controls">
              <Button className="preview-cta">Get started</Button>
              <CompactSelect />
              <ThemeSwitch on={dark} onChange={toggleTheme} />
            </div>
            <p>Linked instances · semantic tokens · prototype states</p>
          </article>
        </section>

        <section className="docs-section foundations-section">
          <div className="section-copy">
            <h2>Foundations</h2>
            <p>Shared decisions keep every component visually and behaviorally consistent.</p>
          </div>
          <div className="four-column-grid">
            {foundations.map(([title, description]) => (
              <SectionCard description={description} key={title} title={title} />
            ))}
          </div>
        </section>

        <section className="docs-section components-section">
          <div className="section-copy">
            <h2>Components</h2>
            <p>Live library instances—resize, override, and inspect without detaching.</p>
          </div>
          <div className="four-column-grid component-grid">
            <article className="component-card">
              <h3>Actions</h3>
              <div className="component-stage actions-stage">
                <Button className="primary-sample">Primary</Button>
                <Button variant="secondary">Secondary</Button>
              </div>
            </article>
            <article className="component-card">
              <h3>Form controls</h3>
              <div className="component-stage form-stage">
                <CompactSelect />
                <ThemeSwitch on={dark} onChange={toggleTheme} />
              </div>
            </article>
            <article className="component-card">
              <h3>Navigation</h3>
              <div className="component-stage navigation-stage">
                <span aria-hidden="true" className="home-icon" />
                <span>Overview</span>
              </div>
            </article>
            <article className="component-card">
              <h3>Compact density</h3>
              <div className="component-stage density-stage">
                <Button className="action-sample">Action</Button>
                <ThemeSwitch on={dark} onChange={toggleTheme} />
                <span>24–28 px</span>
              </div>
            </article>
          </div>
        </section>

        <section className="patterns-section">
          <div className="patterns-heading">
            <h2>Patterns</h2>
            <p>Composed recipes for application structure and data-heavy workflows.</p>
          </div>
          <div className="three-column-grid">
            {patterns.map(([title, description]) => (
              <SectionCard description={description} key={title} title={title} />
            ))}
          </div>
        </section>
      </div>
    </DocsShell>
  );
}
