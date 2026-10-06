"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useRef, useState } from "react";
import { Button, Input, Modal, Popover, Tabs, type SortDescriptor } from "@lenso/ui";
import {
  House,
  ChartColumn,
  Persons,
  ListCheck,
  Gear,
  CircleQuestion,
  ArrowRotateLeft,
  Magnifier,
  Bell,
  PersonPlus,
  ArrowDownToLine,
  Bars,
  LayoutColumns,
  ArrowUp,
  ArrowDown,
  Funnel,
  BarsDescendingAlignLeft,
} from "@gravity-ui/icons";
import { dashboard as s } from "@/styles/theme-builder-dashboard.stylex";
import {
  DashboardSelect,
  DashboardPopover,
  DashboardCheckbox,
  EmployeeForm,
  EmployeeTable,
  Initials,
  ReportCharts,
  downloadEmployees,
  initialEmployees,
  money,
  periods,
  sum,
  type DialogKind,
  type Employee,
  type Mode,
  type Range,
} from "./theme-builder-dashboard-parts";

const navigation = [
  { label: "Dashboard", Icon: House },
  { label: "Sales", Icon: ChartColumn },
  { label: "Team", Icon: Persons },
  { label: "Tasks", Icon: ListCheck },
  { label: "Settings", Icon: Gear },
] as const;
const allColumns = ["ID", "Role", "Worker type"];
const taskLabels = [
  "Review monthly sales report",
  "Prepare team onboarding",
  "Check expense receipts",
];

