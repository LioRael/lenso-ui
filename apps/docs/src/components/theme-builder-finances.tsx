"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Chip, Button, Input, Modal, Popover, Table, type SortDescriptor } from "@lenso/ui";
import {
  House,
  ChartColumn,
  ListCheck,
  CircleQuestion,
  ArrowRotateLeft,
  Bars,
} from "@gravity-ui/icons";
import { finances as s } from "../styles/theme-builder-finances.stylex";
import {
  AddTransaction,
  ChoiceSelect,
  filterChoices,
  money,
  months,
  sampleTransactions,
  totals,
  type Month,
  type Transaction,
  type TransactionType,
} from "./theme-builder-finances-parts";
import { ExpenseCategories } from "./theme-builder-finances-categories";
import { usePreviewActivity } from "./preview-activity";

function BalanceHistory({ rows, month }: { rows: Transaction[]; month: Month }) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 600, height: 270 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 40) {
        setSize({
          width: Math.max(1, Math.round(entry.contentRect.width)),
          height: Math.max(1, Math.round(entry.contentRect.height)),
        });
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const entries = rows
    .toSorted((a, b) => a.day - b.day || a.id.localeCompare(b.id))
    .reduce(
      (history, row) => [
        ...history,
        {
          day: row.day,
          balance:
            history[history.length - 1]!.balance + (row.type === "income" ? row.cents : -row.cents),
        },
      ],
      [{ day: 1, balance: month.opening }],
    );
  const balance = entries[entries.length - 1]!.balance;
  const points = [...entries, { day: month.days, balance }];
  const low = Math.min(...points.map((point) => point.balance));
  const high = Math.max(...points.map((point) => point.balance));
  const range = Math.max(10000, high - low);
  const floor = low - range * 0.1;
  const ceiling = high + range * 0.1;
  const x = (day: number) => 55 + ((day - 1) / (month.days - 1)) * Math.max(1, size.width - 67);
  const y = (value: number) =>
    size.height - 26 - ((value - floor) / (ceiling - floor)) * (size.height - 42);
  return (
    <figure {...stylex.props(s.card, s.chart)}>
      <figcaption {...stylex.props(s.sectionHeading)}>Balance history</figcaption>
      <div {...stylex.props(s.chartValue)}>
        <bdi>{money(balance)}</bdi>
      </div>
      <p {...stylex.props(s.note)}>
        {month.label} · Opening balance {money(month.opening)}
      </p>
      <svg
        ref={ref}
        viewBox={`0 0 ${size.width} ${size.height}`}
        // SVG retains its title and detailed chronological description.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        {...stylex.props(s.plot)}
      >
        <title id={`${id}-title`}>{`Balance history · ${month.label}`}</title>
        <desc id={`${id}-desc`}>
          {points.map((point) => `${month.short} ${point.day}: ${money(point.balance)}`).join("; ")}
        </desc>
        {[0, 1, 2, 3, 4].map((step) => {
          const value = floor + ((ceiling - floor) * step) / 4;
          return (
            <g key={step}>
              <line
                x1={55}
                x2={size.width - 12}
                y1={y(value)}
                y2={y(value)}
                {...stylex.props(s.gridLine)}
              />
              <text x={48} y={y(value) + 4} textAnchor="end" {...stylex.props(s.tick)}>
                {(value / 100000).toFixed(1)}k
              </text>
            </g>
          );
        })}
        <polyline
          points={points.map((point) => `${x(point.day)},${y(point.balance)}`).join(" ")}
          {...stylex.props(s.series)}
        />
        {[1, 10, 20, month.days].map((day) => (
          <text
            key={day}
            x={x(day)}
            y={size.height - 6}
            textAnchor={day === month.days ? "end" : day === 1 ? "start" : "middle"}
            {...stylex.props(s.tick)}
          >
            {month.short} {day}
          </text>
        ))}
      </svg>
      <p {...stylex.props(s.note)}>
        Started at {money(month.opening)}; ended at {money(balance)}. Each entry changes the
        balance.
      </p>
    </figure>
  );
}

