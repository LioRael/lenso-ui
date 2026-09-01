"use client";

import Link from "next/link";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@lenso/ui/button";
import {
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@lenso/ui/select";
import { SidebarItem } from "@lenso/ui/sidebar";
import { SwitchRoot, SwitchThumb } from "@lenso/ui/switch";
import { styles } from "./overview.stylex";

export function OverviewContent() {
  return (
    <>
      <section id="overview" {...stylex.props(styles.overview)}>
        <div {...stylex.props(styles.overviewCopy)}>
          <p {...stylex.props(styles.eyebrow)}>LENSO UI · DESIGN SYSTEM</p>
          <h1 {...stylex.props(styles.title)}>
            Build focused tools, without rebuilding the basics.
          </h1>
          <div {...stylex.props(styles.description)}>
            Shared tokens, accessible components, and adaptable patterns for focused Lenso product
            interfaces.
          </div>
          <div {...stylex.props(styles.metadata)}>
            <span {...stylex.props(styles.metadataPill)}>Light + Dark</span>
            <span {...stylex.props(styles.metadataPill)}>264 tokens</span>
          </div>
        </div>

        <article {...stylex.props(styles.preview)}>
          <div {...stylex.props(styles.previewHeader)}>
            <h2 {...stylex.props(styles.previewTitle)}>Component primitives</h2>
          </div>
          <div {...stylex.props(styles.previewControls)}>
            <Button
              nativeButton={false}
              render={<Link href="#quick-start" />}
              xstyle={styles.previewButton}
            >
              Get started
            </Button>
            <SelectRoot defaultValue="default">
              <SelectTrigger aria-label="Density" xstyle={styles.densitySelect}>
                <SelectValue />
                <SelectIcon />
              </SelectTrigger>
              <SelectPortal>
                <SelectPositioner>
                  <SelectPopup xstyle={styles.densityPopup}>
                    <SelectList>
                      <SelectItem value="compact">
                        <SelectItemText>Compact</SelectItemText>
                        <SelectItemIndicator />
                      </SelectItem>
                      <SelectItem value="default">
                        <SelectItemText>Default</SelectItemText>
                        <SelectItemIndicator />
                      </SelectItem>
                      <SelectItem value="comfortable">
                        <SelectItemText>Comfortable</SelectItemText>
                        <SelectItemIndicator />
                      </SelectItem>
                    </SelectList>
                  </SelectPopup>
                </SelectPositioner>
              </SelectPortal>
            </SelectRoot>
            <SwitchRoot aria-label="Preview setting" size="compact">
              <SwitchThumb />
            </SwitchRoot>
          </div>
          <p {...stylex.props(styles.previewDescription)}>
            Semantic tokens · composable parts · predictable states
          </p>
        </article>
      </section>

      <section id="foundations" {...stylex.props(styles.section, styles.foundations)}>
        <div {...stylex.props(styles.sectionCopy)}>
          <h2 {...stylex.props(styles.sectionTitle)}>Foundations</h2>
          <p {...stylex.props(styles.sectionDescription)}>
            Start with the shared color, type, spacing, and elevation decisions that keep products
            coherent.
          </p>
        </div>
        <div {...stylex.props(styles.grid, styles.fourColumns)}>
          <article {...stylex.props(styles.indexCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Colors</h3>
            <p {...stylex.props(styles.cardDescription)}>160 semantic roles · Light/Dark</p>
          </article>
          <article {...stylex.props(styles.indexCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Typography</h3>
            <p {...stylex.props(styles.cardDescription)}>10 shared styles · IBM Plex Sans</p>
          </article>
          <article {...stylex.props(styles.indexCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Spacing &amp; radius</h3>
            <p {...stylex.props(styles.cardDescription)}>24px rhythm · pill controls</p>
          </article>
          <article {...stylex.props(styles.indexCard, styles.lastCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Elevation</h3>
            <p {...stylex.props(styles.cardDescription)}>Panel · overlay · tooltip · dialog</p>
          </article>
        </div>
      </section>

      <section id="components" {...stylex.props(styles.section, styles.components)}>
        <div {...stylex.props(styles.sectionCopy)}>
          <h2 {...stylex.props(styles.sectionTitle)}>Components</h2>
          <p {...stylex.props(styles.sectionDescription)}>
            Explore the behavior, composition, and usage guidance for each production component.
          </p>
        </div>
        <div {...stylex.props(styles.grid, styles.fourColumns)}>
          <article {...stylex.props(styles.componentCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Actions</h3>
            <div {...stylex.props(styles.componentStage, styles.gappedStage)}>
              <Button
                nativeButton={false}
                render={<Link href="/components/button" />}
                xstyle={styles.previewButton}
              >
                Primary
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/components/icon-button" />}
                variant="secondary"
              >
                Secondary
              </Button>
            </div>
          </article>
          <article {...stylex.props(styles.componentCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Form controls</h3>
            <div {...stylex.props(styles.componentStage, styles.gappedStage)}>
              <SelectRoot defaultValue="default">
                <SelectTrigger aria-label="Density" xstyle={styles.densitySelect}>
                  <SelectValue />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectPositioner>
                    <SelectPopup xstyle={styles.densityPopup}>
                      <SelectList>
                        <SelectItem value="compact">
                          <SelectItemText>Compact</SelectItemText>
                          <SelectItemIndicator />
                        </SelectItem>
                        <SelectItem value="default">
                          <SelectItemText>Default</SelectItemText>
                          <SelectItemIndicator />
                        </SelectItem>
                        <SelectItem value="comfortable">
                          <SelectItemText>Comfortable</SelectItemText>
                          <SelectItemIndicator />
                        </SelectItem>
                      </SelectList>
                    </SelectPopup>
                  </SelectPositioner>
                </SelectPortal>
              </SelectRoot>
              <SwitchRoot aria-label="Form preview setting" size="compact">
                <SwitchThumb />
              </SwitchRoot>
            </div>
          </article>
          <article {...stylex.props(styles.componentCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Navigation</h3>
            <div {...stylex.props(styles.componentStage, styles.navigationStage)}>
              <SidebarItem
                nativeButton={false}
                render={<Link href="/patterns/application-sidebar" />}
                selected
                xstyle={styles.sidebarItem}
              >
                Overview
              </SidebarItem>
            </div>
          </article>
          <article {...stylex.props(styles.componentCard, styles.lastCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Compact density</h3>
            <div {...stylex.props(styles.componentStage, styles.gappedStage)}>
              <Button
                nativeButton={false}
                render={<Link href="/components/button" />}
                xstyle={styles.previewButton}
              >
                Action
              </Button>
              <SwitchRoot aria-label="Compact preview setting" size="compact">
                <SwitchThumb />
              </SwitchRoot>
              <span {...stylex.props(styles.densityLabel)}>24–28 px</span>
            </div>
          </article>
        </div>
      </section>

      <section id="patterns" {...stylex.props(styles.patterns)}>
        <div {...stylex.props(styles.patternsHeading)}>
          <h2 {...stylex.props(styles.patternsTitle)}>Patterns</h2>
          <p {...stylex.props(styles.patternsDescription)}>
            Combine foundation components into recurring product workflows without moving product
            state into the library.
          </p>
        </div>
        <div {...stylex.props(styles.grid, styles.threeColumns)}>
          <Link href="/patterns/application-sidebar" {...stylex.props(styles.indexCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Application shell</h3>
            <p {...stylex.props(styles.cardDescription)}>Sidebar + raised main surface</p>
          </Link>
          <Link href="/patterns/settings-row" {...stylex.props(styles.indexCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Settings page</h3>
            <p {...stylex.props(styles.cardDescription)}>Back-to-app navigation + sections</p>
          </Link>
          <Link href="/patterns/page-header" {...stylex.props(styles.indexCard, styles.lastCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Data views</h3>
            <p {...stylex.props(styles.cardDescription)}>Table/list selection + floating actions</p>
          </Link>
        </div>
      </section>

      <section aria-label="Getting started" {...stylex.props(styles.startLinks)}>
        <div {...stylex.props(styles.grid, styles.fourColumns)}>
          <Link href="/start/installation" id="installation" {...stylex.props(styles.indexCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Installation</h3>
            <p {...stylex.props(styles.cardDescription)}>
              Add the packages and generated tokens to a new workspace.
            </p>
          </Link>
          <Link href="/start/quick-start" id="quick-start" {...stylex.props(styles.indexCard)}>
            <h3 {...stylex.props(styles.cardTitle)}>Quick start</h3>
            <p {...stylex.props(styles.cardDescription)}>
              Build a small form from public component subpaths and semantic styles.
            </p>
          </Link>
          <Link
            href="/start/package-vs-registry"
            id="package-vs-registry"
            {...stylex.props(styles.indexCard)}
          >
            <h3 {...stylex.props(styles.cardTitle)}>Package vs Registry</h3>
            <p {...stylex.props(styles.cardDescription)}>
              Choose managed package updates or editable source installed into your application.
            </p>
          </Link>
          <Link
            href="/start/release-status"
            id="release-status"
            {...stylex.props(styles.indexCard, styles.lastCard)}
          >
            <h3 {...stylex.props(styles.cardTitle)}>Release status</h3>
            <p {...stylex.props(styles.cardDescription)}>
              Track implementation readiness and the current package surface.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
