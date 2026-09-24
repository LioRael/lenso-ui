"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Building2,
  ChevronDown,
  CircleUserRound,
  Globe2,
  Link2,
  MapPin,
  UsersRound,
} from "lucide-react";
import { Avatar } from "@lenso/ui/avatar";
import { Checkbox } from "@lenso/ui/checkbox";
import { DataTable, type DataTableColumn } from "@lenso/ui/data-table";
import { styles } from "./data-table-demo.stylex";

const columns: readonly DataTableColumn[] = [
  { id: "selection", width: 40, pinned: true },
  { id: "number", width: 44, pinned: true },
  { id: "company", width: 266, minWidth: 160, pinned: true },
  { id: "location", width: 293, minWidth: 170 },
  { id: "founder", width: 221, minWidth: 150 },
  { id: "employees", width: 195, minWidth: 120 },
  { id: "website", width: 217, minWidth: 140 },
];

const companies = [
  [
    "Quantum Manufacturing",
    "🇩🇪",
    "Berlin, Germany",
    "Veronica Han",
    "1–10",
    "quantum.com",
    "#8b5cf6",
  ],
  ["Synergy Solutions", "🇿🇦", "Cape Town, SA", "Min-ji Kim", "11–100", "synergy.com", "#18b89b"],
  ["Apex Networks", "🇨🇭", "Zurich, Switzerland", "Lars Jensen", "100–199", "apex.com", "#252a31"],
  ["Fusion Ventures", "🇪🇬", "Cairo, Egypt", "Lily Sinh Katty", "200–500", "fusion.com", "#ec4899"],
  ["Vertex Bio", "🇮🇪", "Dublin, Ireland", "Wei Chen", "500–1000", "vertex.com", "#5788ec"],
  ["Cortex AI", "🇨🇴", "Bogotá, Colombia", "Rachel Green", "1000+", "cortex.com", "#f9a31b"],
  [
    "Pinnacle Energy",
    "🇵🇭",
    "Manila, Philippines",
    "Sarah Jenkins",
    "1–10",
    "pinnacle.com",
    "#2dbc86",
  ],
  ["Horizon Finance", "🇺🇸", "Chicago, USA", "Michael Chang", "11–100", "horizon.com", "#f06b45"],
  ["Echo Manufacturing", "🇯🇵", "Osaka, Japan", "Ingrid Berg", "100–199", "echo.com", "#28afe0"],
  ["Lumina Solutions", "🇯🇵", "Tokyo, Japan", "Emma Wilson", "200–500", "lumina.com", "#da2cb4"],
  ["Zenith Networks", "🇬🇧", "London, UK", "Carlos Ruiz", "500–1000", "zenith.com", "#694ef2"],
  ["Catalyst Ventures", "🇦🇪", "Dubai, UAE", "Hiroshi Tanaka", "1000+", "catalyst.com", "#20bca5"],
] as const;

