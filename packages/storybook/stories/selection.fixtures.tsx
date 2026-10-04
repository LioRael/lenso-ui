/**
 * HeroUI v3.2.6 story adaptations. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: explicit native Base UI anatomy, DOM field shells, native value
 * callbacks and popup filtering. These helpers are private story fixtures.
 */
import {
  Autocomplete,
  Avatar,
  Button,
  Chip,
  ComboBox,
  Form,
  Kbd,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Label,
  Select,
  SearchField,
  Separator,
  Spinner,
  Surface,
  TextField,
  FieldError,
} from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { headerStyles } from "@lenso/tokens/header";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { selectionStyles as s } from "./selection.stylex";
import { states, type SelectionItem } from "./selection-data.fixtures";
import { SelectionIcon } from "./selection-icons.fixtures";

export function SelectionStack({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return <div {...stylex.props(s.stack, wide && s.wide)}>{children}</div>;
}
export function ItemContent({ item, compact = false }: { item: SelectionItem; compact?: boolean }) {
  return (
    <div {...stylex.props(s.row, !compact && s.itemRow)}>
      {item.shortcut && (
        <SelectionIcon
          name={
            item.id === "new-file"
              ? "square-plus"
              : item.id === "edit-file"
                ? "pencil"
                : "trash-bin"
          }
          {...stylex.props(s.actionIcon, item.danger && s.dangerIcon)}
        />
      )}
      {item.avatarUrl && (
        <Avatar size="sm" xstyle={compact ? s.smallAvatar : undefined}>
          <Avatar.Image src={item.avatarUrl} alt="" />
          <Avatar.Fallback>{item.fallback}</Avatar.Fallback>
        </Avatar>
      )}
      <div {...stylex.props(s.column)}>
        <span
          {...stylex.props(
            !compact && !!(item.email || item.country || item.description) && labelStyles.label,
          )}
        >
          {item.name}
        </span>
        {!compact && (item.email || item.country || item.description) && (
          <span {...stylex.props(descriptionStyles.description)}>
            {item.email || item.country || item.description}
          </span>
        )}
      </div>
      {item.shortcut && (
        <Kbd variant="light" xstyle={s.shortcut}>
          <Kbd.Abbr keyValue="command" />
          {item.danger && <Kbd.Abbr keyValue="shift" />}
          <Kbd.Content>{item.shortcut}</Kbd.Content>
        </Kbd>
      )}
    </div>
  );
}
export function ExpandIndicator() {
  return <SelectionIcon name="chevrons-expand-vertical" {...stylex.props(s.indicator)} />;
}
function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="m3 3 6 6m0-6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
export interface SelectionFieldProps {
  items?: SelectionItem[];
  label?: string;
  placeholder?: string;
  description?: string;
  multiple?: boolean;
  initial?: string | string[];
  disabled?: boolean;
  disabledIds?: string[];
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  clear?: boolean;
  customValue?: boolean;
  customIndicator?: boolean;
  controlled?: boolean;
  controlledOpen?: boolean;
  required?: boolean;
  name?: string;
  onClear?: () => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}
export function SelectField({
  items = states,
  label = "State",
  placeholder = "Select one",
  description,
  multiple = false,
  initial,
  disabled = false,
  disabledIds = [],
  variant,
  fullWidth,
  clear,
  customValue,
  customIndicator,
  controlled,
  controlledOpen,
  required,
  name,
  onLoadMore,
  loadingMore = false,
}: SelectionFieldProps) {
  const id = useId();
  const [value, setValue] = useState<string | string[] | null>(initial ?? (multiple ? [] : null));
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = items.filter((item) =>
    Array.isArray(value) ? value.includes(item.id) : value === item.id,
  );
  const groups = [...new Set(items.map((item) => item.group))];
  const option = (item: SelectionItem) => (
    <Select.Item key={item.id} value={item.id} disabled={disabledIds.includes(item.id)}>
      <Select.ItemText>
        <ItemContent item={item} />
      </Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
  return (
    <TextField xstyle={[s.field, fullWidth && s.full]}>
      <Label id={`${id}-label`} htmlFor={id} required={required}>
        {label}
      </Label>
      <Select<string, boolean>
        items={items.map((item) => ({ value: item.id, label: item.name }))}
        multiple={multiple}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        variant={variant}
        fullWidth={fullWidth}
        required={required}
        name={name}
        {...(controlledOpen ? { open, onOpenChange: setOpen } : {})}
      >
        <div {...stylex.props(s.row)}>
          <Select.Trigger
            ref={triggerRef}
            id={id}
            aria-labelledby={`${id}-label`}
            aria-describedby={description ? `${id}-description` : undefined}
            xstyle={s.trigger}
          >
            <Select.Value placeholder={placeholder}>
              {customValue && selected.length > 0 ? (
                <span {...stylex.props(s.value)}>
                  {selected.map((item) =>
                    multiple ? (
                      <Chip key={item.id} variant="soft">
                        <ItemContent item={item} compact />
                      </Chip>
                    ) : (
                      <ItemContent key={item.id} item={item} compact />
                    ),
                  )}
                </span>
              ) : undefined}
            </Select.Value>
            <Select.Indicator>{customIndicator ? <ExpandIndicator /> : undefined}</Select.Indicator>
          </Select.Trigger>
          {clear && value !== null && (!Array.isArray(value) || value.length > 0) && (
            <Button
              aria-label="Clear selection"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setValue(multiple ? [] : null);
                triggerRef.current?.focus();
              }}
            >
              Clear
            </Button>
          )}
        </div>
        <Select.Portal>
          <Select.Positioner alignItemWithTrigger={false}>
            <Select.Popover xstyle={s.popup}>
              <Select.List>
                {groups.map((group, index) =>
                  group ? (
                    <Select.Group key={group}>
                      <Select.GroupLabel>{group}</Select.GroupLabel>
                      {items.filter((item) => item.group === group).map(option)}
                      {index < groups.length - 1 && <Select.Separator />}
                    </Select.Group>
                  ) : (
                    items.filter((item) => !item.group).map(option)
                  ),
                )}
                {onLoadMore && <LoadMoreSentinel loading={loadingMore} onLoadMore={onLoadMore} />}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select>
      {required && <FieldError />}
      {description && (
        <p id={`${id}-description`} {...stylex.props(descriptionStyles.description)}>
          {description}
        </p>
      )}
      {controlled && (
        <p {...stylex.props(s.muted)}>
          Selected:{" "}
          {multiple
            ? (Array.isArray(value) ? value.join(", ") : "") || "None"
            : selected[0]?.name || "None"}
        </p>
      )}
      {controlledOpen && (
        <>
          <Button onClick={() => setOpen(!open)}>{open ? "Close" : "Open"} Select</Button>
          <p {...stylex.props(s.muted)}>Select is {open ? "open" : "closed"}</p>
        </>
      )}
    </TextField>
  );
}