function useDashboard() {
  const id = useId();
  const [range, setRange] = useState<Range>("Monthly");
  const [mode, setMode] = useState<Mode>("Overview");
  const [employees, setEmployees] = useState(initialEmployees);
  const [query, setQuery] = useState("");
  const [worker, setWorker] = useState("All workers");
  const [sort, setSort] = useState<SortDescriptor>({ column: "name", direction: "ascending" });
  const [columns, setColumns] = useState(allColumns);
  const [tasks, setTasks] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [dialog, setDialog] = useState<{ kind: DialogKind; employeeId?: number }>({ kind: "help" });
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [status, setStatus] = useState("");
  const employeeSearch = useRef<HTMLElement>(null);
  const teamHeading = useRef<HTMLHeadingElement>(null);
  const reportHeading = useRef<HTMLHeadingElement>(null);
  const greeting = useRef<HTMLHeadingElement>(null);
  const nextId = useRef(7);
  const selected = employees.find((employee) => employee.id === dialog.employeeId);
  const report = periods[range];
  const revenue = sum(report.revenue);
  const expenses = sum(report.expenses);
  const visible = employees
    .filter(
      (employee) =>
        (worker === "All workers" || employee.worker === worker) &&
        `${employee.name} ${employee.email} ${employee.role}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
    )
    .toSorted(
      (a, b) =>
        (sort.column === "id" ? a.id - b.id : a.name.localeCompare(b.name)) *
        (sort.direction === "ascending" ? 1 : -1),
    );
  const metrics = [
    { label: "Revenue", value: money(revenue), series: report.revenue },
    { label: "Expenses", value: money(expenses), series: report.expenses },
    { label: "Sales", value: sum(report.sales).toLocaleString("en-US"), series: report.sales },
    {
      label: "Profit",
      value: money(revenue - expenses),
      series: report.revenue.map((value, index) => value - report.expenses[index]!),
    },
  ];
  function choose(kind: DialogKind, employee?: Employee) {
    setDialog({ kind, employeeId: employee?.id });
  }
  function navigate(label: string) {
    setActive(label);
    setNavOpen(false);
    const target =
      label === "Team"
        ? teamHeading.current
        : label === "Sales"
          ? reportHeading.current
          : greeting.current;
    if (label === "Sales") setMode("Sales");
    target?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  }
  function reset() {
    setEmployees(initialEmployees);
    setRange("Monthly");
    setMode("Overview");
    setQuery("");
    setWorker("All workers");
    setSort({ column: "name", direction: "ascending" });
    setColumns(allColumns);
    setTasks([]);
    setNotifications(true);
    nextId.current = 7;
    setStatus("Local sample data reset.");
  }
  function save(data: Omit<Employee, "id">) {
    if (dialog.kind === "edit" && selected) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === selected.id ? { ...employee, ...data } : employee,
        ),
      );
      setStatus(`Saved ${data.name} locally.`);
    } else {
      const employee = { ...data, id: nextId.current++ };
      setEmployees((current) => [...current, employee]);
      setStatus(`Added ${data.name} locally. No invitation was sent.`);
    }
    setOpen(false);
  }
  function remove() {
    if (!selected) return;
    setEmployees((current) => current.filter((employee) => employee.id !== selected.id));
    setStatus(`Removed ${selected.name} locally.`);
    setOpen(false);
  }
  function download() {
    downloadEmployees(visible, columns);
    setStatus(`Downloaded ${visible.length} visible employees.`);
  }
  return {
    id,
    range,
    setRange,
    mode,
    setMode,
    employees,
    query,
    setQuery,
    worker,
    setWorker,
    sort,
    setSort,
    columns,
    setColumns,
    tasks,
    setTasks,
    notifications,
    setNotifications,
    dialog,
    open,
    setOpen,
    navOpen,
    setNavOpen,
    active,
    status,
    employeeSearch,
    teamHeading,
    reportHeading,
    greeting,
    selected,
    visible,
    metrics,
    choose,
    navigate,
    reset,
    save,
    remove,
    download,
  };
}
type DashboardModel = ReturnType<typeof useDashboard>;

function Navigation({ model: m, mobile = false }: { model: DashboardModel; mobile?: boolean }) {
  return (
    <nav
      aria-label={mobile ? "Mobile dashboard navigation" : "Dashboard navigation"}
      {...stylex.props(s.nav)}
    >
      {navigation.map(({ label, Icon }) => {
        const content = (
          <>
            <Icon width={18} height={18} aria-hidden="true" />
            <span {...stylex.props(!mobile && s.railLabel)}>{label}</span>
          </>
        );
        if (label === "Tasks" || label === "Settings")
          return (
            <Modal.Trigger
              key={label}
              onClick={() => {
                m.setNavOpen(false);
                m.choose(label === "Tasks" ? "tasks" : "settings");
              }}
              render={<Button variant="ghost" aria-label={label} xstyle={s.navButton} />}
            >
              {content}
            </Modal.Trigger>
          );
        return (
          <Button
            key={label}
            variant="ghost"
            aria-label={label}
            aria-current={m.active === label ? "location" : undefined}
            xstyle={[s.navButton, m.active === label && s.selected]}
            onClick={() => m.navigate(label)}
          >
            {content}
          </Button>
        );
      })}
    </nav>
  );
}

function Sidebar({ model: m }: { model: DashboardModel }) {
  return (
    <aside aria-label="Dashboard sidebar" {...stylex.props(s.sidebar)}>
      <div {...stylex.props(s.identity)}>
        <Initials name="Alex Morgan" />
        <div {...stylex.props(s.railLabel)}>
          <span {...stylex.props(s.identityName)}>Alex Morgan</span>
          <span {...stylex.props(s.muted)}>Acme workspace</span>
        </div>
      </div>
      <Navigation model={m} />
      <div {...stylex.props(s.sidebarFooter)}>
        <Modal.Trigger
          onClick={() => m.choose("help")}
          render={<Button variant="ghost" aria-label="Help" xstyle={s.navButton} />}
        >
          <CircleQuestion width={18} height={18} aria-hidden="true" />
          <span {...stylex.props(s.railLabel)}>Help</span>
        </Modal.Trigger>
        <Button variant="ghost" aria-label="Reset demo" onClick={m.reset} xstyle={s.navButton}>
          <ArrowRotateLeft width={18} height={18} aria-hidden="true" />
          <span {...stylex.props(s.railLabel)}>Reset demo</span>
        </Button>
        <p {...stylex.props(s.disclosure, s.railLabel)}>Local demo · No backend connected.</p>
      </div>
    </aside>
  );
}

function DashboardHeader({ model: m }: { model: DashboardModel }) {
  const { greeting, employeeSearch } = m;
  return (
    <header {...stylex.props(s.header)}>
      <div {...stylex.props(s.headerTitle)}>
        <div {...stylex.props(s.mobileNav)}>
          <Popover open={m.navOpen} onOpenChange={m.setNavOpen}>
            <Popover.Trigger
              render={<Button isIconOnly size="sm" variant="ghost" aria-label="Open navigation" />}
            >
              <Bars aria-hidden="true" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner>
                <Popover.Popup xstyle={s.popover}>
                  <Popover.Title>Dashboard navigation</Popover.Title>
                  <Navigation model={m} mobile />
                  <Button variant="ghost" onClick={m.reset}>
                    Reset demo
                  </Button>
                  <p {...stylex.props(s.disclosure)}>Local demo · No backend connected.</p>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover>
        </div>
        <h2 ref={greeting} tabIndex={-1} {...stylex.props(s.greeting)}>
          Welcome back, Alex!
        </h2>
      </div>
      <div {...stylex.props(s.actions)}>
        <Button
          size="sm"
          variant="tertiary"
          isIconOnly
          aria-label="Search employees"
          onClick={() => {
            employeeSearch.current?.scrollIntoView({ block: "center" });
            employeeSearch.current?.focus();
          }}
          xstyle={s.iconButton}
        >
          <Magnifier aria-hidden="true" />
        </Button>
        <DashboardPopover
          label="Notifications"
          trigger={<Bell aria-hidden="true" width={16} height={16} />}
        >
          <p {...stylex.props(s.muted)}>
            {m.notifications
              ? `${m.range} sample report is ready. Review sales and expenses below.`
              : "Local notifications are disabled in Settings."}
          </p>
        </DashboardPopover>
        <Modal.Trigger
          onClick={() => m.choose("invite")}
          render={<Button size="sm" xstyle={s.compact} />}
        >
          <PersonPlus aria-hidden="true" width={16} height={16} />
          Invite
        </Modal.Trigger>
      </div>
    </header>
  );
}

function BusinessReport({ model: m }: { model: DashboardModel }) {
  const { reportHeading } = m;
  return (
    <section aria-label="Business report">
      <Tabs
        orientation="horizontal"
        value={m.mode}
        onValueChange={(value) => {
          if (value === "Overview" || value === "Sales" || value === "Expenses") m.setMode(value);
        }}
      >
        <div {...stylex.props(s.toolbar)}>
          <Tabs.ListContainer>
            <Tabs.List aria-label="Report mode" xstyle={s.segmented}>
              {(["Overview", "Sales", "Expenses"] as const).map((item) => (
                <Tabs.Tab key={item} value={item} xstyle={s.compact}>
                  {item}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.ListContainer>
          <div {...stylex.props(s.actions)}>
            <DashboardSelect
              label="Reporting range"
              value={m.range}
              values={["Monthly", "Weekly"]}
              onChange={(value) => {
                if (value === "Monthly" || value === "Weekly") m.setRange(value);
              }}
            />
            <Button size="sm" xstyle={s.compact} onClick={m.download}>
              <ArrowDownToLine aria-hidden="true" width={16} height={16} />
              Download CSV
            </Button>
          </div>
        </div>
        <h3 ref={reportHeading} tabIndex={-1} {...stylex.props(s.srOnly)}>
          Local sample business report · {m.range} · {m.mode}
        </h3>
        {(["Overview", "Sales", "Expenses"] as const).map((mode) => (
          <Tabs.Panel
            key={mode}
            value={mode}
            keepMounted
            xstyle={[s.reportPanel, m.mode !== mode && s.inactiveReport]}
          >
            <dl aria-label={`${m.range} sample business metrics`} {...stylex.props(s.metrics)}>
              {m.metrics.map((metric) => {
                const first = metric.series[0]!;
                const last = metric.series.at(-1)!;
                const change = ((last - first) / first) * 100;
                const up = change >= 0;
                const Direction = up ? ArrowUp : ArrowDown;
                const bad = metric.label === "Expenses" ? up : !up;
                return (
                  <div key={metric.label} {...stylex.props(s.card, s.metric)}>
                    <dt {...stylex.props(s.metricLabel)}>{metric.label}</dt>
                    <dd {...stylex.props(s.metricValue)}>{metric.value}</dd>
                    <dd {...stylex.props(s.change, bad && s.expenseChange)}>
                      <Direction width={12} height={12} aria-hidden="true" />
                      {up ? "+" : ""}
                      {change.toFixed(1)}%{" "}
                      <span {...stylex.props(s.srOnly)}>first to last period</span>
                    </dd>
                  </div>
                );
              })}
            </dl>
            <ReportCharts range={m.range} mode={mode} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </section>
  );
}

function TeamSection({ model: m }: { model: DashboardModel }) {
  const { teamHeading, employeeSearch } = m;
  return (
    <section aria-labelledby={`${m.id}-team`}>
      <h3 id={`${m.id}-team`} ref={teamHeading} tabIndex={-1} {...stylex.props(s.teamTitle)}>
        Employees{" "}
        <span {...stylex.props(s.muted)}>
          ({m.visible.length} of {m.employees.length})
        </span>
      </h3>
      <div {...stylex.props(s.teamHeader)}>
        <div {...stylex.props(s.actions)}>
          <DashboardPopover
            label="Filter"
            trigger={
              <>
                <Funnel aria-hidden="true" width={14} height={14} />
                Filter
              </>
            }
          >
            <DashboardSelect
              label="Worker type"
              value={m.worker}
              values={["All workers", "Full-time", "Contractor"]}
              onChange={m.setWorker}
            />
          </DashboardPopover>
          <DashboardPopover
            label="Sort"
            trigger={
              <>
                <BarsDescendingAlignLeft aria-hidden="true" width={14} height={14} />
                Sort
              </>
            }
          >
            <DashboardSelect
              label="Sort employees"
              value={
                m.sort.column === "id"
                  ? m.sort.direction === "ascending"
                    ? "ID"
                    : "ID descending"
                  : m.sort.direction === "ascending"
                    ? "Name A–Z"
                    : "Name Z–A"
              }
              values={["Name A–Z", "Name Z–A", "ID", "ID descending"]}
              onChange={(value) =>
                m.setSort({
                  column: value.startsWith("ID") ? "id" : "name",
                  direction:
                    value === "Name Z–A" || value === "ID descending" ? "descending" : "ascending",
                })
              }
            />
          </DashboardPopover>
          <DashboardPopover
            label="Columns"
            trigger={
              <>
                <LayoutColumns aria-hidden="true" width={14} height={14} />
                Columns
              </>
            }
          >
            {allColumns.map((column) => (
              <DashboardCheckbox
                key={column}
                label={column}
                checked={m.columns.includes(column)}
                onChange={(checked) =>
                  m.setColumns((current) =>
                    allColumns.filter((item) =>
                      item === column ? checked : current.includes(item),
                    ),
                  )
                }
              />
            ))}
          </DashboardPopover>
        </div>
        <Input
          ref={employeeSearch}
          type="search"
          aria-label="Search employees"
          placeholder="Search employees..."
          value={m.query}
          onValueChange={m.setQuery}
          xstyle={s.search}
        />
      </div>
      <EmployeeTable
        rows={m.visible}
        columns={m.columns}
        onAction={m.choose}
        sortDescriptor={m.sort}
        onSortChange={(sort) => {
          if (sort.column === "id" || sort.column === "name") m.setSort(sort);
        }}
      />
    </section>
  );
}

function DashboardDialog({ model: m }: { model: DashboardModel }) {
  const kind = m.dialog.kind;
  const title =
    kind === "invite"
      ? "Invite employee"
      : kind === "tasks"
        ? "Team tasks"
        : kind === "settings"
          ? "Local settings"
          : kind === "help"
            ? "Dashboard help"
            : `${kind === "view" ? "Employee details" : kind === "edit" ? "Edit employee" : "Remove employee"}${m.selected ? ` · ${m.selected.name}` : ""}`;
  return (
    <Modal.Portal>
      <Modal.Backdrop />
      <Modal.Viewport>
        <Modal.Popup
          size="sm"
          finalFocus={
            kind === "remove" ||
            (kind === "edit" && !m.visible.some((employee) => employee.id === m.dialog.employeeId))
              ? m.teamHeading
              : undefined
          }
        >
          <Modal.Close />
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            <Modal.Description>
              Local demo only. No backend connection or real invitation.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            {(kind === "invite" || kind === "edit") && (
              <EmployeeForm
                key={`${kind}-${m.selected?.id ?? "new"}-${m.open}`}
                employee={kind === "edit" ? m.selected : undefined}
                onSave={m.save}
              />
            )}
            {kind === "view" && m.selected && (
              <dl {...stylex.props(s.fields)}>
                {[
                  { label: "Name", value: m.selected.name },
                  { label: "Email", value: m.selected.email },
                  { label: "Role", value: m.selected.role },
                  { label: "Worker type", value: m.selected.worker },
                ].map((field) => (
                  <div key={field.label}>
                    <dt {...stylex.props(s.muted)}>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {kind === "remove" && m.selected && (
              <div {...stylex.props(s.fields)}>
                <p>Remove {m.selected.name} from the local sample team?</p>
                <Button variant="danger" onClick={m.remove}>
                  Remove employee
                </Button>
              </div>
            )}
            {kind === "tasks" && (
              <div {...stylex.props(s.fields)}>
                <p {...stylex.props(s.muted)}>
                  {m.tasks.length} of {taskLabels.length} sample tasks complete
                </p>
                {taskLabels.map((task) => (
                  <DashboardCheckbox
                    key={task}
                    label={task}
                    checked={m.tasks.includes(task)}
                    onChange={(checked) =>
                      m.setTasks((current) =>
                        checked ? [...current, task] : current.filter((item) => item !== task),
                      )
                    }
                  />
                ))}
              </div>
            )}
            {kind === "settings" && (
              <div {...stylex.props(s.fields)}>
                <DashboardCheckbox
                  label="Enable local notifications"
                  checked={m.notifications}
                  onChange={m.setNotifications}
                />
                <Button variant="secondary" onClick={m.reset}>
                  Reset demo
                </Button>
                <p {...stylex.props(s.muted)}>
                  Settings and records exist only in this preview session.
                </p>
              </div>
            )}
            {kind === "help" && (
              <p>
                Switch report modes and ranges to explore sample business data. Search, filter, sort
                and manage the local employee team. Download exports the visible employees and
                columns. Reset demo restores the original sample. Nothing is sent over the network.
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close render={<Button variant="secondary" />}>Close</Modal.Close>
          </Modal.Footer>
        </Modal.Popup>
      </Modal.Viewport>
    </Modal.Portal>
  );
}

export function ThemeBuilderDashboard() {
  const model = useDashboard();
  return (
    <Modal open={model.open} onOpenChange={model.setOpen}>
      <div {...stylex.props(s.root)}>
        <div {...stylex.props(s.shell)}>
          <Sidebar model={model} />
          <div {...stylex.props(s.main)}>
            <DashboardHeader model={model} />
            <BusinessReport model={model} />
            <TeamSection model={model} />
            <output {...stylex.props(s.status)}>
              {model.status || "Sample business and team data · All changes stay in this preview."}
            </output>
          </div>
        </div>
      </div>
      <DashboardDialog model={model} />
    </Modal>
  );
}
