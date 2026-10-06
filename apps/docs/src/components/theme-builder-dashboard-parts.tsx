"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  Input,
  Modal,
  Popover,
  Select,
  Table,
  type SortDescriptor,
} from "@lenso/ui";
import { Eye, Pencil, TrashBin } from "@gravity-ui/icons";
import { dashboard as s } from "@/styles/theme-builder-dashboard.stylex";

export type Employee = { id: number; name: string; email: string; role: string; worker: string };
export type DialogKind = "invite" | "view" | "edit" | "remove" | "tasks" | "settings" | "help";
export const initialEmployees: Employee[] = [
  {
    id: 1,
    name: "Maya Chen",
    email: "maya@example.test",
    role: "Product designer",
    worker: "Full-time",
  },
  {
    id: 2,
    name: "Alex Morgan",
    email: "alex@example.test",
    role: "Engineering lead",
    worker: "Full-time",
  },
  {
    id: 3,
    name: "Sam Rivera",
    email: "sam@example.test",
    role: "Frontend developer",
    worker: "Contractor",
  },
  {
    id: 4,
    name: "Jordan Lee",
    email: "jordan@example.test",
    role: "Marketing manager",
    worker: "Full-time",
  },
  {
    id: 5,
    name: "Robin Park",
    email: "robin@example.test",
    role: "Content writer",
    worker: "Contractor",
  },
  {
    id: 6,
    name: "Casey Ellis",
    email: "casey@example.test",
    role: "Sales specialist",
    worker: "Full-time",
  },
];
export const periods = {
  Monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    revenue: [8400, 10200, 9100, 12300, 10800, 14600, 13200, 15000, 13800, 16400, 15200, 17100],
    expenses: [4200, 5100, 4800, 6200, 5400, 7100, 6400, 7600, 6800, 8100, 7500, 8500],
    sales: [84, 102, 91, 123, 108, 146, 132, 150, 138, 164, 152, 171],
    organic: [1600, 2200, 1800, 2800, 2400, 3200, 3000, 3900, 4100, 3800, 4700, 4200],
    direct: [1200, 1500, 1300, 1900, 1800, 2200, 2100, 2500, 2400, 2800, 3300, 2600],
  },
  Weekly: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    revenue: [1200, 1600, 1400, 2000, 1800, 2600, 2000],
    expenses: [600, 800, 700, 1000, 900, 1300, 950],
    sales: [12, 16, 14, 20, 18, 26, 20],
    organic: [240, 320, 280, 400, 360, 520, 400],
    direct: [170, 240, 200, 280, 250, 360, 300],
  },
};
export type Range = keyof typeof periods;
export type Mode = "Overview" | "Sales" | "Expenses";
export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function Initials({ name }: { name: string }) {
  return (
    <Avatar size="sm" aria-hidden="true">
      <Avatar.Fallback>
        {name
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")}
      </Avatar.Fallback>
    </Avatar>
  );
}

export function DashboardSelect({
  label,
  value,
  values,
  onChange,
  name,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
  name?: string;
}) {
  return (
    <Select
      items={values.map((item) => ({ value: item, label: item }))}
      name={name}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <Select.Trigger aria-label={label} xstyle={s.select}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popover>
            <Select.List>
              {values.map((item) => (
                <Select.Item key={item} value={item}>
                  <Select.ItemText>{item}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popover>
        </Select.Positioner>
      </Select.Portal>
    </Select>
  );
}

export function DashboardPopover({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <Popover>
      <Popover.Trigger
        render={<Button size="sm" variant="tertiary" aria-label={label} xstyle={s.compact} />}
      >
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup xstyle={s.popover}>
            <Popover.Title>{label}</Popover.Title>
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover>
  );
}

export function DashboardCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Checkbox checked={checked} onCheckedChange={onChange} aria-label={label} xstyle={s.checkbox}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        {label}
      </Checkbox.Content>
    </Checkbox>
  );
}

function usePlotSize(ref: RefObject<SVGSVGElement | null>) {
  const [size, setSize] = useState({ width: 500, height: 170 });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 40)
        setSize({
          width: Math.max(1, Math.round(entry.contentRect.width)),
          height: Math.max(1, Math.round(entry.contentRect.height)),
        });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

export function ReportCharts({ range, mode }: { range: Range; mode: Mode }) {
  const id = useId();
  const salesRef = useRef<SVGSVGElement>(null);
  const trafficRef = useRef<SVGSVGElement>(null);
  const salesPlot = usePlotSize(salesRef);
  const trafficPlot = usePlotSize(trafficRef);
  const report = periods[range];
  const values =
    mode === "Expenses" ? report.expenses : mode === "Sales" ? report.sales : report.revenue;
  const ceiling = Math.ceil(Math.max(...values) / 4) * 4;
  const trafficCeiling = Math.ceil(Math.max(...report.organic, ...report.direct) / 4) * 4;
  const total = sum(values);
  const sessions = sum(report.organic) + sum(report.direct);
  const unit = mode === "Sales" ? (value: number) => String(value) : money;
  const line = (series: number[]) =>
    series
      .map(
        (value, index) =>
          `${42 + index * ((trafficPlot.width - 58) / (series.length - 1))},${trafficPlot.height - 24 - (value / trafficCeiling) * (trafficPlot.height - 40)}`,
      )
      .join(" ");
  const summaries = [
    {
      label:
        mode === "Sales" ? "Total sales" : mode === "Expenses" ? "Total expenses" : "Total revenue",
      value: unit(total),
    },
    { label: "Average", value: unit(Math.round(total / values.length)) },
    { label: "Highest", value: unit(Math.max(...values)) },
  ];
  return (
    <div {...stylex.props(s.charts)}>
      <figure {...stylex.props(s.card, s.figure)}>
        <h3 {...stylex.props(s.sectionTitle)}>
          {mode === "Expenses" ? "Expense performance" : "Sales performance"}
        </h3>
        <div {...stylex.props(s.summaryGrid)}>
          {summaries.map((item) => (
            <div key={item.label}>
              <div {...stylex.props(s.summaryValue)}>{item.value}</div>
              <div {...stylex.props(s.muted)}>{item.label}</div>
            </div>
          ))}
        </div>
        <svg
          ref={salesRef}
          viewBox={`0 0 ${salesPlot.width} ${salesPlot.height}`}
          // Inline SVG needs image semantics while retaining its accessible chart description.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="img"
          aria-labelledby={`${id}-sales-title`}
          aria-describedby={`${id}-sales-description`}
          {...stylex.props(s.plot)}
        >
          <title id={`${id}-sales-title`}>
            {range} {mode.toLowerCase()} performance
          </title>
          <desc id={`${id}-sales-description`}>
            {report.labels.map((label, index) => `${label}: ${unit(values[index]!)}`).join("; ")}.
            Total {unit(total)}.
          </desc>
          {[0, 1, 2, 3, 4].map((step) => (
            <g key={step}>
              <line
                x1="42"
                x2={salesPlot.width - 10}
                y1={salesPlot.height - 24 - (step * (salesPlot.height - 40)) / 4}
                y2={salesPlot.height - 24 - (step * (salesPlot.height - 40)) / 4}
                {...stylex.props(s.gridLine)}
              />
              <text
                x="35"
                y={salesPlot.height - 20 - (step * (salesPlot.height - 40)) / 4}
                textAnchor="end"
                {...stylex.props(s.tick)}
              >
                {mode === "Sales" ? (ceiling * step) / 4 : `${(ceiling * step) / 4000}k`}
              </text>
            </g>
          ))}
          {values.map((value, index) => (
            <g key={report.labels[index]}>
              <rect
                x={
                  42 +
                  (index + 0.5) * ((salesPlot.width - 58) / values.length) -
                  Math.min(16, ((salesPlot.width - 58) / values.length) * 0.55) / 2
                }
                y={salesPlot.height - 24 - (value / ceiling) * (salesPlot.height - 40)}
                width={Math.min(16, ((salesPlot.width - 58) / values.length) * 0.55)}
                height={(value / ceiling) * (salesPlot.height - 40)}
                rx="5"
                {...stylex.props(s.bar)}
              />
              <text
                visibility={
                  salesPlot.width < 340 &&
                  index % (values.length > 8 ? 3 : 2) !== 0 &&
                  index !== values.length - 1
                    ? "hidden"
                    : undefined
                }
                x={42 + (index + 0.5) * ((salesPlot.width - 58) / values.length)}
                y={salesPlot.height - 3}
                textAnchor="middle"
                {...stylex.props(s.tick)}
              >
                {report.labels[index]}
              </text>
            </g>
          ))}
        </svg>
        <figcaption {...stylex.props(s.disclosure)}>
          {range} sample{" "}
          {mode === "Sales" ? "orders" : mode === "Expenses" ? "spending" : "revenue"} · USD where
          applicable
        </figcaption>
      </figure>
      <figure {...stylex.props(s.card, s.figure)}>
        <h3 {...stylex.props(s.sectionTitle)}>Traffic source</h3>
        <div>
          <span {...stylex.props(s.summaryValue)}>{sessions.toLocaleString("en-US")}</span>{" "}
          <span {...stylex.props(s.muted)}>sessions</span>
        </div>
        <div {...stylex.props(s.legend)}>
          <span {...stylex.props(s.legendItem)}>
            <span {...stylex.props(s.dot)} />
            Organic
          </span>
          <span {...stylex.props(s.legendItem)}>
            <span {...stylex.props(s.dot, s.softDot)} />
            Direct
          </span>
        </div>
        <svg
          ref={trafficRef}
          viewBox={`0 0 ${trafficPlot.width} ${trafficPlot.height}`}
          // Inline SVG needs image semantics while retaining its accessible chart description.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="img"
          aria-labelledby={`${id}-traffic-title`}
          aria-describedby={`${id}-traffic-description`}
          {...stylex.props(s.plot)}
        >
          <title id={`${id}-traffic-title`}>{range} traffic sources</title>
          <desc id={`${id}-traffic-description`}>
            {sum(report.organic)} organic sessions and {sum(report.direct)} direct sessions.{" "}
            {report.labels
              .map(
                (label, index) =>
                  `${label}: organic ${report.organic[index]}, direct ${report.direct[index]}`,
              )
              .join("; ")}
            .
          </desc>
          {[0, 1, 2, 3, 4].map((step) => (
            <g key={step}>
              <line
                x1="42"
                x2={trafficPlot.width - 10}
                y1={trafficPlot.height - 24 - (step * (trafficPlot.height - 40)) / 4}
                y2={trafficPlot.height - 24 - (step * (trafficPlot.height - 40)) / 4}
                {...stylex.props(s.gridLine)}
              />
              <text
                x="35"
                y={trafficPlot.height - 20 - (step * (trafficPlot.height - 40)) / 4}
                textAnchor="end"
                {...stylex.props(s.tick)}
              >
                {(trafficCeiling * step) / 4}
              </text>
            </g>
          ))}
          <polyline points={line(report.organic)} {...stylex.props(s.line)} />
          <polyline points={line(report.direct)} {...stylex.props(s.line, s.softLine)} />
          {report.labels.map((label, index) => (
            <text
              key={label}
              visibility={
                trafficPlot.width < 340 &&
                index % (report.labels.length > 8 ? 3 : 2) !== 0 &&
                index !== report.labels.length - 1
                  ? "hidden"
                  : undefined
              }
              x={42 + index * ((trafficPlot.width - 58) / (report.labels.length - 1))}
              y={trafficPlot.height - 3}
              textAnchor="middle"
              {...stylex.props(s.tick)}
            >
              {label}
            </text>
          ))}
        </svg>
        <figcaption {...stylex.props(s.disclosure)}>
          Local sample sessions · {range.toLowerCase()} reporting
        </figcaption>
      </figure>
    </div>
  );
}

export function EmployeeTable({
  rows,
  columns,
  onAction,
  sortDescriptor,
  onSortChange,
}: {
  rows: Employee[];
  columns: string[];
  onAction: (kind: DialogKind, employee: Employee) => void;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
}) {
  return (
    <Table.Root xstyle={s.tableRoot}>
      <Table.ScrollContainer
        // The table's horizontal scroll viewport must be keyboard-reachable.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-label="Employee table scroll area"
        xstyle={s.tableViewport}
      >
        <Table.Content
          aria-label="Employees"
          sortDescriptor={sortDescriptor}
          onSortChange={onSortChange}
          xstyle={s.table}
        >
          <Table.Header>
            {columns.includes("ID") && (
              <Table.Column columnKey="id" allowsSorting xstyle={s.th}>
                ID
              </Table.Column>
            )}
            <Table.Column columnKey="name" allowsSorting xstyle={s.th}>
              Employee
            </Table.Column>
            {columns.includes("Role") && (
              <Table.Column columnKey="role" xstyle={s.th}>
                Role
              </Table.Column>
            )}
            {columns.includes("Worker type") && (
              <Table.Column columnKey="worker" xstyle={s.th}>
                Worker type
              </Table.Column>
            )}
            <Table.Column columnKey="actions" xstyle={s.th}>
              Actions
            </Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Collection items={rows.map((employee) => ({ ...employee, key: employee.id }))}>
              {(employee) => (
                <Table.Row key={employee.id} itemKey={employee.id} xstyle={s.tr}>
                  {columns.includes("ID") && (
                    <Table.Cell xstyle={s.td}>#{String(employee.id).padStart(3, "0")}</Table.Cell>
                  )}
                  <Table.Cell xstyle={s.td}>
                    <div {...stylex.props(s.member)}>
                      <Initials name={employee.name} />
                      <div {...stylex.props(s.memberCopy)}>
                        <span>{employee.name}</span>
                        <span {...stylex.props(s.muted)}>{employee.email}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  {columns.includes("Role") && (
                    <Table.Cell xstyle={s.td}>{employee.role}</Table.Cell>
                  )}
                  {columns.includes("Worker type") && (
                    <Table.Cell xstyle={s.td}>
                      <span {...stylex.props(s.worker)}>{employee.worker}</span>
                    </Table.Cell>
                  )}
                  <Table.Cell xstyle={s.td}>
                    <div {...stylex.props(s.actions)}>
                      {(
                        [
                          { kind: "view", label: "View", Icon: Eye },
                          { kind: "edit", label: "Edit", Icon: Pencil },
                          { kind: "remove", label: "Remove", Icon: TrashBin },
                        ] as const
                      ).map(({ kind, label, Icon }) => (
                        <Modal.Trigger
                          key={kind}
                          onClick={() => onAction(kind, employee)}
                          render={
                            <Button
                              variant={kind === "remove" ? "danger-soft" : "tertiary"}
                              size="sm"
                              isIconOnly
                              aria-label={`${label} ${employee.name}`}
                              xstyle={s.iconButton}
                            />
                          }
                        >
                          <Icon aria-hidden="true" width={16} height={16} />
                        </Modal.Trigger>
                      ))}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
            {rows.length === 0 && (
              <Table.Row itemKey="empty" xstyle={s.tr}>
                <Table.Cell
                  colSpan={
                    (columns.includes("ID") ? 1 : 0) +
                    1 +
                    (columns.includes("Role") ? 1 : 0) +
                    (columns.includes("Worker type") ? 1 : 0) +
                    1
                  }
                  xstyle={s.empty}
                >
                  No employees match your filters.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table.Root>
  );
}

export function EmployeeForm({
  employee,
  onSave,
}: {
  employee?: Employee;
  onSave: (data: Omit<Employee, "id">) => void;
}) {
  const id = useId();
  const [worker, setWorker] = useState(employee?.worker ?? "Full-time");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSave({
          name: String(data.get("name")).trim(),
          email: String(data.get("email")).trim(),
          role: String(data.get("role")).trim(),
          worker,
        });
      }}
      {...stylex.props(s.fields)}
    >
      {(
        [
          { name: "name", label: "Name", value: employee?.name },
          { name: "email", label: "Email", value: employee?.email },
          { name: "role", label: "Role", value: employee?.role },
        ] as const
      ).map((field) => (
        <label key={field.name} htmlFor={`${id}-${field.name}`} {...stylex.props(s.field)}>
          {field.label}
          <Input
            id={`${id}-${field.name}`}
            name={field.name}
            type={field.name === "email" ? "email" : "text"}
            required
            pattern={field.name === "email" ? undefined : ".*\\S.*"}
            defaultValue={field.value ?? ""}
          />
        </label>
      ))}
      <div {...stylex.props(s.field)}>
        <span>Worker type</span>
        <DashboardSelect
          label="Worker type"
          name="worker"
          value={worker}
          values={["Full-time", "Contractor"]}
          onChange={setWorker}
        />
      </div>
      <Button type="submit">{employee ? "Save changes" : "Add employee"}</Button>
    </form>
  );
}

export function downloadEmployees(rows: Employee[], columns: string[]) {
  const fields = ["Name", "Email", ...columns];
  const cell = (value: string) =>
    `"${(/^[\s]*[=+\-@]/u.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
  const csv = [
    fields,
    ...rows.map((row) => [
      row.name,
      row.email,
      ...columns.map((column) =>
        column === "ID" ? String(row.id) : column === "Role" ? row.role : row.worker,
      ),
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "sample-employees.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
