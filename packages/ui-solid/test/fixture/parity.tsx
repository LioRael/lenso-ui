import {
  Button,
  Calendar,
  ContextMenu,
  CalendarYearPicker,
  DateField,
  DatePicker,
  Table,
  Tag,
  TagGroup,
  Toast,
  createToaster,
} from "@lenso/ui-solid";
import { useListData, useOverlayState, useIsHydrated } from "@lenso/ui-solid/hooks";
import { createSignal, For } from "solid-js";
export function Parity() {
  const labels = useListData({ initialItems: [{ id: 1 }] });
  const overlay = useOverlayState();
  const hydrated = useIsHydrated();
  const records = Array.from({ length: 100 }, (_, key) => ({
    key,
    label: "Record " + (key + 1),
    disabled: key === 98,
  }));
  const [count, setCount] = createSignal(0),
    [drop, setDrop] = createSignal(""),
    [month, setMonth] = createSignal("2025-05");
  const [tags, setTags] = createSignal(
    ["Alpha", "Beta", "Gamma"].map((textValue) => ({ key: textValue.toLowerCase(), textValue })),
  );
  const [allow, setAllow] = createSignal(false),
    [allowYear, setAllowYear] = createSignal(false);
  const [date, setDate] = createSignal<string | null>("2025-05-10");
  const toaster = createToaster();
  return (
    <>
      <ContextMenu compact>
        <ContextMenu.Trigger>File options</ContextMenu.Trigger>
        <ContextMenu.Content
          preview={<ContextMenu.Preview>File preview</ContextMenu.Preview>}
          bar={<ContextMenu.BarItem>Quick action</ContextMenu.BarItem>}
        >
          <ContextMenu.Item.Checkbox value="details" closeOnSelect={false}>
            Show details
          </ContextMenu.Item.Checkbox>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>Move file</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item>Archive file</ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu>
      <Button
        onClick={() => {
          labels.append({ id: 2 });
          overlay.open();
        }}
      >
        Update local state
      </Button>
      <output aria-label="Local state">
        {[hydrated(), overlay.isOpen, labels.items.length].join("/")}
      </output>
      <DatePicker
        value={date()}
        onValueChange={(value) => setDate(typeof value === "string" ? value : null)}
      >
        <DateField
          value={date()}
          locale="en-US"
          aria-label="Segmented date"
          onValueChange={setDate}
        >
          {(state) => (
            <For each={state.segments} keyed={(part) => part.key}>
              {(part) => <DatePicker.Segment segment={part()} />}
            </For>
          )}
        </DateField>
        <DatePicker.Input aria-label="Picker text" />
      </DatePicker>
      <Table.ScrollContainer style={{ height: "180px" }}>
        <Table.Content
          aria-label="Windowed records"
          selectionMode="multiple"
          onSelectionChange={(v) => setCount(v.size)}
        >
          <Table.Header>
            <Table.Row>
              <Table.Column>Record</Table.Column>
            </Table.Row>
          </Table.Header>
          <Table.Body items={records} virtualized={{ height: 180, rowHeight: 36, overscan: 2 }}>
            {(item) => (
              <Table.Row itemKey={item.key} disabled={item.disabled}>
                <Table.Cell>{item.label}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <output aria-label="Window selection">{count()}</output>
      <Table.Content
        aria-label="Folders"
        treeColumn="name"
        dragAndDrop={{
          onReorder: ({ keys, targetKey, dropPosition }) =>
            setDrop([...keys].join(",") + " " + dropPosition + " " + targetKey),
        }}
      >
        <Table.Body>
          <Table.Row
            itemKey="parent"
            childRows={
              <Table.Row itemKey="child">
                <Table.Cell columnKey="name">Child row</Table.Cell>
              </Table.Row>
            }
          >
            <Table.Cell columnKey="name">
              Parent row <Button data-table-drag="">Drag parent</Button>
            </Table.Cell>
          </Table.Row>
          <Table.Row itemKey="peer">
            <Table.Cell columnKey="name">Peer row</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Content>
      <output aria-label="Last drop">{drop()}</output>
      <TagGroup
        aria-label="Topics"
        items={tags()}
        selectionMode="single"
        onItemsChange={(next) => {
          if (allow()) setTags(next.map(({ key, textValue }) => ({ key: String(key), textValue })));
        }}
      >
        <TagGroup.List>
          {(item) => (
            <Tag itemKey={item.key} textValue={item.textValue}>
              {({ isSelected }) => <span data-tag-selected={isSelected}>{item.textValue}</span>}
            </Tag>
          )}
        </TagGroup.List>
      </TagGroup>
      <Button onClick={() => setAllow(true)}>Allow tag removal</Button>
      <Calendar
        month={month()}
        min="2023-08-01"
        max="2027-12-31"
        onMonthChange={(v, d) => {
          if (v.startsWith("2024") && !allowYear()) d.cancel();
          else setMonth(v);
        }}
      >
        <CalendarYearPicker.Trigger />
        <Calendar.Grid />
        <CalendarYearPicker.Grid />
      </Calendar>
      <Button onClick={() => setAllowYear(true)}>Allow 2024</Button>
      <output aria-label="Calendar month">{month()}</output>
      <Button
        onClick={() => {
          toaster.loading("Sending", { id: "upload", duration: Infinity });
        }}
      >
        Show pill
      </Button>
      <Button
        onClick={() =>
          toaster.update("upload", {
            type: "success",
            title: "The report was sent to all recipients",
            action: { label: "View", onAction: () => {} },
            duration: Infinity,
          })
        }
      >
        Update pill
      </Button>
      <Toast.Region toaster={toaster} variant="pill" />
    </>
  );
}