export function DataTableDemo() {
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());
  const [summaryFor, setSummaryFor] = React.useState<string | null>(null);
  const allSelected = selected.size === companies.length;
  const includedCompanies = selected.size
    ? companies.filter(([name]) => selected.has(name))
    : companies;
  const summaryValues: Record<string, string> = {
    company: `${includedCompanies.length} companies`,
    location: `${new Set(includedCompanies.map((company) => company[2])).size} places`,
    founder: `${new Set(includedCompanies.map((company) => company[3])).size} founders`,
    employees: `${new Set(includedCompanies.map((company) => company[4])).size} ranges`,
    website: `${includedCompanies.length} sites`,
  };

  function toggleCompany(name: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(name);
      else next.delete(name);
      return next;
    });
  }

  return (
    <DataTable.Root
      columns={columns}
      label="Portfolio companies"
      maxHeight={520}
      xstyle={styles.table}
    >
      <DataTable.Header>
        <DataTable.Row>
          <DataTable.Head columnId="selection" xstyle={styles.center}>
            <Checkbox.Root
              aria-label="Select all companies"
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onCheckedChange={(checked) =>
                setSelected(checked ? new Set(companies.map(([name]) => name)) : new Set())
              }
            >
              <Checkbox.Indicator />
            </Checkbox.Root>
          </DataTable.Head>
          <DataTable.Head columnId="number" aria-label="Row number" />
          <DataTable.Head
            columnId="company"
            icon={<Building2 size={16} />}
            resizable
            resizeLabel="Resize Company column"
          >
            Company
          </DataTable.Head>
          <DataTable.Head
            columnId="location"
            icon={<MapPin size={16} />}
            resizable
            resizeLabel="Resize Location column"
          >
            Location
          </DataTable.Head>
          <DataTable.Head
            columnId="founder"
            icon={<CircleUserRound size={16} />}
            resizable
            resizeLabel="Resize Founder column"
          >
            Founder
          </DataTable.Head>
          <DataTable.Head
            columnId="employees"
            icon={<UsersRound size={16} />}
            resizable
            resizeLabel="Resize Employees column"
          >
            Employees
          </DataTable.Head>
          <DataTable.Head
            columnId="website"
            icon={<Globe2 size={16} />}
            resizable
            resizeLabel="Resize Website column"
          >
            Website
          </DataTable.Head>
        </DataTable.Row>
      </DataTable.Header>
      <DataTable.Body>
        {companies.map(([name, flag, location, founder, employees, website, color], index) => (
          <DataTable.Row key={name} selected={selected.has(name)}>
            <DataTable.Cell columnId="selection" xstyle={styles.center}>
              <Checkbox.Root
                aria-label={`Select ${name}`}
                checked={selected.has(name)}
                onCheckedChange={(checked) => toggleCompany(name, checked)}
              >
                <Checkbox.Indicator />
              </Checkbox.Root>
            </DataTable.Cell>
            <DataTable.Cell columnId="number" muted xstyle={styles.center}>
              {index + 1}
            </DataTable.Cell>
            <DataTable.Cell columnId="company">
              <span {...stylex.props(styles.cellCopy)}>
                <span
                  aria-hidden="true"
                  {...stylex.props(styles.swatch)}
                  style={{ backgroundColor: color }}
                />
                <span {...stylex.props(styles.text)}>{name}</span>
              </span>
            </DataTable.Cell>
            <DataTable.Cell columnId="location">
              <span {...stylex.props(styles.cellCopy)}>
                <span {...stylex.props(styles.flag)}>{flag}</span>
                <span {...stylex.props(styles.text)}>{location}</span>
              </span>
            </DataTable.Cell>
            <DataTable.Cell columnId="founder">
              <span {...stylex.props(styles.cellCopy)}>
                <Avatar.Root size="compact">
                  <Avatar.Fallback>{name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>
                <span {...stylex.props(styles.text)}>{founder}</span>
              </span>
            </DataTable.Cell>
            <DataTable.Cell columnId="employees">{employees}</DataTable.Cell>
            <DataTable.Cell columnId="website" muted>
              <span {...stylex.props(styles.cellCopy)}>
                <Link2 size={16} aria-hidden="true" />
                <a
                  {...stylex.props(styles.link)}
                  href={`https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {website}
                </a>
              </span>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable.Body>
      <DataTable.Footer>
        <DataTable.Row>
          <DataTable.Cell columnId="selection" />
          <DataTable.Cell columnId="number" />
          {columns.slice(2).map((column) => (
            <DataTable.Cell key={column.id} columnId={column.id}>
              <button
                {...stylex.props(styles.summaryButton)}
                onClick={() =>
                  setSummaryFor((current) => (current === column.id ? null : column.id))
                }
                type="button"
              >
                {summaryFor === column.id ? summaryValues[column.id] : "Calculate"}
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            </DataTable.Cell>
          ))}
        </DataTable.Row>
      </DataTable.Footer>
    </DataTable.Root>
  );
}