export interface SearchPickerProps extends SelectionFieldProps {
  popupSearch?: boolean;
  inputPlaceholder?: string;
  controlledInput?: boolean;
  menuTrigger?: "focus" | "input" | "manual";
  emptyText?: string;
  emailValue?: boolean;
  virtualized?: boolean;
  asynchronous?: "characters" | "location";
  customValueAllowed?: boolean;
  customFilter?: boolean;
  onSelection?: (selected: SelectionItem[]) => void;
}
export function SearchPicker({
  popupSearch = false,
  items = [],
  label = "Favorite Animal",
  placeholder = "Select one",
  inputPlaceholder = "Search animals...",
  description,
  multiple = false,
  initial,
  disabled = false,
  disabledIds = [],
  variant,
  fullWidth,
  clear,
  customValue,
  customIndicator,
  controlled,
  controlledInput,
  controlledOpen,
  required,
  name,
  menuTrigger = "focus",
  emptyText = "No results found",
  emailValue,
  virtualized = false,
  asynchronous,
  customFilter,
  customValueAllowed,
  onClear,
  onSelection,
}: SearchPickerProps) {
  const Picker = popupSearch ? Autocomplete : ComboBox;
  const ChipsScope = multiple ? Picker.Chips : Fragment;
  const id = useId();
  const [value, setValue] = useState<SelectionItem | SelectionItem[] | null>(() => {
    if (multiple)
      return items.filter((item) => Array.isArray(initial) && initial.includes(item.id));
    return items.find((item) => item.id === initial) ?? null;
  });
  const [input, setInput] = useState(() =>
    !popupSearch && !multiple && typeof initial === "string"
      ? (items.find((item) => item.id === initial)?.name ?? "")
      : "",
  );
  const [customItems, setCustomItems] = useState<SelectionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const { contains } = Picker.useFilter({ sensitivity: "base" });
  const asyncList = useCharacterList(asynchronous === "characters", input);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (asynchronous !== "location") return;
    // oxlint-disable-next-line react/set-state-in-effect -- Each query transition restarts the cancellable search simulation, including revisited queries.
    setSearching(true);
    const timeout = setTimeout(() => setSearching(false), 300);
    return () => clearTimeout(timeout);
  }, [asynchronous, input]);
  const allItems = useMemo(
    () => (asynchronous === "characters" ? asyncList.items : [...items, ...customItems]),
    [asynchronous, asyncList.items, items, customItems],
  );
  const commitCustom = () => {
    if (!customValueAllowed || disabled || !input.trim()) return;
    const text = input.trim();
    const existing = allItems.find((item) => item.name.toLowerCase() === text.toLowerCase());
    const item = existing ?? { id: text, name: text };
    if (!existing) setCustomItems((previous) => [...previous, item]);
    setValue(item);
    setInput(item.name);
    setOpen(false);
  };
  const filtered = useMemo(() => {
    const query =
      !popupSearch && !multiple && value && !Array.isArray(value) && input === value.name
        ? ""
        : input;
    return asynchronous === "characters"
      ? allItems
      : allItems.filter((item) =>
          customFilter
            ? item.name.toLowerCase().includes(query.toLowerCase())
            : contains(emailValue ? (item.email ?? item.name) : item.name, query) ||
              (virtualized && contains(item.email ?? "", query)),
        );
  }, [
    allItems,
    input,
    contains,
    emailValue,
    virtualized,
    asynchronous,
    customFilter,
    popupSearch,
    multiple,
    value,
  ]);
  const selected = value === null ? [] : Array.isArray(value) ? value : [value];
  const groups = [...new Set(filtered.map((item) => item.group))];
  const start = virtualized ? Math.max(0, Math.floor(scroll / 50) - 3) : 0;
  const visible = virtualized ? filtered.slice(start, start + 15) : filtered;
  const option = (item: SelectionItem, index = filtered.indexOf(item)) => (
    <Picker.Item key={item.id} value={item} index={index} disabled={disabledIds.includes(item.id)}>
      <ItemContent item={item} />
      <Picker.ItemIndicator />
    </Picker.Item>
  );
  const chips = multiple && (
    <div {...stylex.props(s.value)}>
      <Picker.Value>
        {(values: SelectionItem[]) =>
          values.length === 0 ? (
            <span {...stylex.props(s.muted)}>
              {popupSearch ? placeholder : "No animals selected"}
            </span>
          ) : (
            values.map((item) => (
              <Picker.Chip key={item.id}>
                {emailValue ? item.email : <ItemContent item={item} compact />}
                <Picker.ChipRemove aria-label={`Remove ${emailValue ? item.email : item.name}`}>
                  <RemoveIcon />
                </Picker.ChipRemove>
              </Picker.Chip>
            ))
          )
        }
      </Picker.Value>
    </div>
  );
  const searchInput = (
    <Picker.Input
      id={popupSearch ? `${id}-search` : id}
      aria-label={popupSearch ? `Search ${label.toLowerCase()}` : undefined}
      placeholder={inputPlaceholder}
      aria-describedby={description ? `${id}-description` : undefined}
      onFocus={() => {
        if (!popupSearch && menuTrigger === "focus") setOpen(true);
      }}
      onKeyDown={(event) => {
        if (
          customValueAllowed &&
          event.key === "Enter" &&
          !event.currentTarget.getAttribute("aria-activedescendant")
        ) {
          event.preventDefault();
          commitCustom();
        }
      }}
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Element && event.relatedTarget.closest("[role=option]"))
        )
          commitCustom();
      }}
    />
  );
  return (
    <TextField xstyle={[s.field, fullWidth && s.full, virtualized && s.userWidth]}>
      <Picker<SelectionItem, boolean>
        items={allItems}
        filteredItems={filtered}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onSelection?.(next === null ? [] : Array.isArray(next) ? next : [next]);
          if (popupSearch || multiple) setInput("");
        }}
        itemToStringLabel={(item) => (emailValue ? (item.email ?? item.name) : item.name)}
        itemToStringValue={(item) => item.id}
        isItemEqualToValue={(a, b) => a.id === b.id}
        multiple={multiple}
        disabled={disabled}
        required={required}
        name={name ?? (customValueAllowed ? "animal" : undefined)}
        variant={variant}
        fullWidth={fullWidth}
        inputValue={input}
        onInputValueChange={(next) => {
          setInput(next);
          setScroll(0);
        }}
        open={open}
        onOpenChange={(next, details) => {
          if (!popupSearch && menuTrigger === "manual" && next && details.reason === "input-change")
            return;
          setOpen(next);
        }}
        openOnInputClick={popupSearch || menuTrigger === "focus"}
        virtualized={virtualized}
        onItemHighlighted={(item) => {
          if (!virtualized || !item || !listRef.current) return;
          const index = filtered.findIndex((candidate) => candidate.id === item.id);
          if (index < 0) return;
          const top = index * 50;
          if (top < listRef.current.scrollTop || top + 50 > listRef.current.scrollTop + 400) {
            listRef.current.scrollTop = Math.max(0, top - 350);
            setScroll(listRef.current.scrollTop);
          }
        }}
      >
        <Picker.Label htmlFor={popupSearch ? `${id}-trigger` : id}>
          {label}
          {required && (
            <span aria-hidden="true" {...stylex.props(s.requiredIndicator)}>
              *
            </span>
          )}
        </Picker.Label>
        <ChipsScope>
          <div ref={anchorRef} {...stylex.props(s.column, s.full)}>
            {popupSearch ? (
              <div {...stylex.props(s.row)}>
                <Picker.Trigger id={`${id}-trigger`} xstyle={s.trigger}>
                  {multiple ? (
                    selected.length ? (
                      `${selected.length} selected`
                    ) : (
                      placeholder
                    )
                  ) : selected[0] ? (
                    customValue ? (
                      <ItemContent item={selected[0]} compact />
                    ) : (
                      selected[0].name
                    )
                  ) : (
                    placeholder
                  )}
                  <Picker.Indicator>
                    {customIndicator ? <ExpandIndicator /> : undefined}
                  </Picker.Indicator>
                </Picker.Trigger>
                {clear && (
                  <Picker.ClearButton aria-label="Clear selection" onClick={onClear}>
                    <RemoveIcon />
                  </Picker.ClearButton>
                )}
              </div>
            ) : (
              <Picker.InputGroup>
                {searchInput}
                <Picker.Trigger aria-label={`Show ${label.toLowerCase()} options`}>
                  {customIndicator ? <ExpandIndicator /> : <Picker.Indicator />}
                </Picker.Trigger>
              </Picker.InputGroup>
            )}
            {chips}
          </div>
          <Picker.Portal>
            <Picker.Positioner anchor={anchorRef}>
              <Picker.Popover xstyle={s.popup}>
                {popupSearch && (
                  <Picker.InputGroup xstyle={s.search}>
                    <SearchField.SearchIcon />
                    {searchInput}
                    {asynchronous === "characters" && asyncList.loading ? (
                      <Spinner size="sm" />
                    ) : (
                      input && (
                        <Button
                          aria-label="Clear search"
                          variant="ghost"
                          isIconOnly
                          size="sm"
                          onClick={() => setInput("")}
                        >
                          <RemoveIcon />
                        </Button>
                      )
                    )}
                  </Picker.InputGroup>
                )}
                <Picker.Empty>{searching ? "Searching..." : emptyText}</Picker.Empty>
                <Picker.List
                  ref={listRef}
                  xstyle={s.list}
                  style={virtualized ? { height: 400 } : undefined}
                  onScroll={(event) => {
                    if (virtualized) setScroll(event.currentTarget.scrollTop);
                  }}
                >
                  {virtualized ? (
                    <div style={{ height: filtered.length * 50, position: "relative" }}>
                      {visible.map((item, offset) => (
                        <div
                          key={item.id}
                          data-window-index={start + offset}
                          style={{
                            position: "absolute",
                            top: (start + offset) * 50,
                            height: 50,
                            width: "100%",
                          }}
                        >
                          {option(item, start + offset)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    groups.map((group, index) =>
                      group ? (
                        <Picker.Group key={group}>
                          <Picker.GroupLabel>{group}</Picker.GroupLabel>
                          {filtered
                            .filter((item) => item.group === group)
                            .map((item) => option(item))}
                          {index < groups.length - 1 && <Picker.Separator />}
                        </Picker.Group>
                      ) : (
                        filtered.filter((item) => !item.group).map((item) => option(item))
                      ),
                    )
                  )}
                  {asynchronous === "characters" && !popupSearch && asyncList.cursor && (
                    <LoadMoreSentinel loading={asyncList.loading} onLoadMore={asyncList.loadMore} />
                  )}
                </Picker.List>
                {asyncList.error && asynchronous === "characters" && (
                  <p role="alert">{asyncList.error}</p>
                )}
              </Picker.Popover>
            </Picker.Positioner>
          </Picker.Portal>
        </ChipsScope>
      </Picker>
      {required && <FieldError />}
      {description && (
        <p id={`${id}-description`} {...stylex.props(descriptionStyles.description)}>
          {description}
        </p>
      )}
      {controlled && (
        <p {...stylex.props(s.muted)}>
          Selected:{" "}
          {multiple
            ? selected.map((item) => item.id).join(", ") || "None"
            : selected[0]?.name || "None"}
        </p>
      )}
      {controlledInput && <p {...stylex.props(s.muted)}>Input value: {input || "(empty)"}</p>}
      {controlledOpen && (
        <>
          <Button onClick={() => setOpen(!open)}>{open ? "Close" : "Open"} Autocomplete</Button>
          <p {...stylex.props(s.muted)}>Autocomplete is {open ? "open" : "closed"}</p>
        </>
      )}
    </TextField>
  );
}

interface AsyncResponse {
  results: { name: string }[];
  next?: string | null;
}
function LoadMoreSentinel({ loading, onLoadMore }: { loading: boolean; onLoadMore: () => void }) {
  const ref = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root: node.closest("[data-slot=select-popover]") ?? node.parentElement },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, onLoadMore]);
  return (
    <output ref={ref} {...stylex.props(s.loadMore)}>
      <Spinner size="sm" />
      <span {...stylex.props(s.muted)}>Loading more...</span>
    </output>
  );
}
function useCharacterList(enabled: boolean, query: string) {
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(async (url: string, append: boolean, current: number) => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url.replace(/^http:\/\//i, "https://"), {
        signal: abort.signal,
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const json: AsyncResponse = await response.json();
      if (current !== generation.current || abort.signal.aborted) return;
      const next = json.results.map((item) => ({ id: item.name, name: item.name }));
      setItems((previous) =>
        append
          ? [...previous, ...next.filter((item) => !previous.some((old) => old.id === item.id))]
          : next,
      );
      setCursor(json.next ?? null);
    } catch (cause) {
      if (!abort.signal.aborted && current === generation.current)
        setError(cause instanceof Error ? cause.message : "Loading failed");
    } finally {
      if (!abort.signal.aborted && current === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const current = ++generation.current;
    // oxlint-disable-next-line react/set-state-in-effect -- Query transitions reset the abortable external request; generation guards reject stale results.
    setItems([]);
    setCursor(null);
    void load(
      `https://swapi.py4e.com/api/people/?search=${encodeURIComponent(query)}`,
      false,
      current,
    );
    return () => controller.current?.abort();
  }, [enabled, query, load]);
  return {
    items,
    cursor,
    loading,
    error,
    loadMore: () => {
      if (cursor && !loading) void load(cursor, true, generation.current);
    },
  };
}

export function PokemonSelect() {
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [cursor, setCursor] = useState<string | null>("https://pokeapi.co/api/v2/pokemon");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const loadPage = useCallback(async (url: string) => {
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    try {
      const response = await fetch(url, { signal: abort.signal });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const json: AsyncResponse = await response.json();
      if (abort.signal.aborted) return;
      setItems((previous) => [
        ...previous,
        ...json.results.map((item) => ({ id: item.name, name: item.name })),
      ]);
      setCursor(json.next ?? null);
    } catch (cause) {
      if (!abort.signal.aborted)
        setError(cause instanceof Error ? cause.message : "Loading failed");
    } finally {
      if (!abort.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Mount starts an external request; loadPage owns pending state and cleanup aborts it.
    void loadPage("https://pokeapi.co/api/v2/pokemon");
    return () => controller.current?.abort();
  }, [loadPage]);
  return (
    <SelectionStack>
      <SelectField
        items={items}
        label="Pick a Pokemon"
        placeholder="Select a Pokemon"
        loadingMore={loading}
        onLoadMore={
          cursor
            ? () => {
                if (!loading) void loadPage(cursor);
              }
            : undefined
        }
      />
      {error && <p role="alert">{error}</p>}
    </SelectionStack>
  );
}
export function SelectionForm({ children }: { children: ReactNode }) {
  const [submitted, setSubmitted] = useState<Record<string, FormDataEntryValue> | null>(null);
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(Object.fromEntries(new FormData(event.currentTarget)));
      }}
      xstyle={[s.stack, s.form]}
    >
      {children}
      <Button type="submit">Submit</Button>
      {submitted && (
        <output aria-live="polite">Form submitted successfully! {JSON.stringify(submitted)}</output>
      )}
    </Form>
  );
}
export function CollectionStory({
  items,
  multiple = false,
  controlled = false,
  disabledIds = [],
  actions = false,
  customCheck = false,
  virtualized = false,
  bare = false,
}: {
  items: SelectionItem[];
  multiple?: boolean;
  controlled?: boolean;
  disabledIds?: string[];
  actions?: boolean;
  customCheck?: boolean;
  virtualized?: boolean;
  bare?: boolean;
}) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(controlled ? ["1"] : []));
  const [action, setAction] = useState("");
  const groups = [...new Set(items.map((item) => item.group))];
  const renderItem = (item: SelectionItem) => (
    <ListBoxItem
      itemKey={item.id}
      textValue={item.name}
      key={item.id}
      variant={item.danger ? "danger" : "default"}
    >
      <ItemContent item={item} />
      {!actions && (
        <ListBoxItem.Indicator>
          {customCheck
            ? ({ isSelected }) =>
                isSelected ? (
                  <SelectionIcon name="check" {...stylex.props(s.icon, s.accentIcon)} />
                ) : null
            : undefined}
        </ListBoxItem.Indicator>
      )}
    </ListBoxItem>
  );
  const list = (
    <ListBox
      aria-label={
        virtualized ? "Virtualized list with 1000 items" : actions ? "File actions" : "Users"
      }
      items={items.map((item) => ({ key: item.id, textValue: item.name }))}
      selectionMode={actions || virtualized ? "none" : multiple ? "multiple" : "single"}
      selectedKeys={controlled ? selected : undefined}
      onSelectionChange={(keys) => setSelected(new Set(Array.from(keys, String)))}
      disabledKeys={new Set(disabledIds)}
      virtualized={virtualized ? { height: 400, rowHeight: 50 } : undefined}
      onAction={actions ? (key) => setAction(`Selected item: ${key}`) : undefined}
      xstyle={[bare ? s.smallList : s.full, actions && s.actionList]}
    >
      {virtualized
        ? (collectionItem) => renderItem(items.find((item) => item.id === collectionItem.key)!)
        : groups.map((group, index) =>
            group ? (
              <ListBoxSection key={group} aria-label={group}>
                <h3 {...stylex.props(headerStyles.root)}>{group}</h3>
                {items.filter((item) => item.group === group).map(renderItem)}
                {index < groups.length - 1 && <Separator />}
              </ListBoxSection>
            ) : (
              items.filter((item) => !item.group).map(renderItem)
            ),
          )}
    </ListBox>
  );
  return (
    <SelectionStack>
      {bare || virtualized ? (
        <div {...stylex.props(virtualized && s.userWidth)}>{list}</div>
      ) : (
        <Surface xstyle={s.surface}>{list}</Surface>
      )}
      {controlled && (
        <p {...stylex.props(s.muted)}>Selected: {Array.from(selected).join(", ") || "None"}</p>
      )}
      {action && <output aria-live="polite">{action}</output>}
    </SelectionStack>
  );
}