function TransactionTable({
  rows,
  month,
  sort,
  onSort,
}: {
  rows: Transaction[];
  month: Month;
  sort: SortDescriptor;
  onSort: (sort: SortDescriptor) => void;
}) {
  return (
    <Table.Root xstyle={s.tableRoot}>
      <Table.ScrollContainer
        aria-label="Recent transactions table scroll area"
        // Only the inner horizontal viewport needs a keyboard tab stop.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        xstyle={s.tableScroll}
      >
        <Table.Content
          aria-label={`Recent transactions · ${month.label}`}
          sortDescriptor={sort}
          onSortChange={onSort}
          xstyle={s.table}
        >
          <Table.Header>
            <Table.Column columnKey="day" width={100} allowsSorting xstyle={s.columnHeading}>
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Date
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column
              columnKey="description"
              width="1fr"
              minWidth={200}
              allowsSorting
              xstyle={s.columnHeading}
            >
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Description
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column columnKey="type" width={120} allowsSorting xstyle={s.columnHeading}>
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Type
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column
              columnKey="cents"
              width={150}
              allowsSorting
              xstyle={[s.columnHeading, s.amount]}
            >
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection} xstyle={s.amountHeading}>
                  Amount
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Collection items={rows.map((row) => ({ ...row, key: row.id }))}>
              {(row) => (
                <Table.Row key={row.id} itemKey={row.id} xstyle={s.row}>
                  <Table.Cell xstyle={[s.cell, s.date]}>
                    {month.short} {row.day}
                  </Table.Cell>
                  <Table.Cell xstyle={[s.cell, s.description]}>{row.description}</Table.Cell>
                  <Table.Cell xstyle={s.cell}>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={row.type === "income" ? "success" : "default"}
                      xstyle={s.type}
                    >
                      <Chip.Label>{row.type === "income" ? "Income" : "Expense"}</Chip.Label>
                    </Chip>
                  </Table.Cell>
                  <Table.Cell xstyle={[s.cell, s.amount]}>
                    <bdi>
                      {row.type === "income" ? "+" : "−"}
                      {money(row.cents)}
                    </bdi>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
            {!rows.length && (
              <Table.Row itemKey="empty" xstyle={s.row}>
                <Table.Cell colSpan={4} xstyle={s.cell}>
                  No matching transactions. Change the filter or search.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table.Root>
  );
}

export function ThemeBuilderFinances() {
  const activity = usePreviewActivity();
  const id = useId();
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [sort, setSort] = useState<SortDescriptor>({ column: "day", direction: "descending" });
  const [navOpen, setNavOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [active, setActive] = useState("Overview");
  const overview = useRef<HTMLHeadingElement>(null);
  const history = useRef<HTMLElement>(null);
  const recent = useRef<HTMLHeadingElement>(null);
  const month = months.find((item) => item.value === selectedMonth) ?? months[0];
  const monthRows = transactions.filter((row) => row.month === month.value);
  const summary = totals(monthRows);
  const balance = month.opening + summary.income - summary.expense;
  const remaining = month.budget - summary.expense;
  const categories = Array.from(
    new Set(monthRows.filter((row) => row.type === "expense").map((row) => row.category)),
  )
    .map((label) => ({
      label,
      cents: totals(monthRows.filter((row) => row.category === label)).expense,
    }))
    .toSorted((a, b) => b.cents - a.cents || a.label.localeCompare(b.label));
  const visible = monthRows
    .filter(
      (row) =>
        (filter === "all" || row.type === filter) &&
        (!category || row.category === category) &&
        row.description
          .toLocaleLowerCase("en-US")
          .includes(query.trim().toLocaleLowerCase("en-US")),
    )
    .toSorted((a, b) => {
      const column = sort.column;
      const delta =
        column === "day"
          ? a.day - b.day
          : column === "cents"
            ? (a.type === "income" ? a.cents : -a.cents) -
              (b.type === "income" ? b.cents : -b.cents)
            : column === "type"
              ? a.type.localeCompare(b.type)
              : a.description.localeCompare(b.description);
      return delta * (sort.direction === "ascending" ? 1 : -1) || a.id.localeCompare(b.id);
    });
  function clearFilters() {
    setFilter("all");
    setQuery("");
    setCategory(null);
  }
  function add(transaction: Omit<Transaction, "id">) {
    setTransactions((current) => [
      ...current,
      { ...transaction, id: `local-${current.length.toString().padStart(6, "0")}` },
    ]);
    clearFilters();
    setAnnouncement(
      `Added ${transaction.description}, ${money(transaction.cents)} ${transaction.type}, to ${month.label}.`,
    );
  }
  function reset() {
    setTransactions(sampleTransactions());
    setSelectedMonth(months[0].value);
    clearFilters();
    setSort({ column: "day", direction: "descending" });
    setAnnouncement("Local sample data reset.");
  }
  function navigate(label: string) {
    setActive(label);
    setNavOpen(false);
    const target =
      label === "Transactions"
        ? recent.current
        : label === "History"
          ? history.current
          : overview.current;
    target?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  }
  const navigation = (mobile = false) => (
    <nav
      aria-label={mobile ? "Mobile finances navigation" : "Finances navigation"}
      {...stylex.props(s.nav)}
    >
      {[
        { label: "Overview", Icon: House },
        { label: "History", Icon: ChartColumn },
        { label: "Transactions", Icon: ListCheck },
      ].map(({ label, Icon }) => (
        <Button
          key={label}
          variant="ghost"
          aria-label={label}
          aria-current={active === label ? "location" : undefined}
          onClick={() => navigate(label)}
          xstyle={[s.navButton, active === label && s.selected]}
        >
          <Icon width={18} height={18} aria-hidden="true" />
          <span {...stylex.props(!mobile && s.railLabel)}>{label}</span>
        </Button>
      ))}
    </nav>
  );
  const help = (
    <Modal
      open={activity.active && helpOpen}
      onOpenChange={setHelpOpen}
      onOpenChangeComplete={(open) => {
        if (!open) setHelpOpen(false);
      }}
    >
      <Modal.Trigger render={<Button variant="tertiary" size="sm" aria-label="Ledger help" />}>
        <CircleQuestion width={18} height={18} aria-hidden="true" />
        <span {...stylex.props(s.railLabel)}>Ledger help</span>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup size="sm" finalFocus={!activity.active ? activity.returnFocus : undefined}>
            <Modal.Header>
              <Modal.Title>Local studio ledger</Modal.Title>
              <Modal.Description>
                Sample data only. Not connected to a bank. No payments or transfers are made.
              </Modal.Description>
            </Modal.Header>
            <Modal.Body>
              Choose a month to review its opening balance, income, expenses and budget. Category
              buttons filter transactions. Added expenses appear under Other. Reset sample restores
              all three months; reloading also discards changes.
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button variant="secondary" />}>Close</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
  return (
    <section aria-labelledby={`${id}-heading`} {...stylex.props(s.root)}>
      <aside {...stylex.props(s.sidebar)}>
        <div {...stylex.props(s.identity)}>
          <Avatar size="sm">
            <Avatar.Fallback>ST</Avatar.Fallback>
          </Avatar>
          <div {...stylex.props(s.railLabel)}>
            <strong>Studio account</strong>
            <p {...stylex.props(s.note)}>Personal / studio ledger</p>
          </div>
        </div>
        {navigation()}
        <div {...stylex.props(s.sidebarFooter)}>
          {help}
          <Button variant="tertiary" size="sm" aria-label="Reset sample" onClick={reset}>
            <ArrowRotateLeft width={18} height={18} aria-hidden="true" />
            <span {...stylex.props(s.railLabel)}>Reset sample</span>
          </Button>
          <p {...stylex.props(s.note, s.railLabel)}>
            Sample data · Local only · Not connected to a bank
          </p>
        </div>
      </aside>
      <div {...stylex.props(s.main)}>
        <header {...stylex.props(s.header)}>
          <div {...stylex.props(s.headerTitle)}>
            <div {...stylex.props(s.mobileNav)}>
              <Popover
                open={activity.active && navOpen}
                onOpenChange={setNavOpen}
                onOpenChangeComplete={(open) => {
                  if (!open) setNavOpen(false);
                }}
              >
                <Popover.Trigger
                  render={
                    <Button size="sm" variant="tertiary" aria-label="Open finances navigation" />
                  }
                >
                  <Bars width={18} height={18} aria-hidden="true" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={8}>
                    <Popover.Popup finalFocus={!activity.active ? activity.returnFocus : undefined}>
                      <Popover.Title>Finances navigation</Popover.Title>
                      {navigation(true)}
                      <Button size="sm" variant="tertiary" onClick={reset}>
                        Reset sample
                      </Button>
                      <p {...stylex.props(s.note)}>
                        Sample data · Local only · Not connected to a bank
                      </p>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover>
            </div>
            <h2 id={`${id}-heading`} ref={overview} tabIndex={-1} {...stylex.props(s.title)}>
              Your studio finances
            </h2>
          </div>
          <AddTransaction month={month} onAdd={add} />
        </header>
        <dl {...stylex.props(s.summary)}>
          {[
            {
              label: "Balance",
              value: balance,
              change: `${balance >= month.opening ? "+" : "−"}${((Math.abs(balance - month.opening) / month.opening) * 100).toFixed(1)}% net`,
              bad: balance < month.opening,
            },
            {
              label: "Income",
              value: summary.income,
              change: `${monthRows.filter((row) => row.type === "income").length} entries`,
              bad: false,
            },
            {
              label: "Expenses",
              value: summary.expense,
              change: `${monthRows.filter((row) => row.type === "expense").length} entries`,
              bad: true,
            },
            {
              label: "Budget remaining",
              value: remaining,
              change: remaining >= 0 ? "Within budget" : "Over budget",
              bad: remaining < 0,
            },
          ].map((item) => (
            <div key={item.label} {...stylex.props(s.card, s.stat)}>
              <dt {...stylex.props(s.metricLabel)}>{item.label}</dt>
              <dd {...stylex.props(s.statValue)}>
                <bdi>{money(item.value)}</bdi>
              </dd>
              <dd {...stylex.props(s.change, item.bad && s.dangerChange)}>{item.change}</dd>
            </div>
          ))}
        </dl>
        <section
          ref={history}
          tabIndex={-1}
          aria-label="Monthly history and expense categories"
          {...stylex.props(s.overview)}
        >
          <BalanceHistory rows={monthRows} month={month} />
          <ExpenseCategories
            items={categories}
            selected={category}
            expense={summary.expense}
            month={month}
            onSelect={(next) => {
              setCategory(next);
              setFilter(next ? "expense" : "all");
              setQuery("");
              setAnnouncement("");
            }}
            onClear={clearFilters}
          />
        </section>
        <div {...stylex.props(s.toolbar)}>
          <h3 ref={recent} tabIndex={-1} {...stylex.props(s.sectionHeading)}>
            Recent transactions
          </h3>
          <div {...stylex.props(s.controls)}>
            <ChoiceSelect
              label="Month"
              value={selectedMonth}
              items={months}
              onChange={(next) => {
                setSelectedMonth(next);
                setCategory(null);
                setAnnouncement("");
              }}
            />
            <ChoiceSelect
              label="Transaction type filter"
              value={filter}
              items={filterChoices}
              onChange={(next) => {
                setFilter(next);
                setCategory(null);
                setAnnouncement("");
              }}
            />
            <div {...stylex.props(s.field, s.search)}>
              <label htmlFor={`${id}-search`} {...stylex.props(s.label)}>
                Search transactions
              </label>
              <Input
                id={`${id}-search`}
                type="search"
                fullWidth
                value={query}
                onValueChange={(next) => {
                  setQuery(next);
                  setAnnouncement("");
                }}
                placeholder="Search descriptions"
              />
            </div>
          </div>
        </div>
        <output aria-live="polite" {...stylex.props(s.results)}>
          {announcement ||
            `${visible.length} of ${monthRows.length} transactions shown${category ? ` · ${category}` : ""}`}
        </output>
        <TransactionTable rows={visible} month={month} sort={sort} onSort={setSort} />
        <p {...stylex.props(s.footnote)}>
          Sample data · Local only · Not connected to a bank. USD throughout. Changes stay until
          reset or reload.
        </p>
      </div>
    </section>
  );
}
