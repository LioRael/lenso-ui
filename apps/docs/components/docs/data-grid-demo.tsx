"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Building2, Globe2, MapPin, UsersRound } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@lenso/ui/data-grid";
import { DataPlayground } from "./data-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./playground-controls";
import { styles } from "./data-grid-demo.stylex";

type Company = {
  id: string;
  name: string;
  color: string;
  flag: string;
  location: string;
  founder: string;
  employees: number;
  website: string;
};
type CompanyValidation = { reservedNames: ReadonlySet<string> };
const validationData: CompanyValidation = { reservedNames: new Set(["lenso"]) };
const booleanOptions = [
  { label: "False", value: "false" },
  { label: "True", value: "true" },
] as const;

function IdentityEditor({
  label,
  marker,
  value,
  onChange,
  onCommit,
  onCancel,
  inputRef,
  error,
}: {
  label: string;
  marker: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  inputRef: React.Ref<HTMLInputElement>;
  error: string | null;
}) {
  return (
    <span {...stylex.props(styles.identityEditor)}>
      {marker}
      <input
        ref={inputRef}
        aria-label={`Edit ${label}`}
        aria-invalid={Boolean(error)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        {...stylex.props(styles.identityInput)}
      />
    </span>
  );
}
const initialRows: Company[] = [
  {
    id: "quantum",
    name: "Quantum Manufacturing",
    color: "#8b5cf6",
    flag: "🇩🇪",
    location: "Berlin, Germany",
    founder: "Veronica Han",
    employees: 10,
    website: "quantum.com",
  },
  {
    id: "synergy",
    name: "Synergy Solutions",
    color: "#18b89b",
    flag: "🇿🇦",
    location: "Cape Town, SA",
    founder: "Min-ji Kim",
    employees: 76,
    website: "synergy.com",
  },
  {
    id: "apex",
    name: "Apex Networks",
    color: "#252a31",
    flag: "🇨🇭",
    location: "Zurich, Switzerland",
    founder: "Lars Jensen",
    employees: 160,
    website: "apex.com",
  },
  {
    id: "fusion",
    name: "Fusion Ventures",
    color: "#ec4899",
    flag: "🇪🇬",
    location: "Cairo, Egypt",
    founder: "Lily Sinh Katty",
    employees: 320,
    website: "fusion.com",
  },
  {
    id: "vertex",
    name: "Vertex Bio",
    color: "#5788ec",
    flag: "🇮🇪",
    location: "Dublin, Ireland",
    founder: "Wei Chen",
    employees: 810,
    website: "vertex.com",
  },
  {
    id: "cortex",
    name: "Cortex AI",
    color: "#f9a31b",
    flag: "🇨🇴",
    location: "Bogotá, Colombia",
    founder: "Rachel Green",
    employees: 1200,
    website: "cortex.com",
  },
  {
    id: "pinnacle",
    name: "Pinnacle Energy",
    color: "#2dbc86",
    flag: "🇵🇭",
    location: "Manila, Philippines",
    founder: "Sarah Jenkins",
    employees: 6,
    website: "pinnacle.com",
  },
  {
    id: "horizon",
    name: "Horizon Finance",
    color: "#f06b45",
    flag: "🇺🇸",
    location: "Chicago, USA",
    founder: "Michael Chang",
    employees: 85,
    website: "horizon.com",
  },
];

const columns: readonly DataGridColumn<Company, CompanyValidation>[] = [
  {
    id: "name",
    header: "Company",
    icon: <Building2 size={16} />,
    width: 260,
    minWidth: 160,
    pinned: true,
    getValue: (row) => row.name,
    setValue: (row, value) => ({ ...row, name: String(value) }),
    validate: (value, row, context) => {
      const name = String(value).trim();
      if (!name) return "Company name is required";
      if (context.data?.reservedNames.has(name.toLowerCase())) return "This name is reserved";
      if (
        context.rows.some(
          (other) => other.id !== row.id && other.name.toLowerCase() === name.toLowerCase(),
        )
      )
        return "Company name already exists";
      return null;
    },
    renderEditor: ({ row, ...editor }) => (
      <IdentityEditor
        {...editor}
        label="Company"
        marker={
          <span
            aria-hidden="true"
            {...stylex.props(styles.swatch)}
            style={{ backgroundColor: row.color }}
          />
        }
      />
    ),
    renderCell: (value, row) => (
      <span {...stylex.props(styles.identity)}>
        <span
          aria-hidden="true"
          {...stylex.props(styles.swatch)}
          style={{ backgroundColor: row.color }}
        />
        {value}
      </span>
    ),
  },
  {
    id: "location",
    header: "Location",
    icon: <MapPin size={16} />,
    width: 240,
    getValue: (row) => row.location,
    setValue: (row, value) => ({ ...row, location: String(value) }),
    renderCell: (value, row) => (
      <span {...stylex.props(styles.identity)}>
        <span aria-hidden="true">{row.flag}</span>
        {value}
      </span>
    ),
    renderEditor: ({ row, ...editor }) => (
      <IdentityEditor
        {...editor}
        label="Location"
        marker={<span aria-hidden="true">{row.flag}</span>}
      />
    ),
  },
  {
    id: "founder",
    header: "Founder",
    width: 220,
    getValue: (row) => row.founder,
    setValue: (row, value) => ({ ...row, founder: String(value) }),
  },
  {
    id: "employees",
    header: "Employees",
    icon: <UsersRound size={16} />,
    width: 160,
    getValue: (row) => row.employees,
    setValue: (row, value) => ({ ...row, employees: Number(value) }),
    parse: (input) => Number(input),
    validate: (value) =>
      typeof value === "number" && Number.isFinite(value) && value >= 0
        ? null
        : "Enter a valid employee count",
  },
  {
    id: "website",
    header: "Website",
    icon: <Globe2 size={16} />,
    width: 220,
    getValue: (row) => row.website,
    setValue: (row, value) => ({ ...row, website: String(value) }),
    renderCell: (value) => <span {...stylex.props(styles.muted)}>{value}</span>,
  },
];

export function DataGridDemo() {
  const [rows, setRows] = React.useState(initialRows);
  const [readOnly, setReadOnly] = React.useState(false);
  const [showRowSelection, setShowRowSelection] = React.useState(true);
  const [showRowNumbers, setShowRowNumbers] = React.useState(true);
  const [sortable, setSortable] = React.useState(true);
  const [cellSelection, setCellSelection] = React.useState(true);
  const [lastEvent, setLastEvent] = React.useState(
    "Double-click a cell to edit. Drag across cells to select a range.",
  );
  return (
    <DataPlayground
      controls={
        <PlaygroundControls name="Data Grid">
          {(
            [
              ["Read only", readOnly, setReadOnly],
              ["Row selection", showRowSelection, setShowRowSelection],
              ["Row numbers", showRowNumbers, setShowRowNumbers],
              ["Sorting", sortable, setSortable],
              ["Cell selection", cellSelection, setCellSelection],
            ] as const
          ).map(([label, enabled, setter]) => (
            <PlaygroundSelectControl
              key={label}
              label={label}
              onValueChange={(value) => setter(value === "true")}
              options={booleanOptions}
              value={String(enabled)}
            />
          ))}
        </PlaygroundControls>
      }
    >
      <div {...stylex.props(styles.demo)}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          label="Companies"
          maxHeight={420}
          readOnly={readOnly}
          showRowSelection={showRowSelection}
          showRowNumbers={showRowNumbers}
          sortable={sortable}
          cellSelection={cellSelection}
          validationData={validationData}
          onRowsChange={setRows}
          onCellEditComplete={(change) =>
            setLastEvent(`${change.columnId} in ${change.rowId} saved`)
          }
        />
        <div aria-live="polite" {...stylex.props(styles.event)}>
          {lastEvent}
        </div>
      </div>
    </DataPlayground>
  );
}
