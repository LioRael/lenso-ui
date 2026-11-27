<script lang="ts">
  import {
    Button,
    Calendar,
    ContextMenu,
    CalendarYearPicker,
    DateField,
    DatePicker,
    createToaster,
    Table,
    Tag,
    TagGroup,
    Toast,
  } from "@lenso/ui-svelte";
  import type { TagGroupItem } from "@lenso/ui-svelte/tag-group";
  import type { TableKey } from "@lenso/ui-svelte/table";

  import { useListData, useOverlayState, useIsHydrated } from "@lenso/ui-svelte/hooks";
  const labels = useListData({ initialItems: [{ id: 1 }] });
  const overlay = useOverlayState();
  const hydrated = useIsHydrated();
  const records = Array.from({ length: 100 }, (_, index) => ({
    key: index,
    label: `Record ${index + 1}`,
    disabled: index === 98,
  }));
  let selection = $state.raw<Set<TableKey>>(new Set());
  let lastDrop = $state("");
  let month = $state("2025-05");
  let block2024 = $state(true);
  let tags = $state<TagGroupItem[]>([
    { key: "alpha", textValue: "Alpha" },
    { key: "beta", textValue: "Beta" },
    { key: "gamma", textValue: "Gamma" },
  ]);
  let deleteAllowed = $state(false);
  let date = $state<string | null>("2025-05-10");
  const toaster = createToaster();
  let sent = $state(40);
</script>

{#snippet nestedRows()}
  <Table.Row itemKey="child"><Table.Cell columnKey="name">Child row</Table.Cell></Table.Row>
{/snippet}

<ContextMenu compact>
  <ContextMenu.Trigger>File options</ContextMenu.Trigger>
  <ContextMenu.Content>
    {#snippet preview()}<ContextMenu.Preview>File preview</ContextMenu.Preview>{/snippet}
    {#snippet bar()}<ContextMenu.BarItem>Quick action</ContextMenu.BarItem>{/snippet}
    <ContextMenu.Item.Checkbox value="details" closeOnSelect={false}>Show details</ContextMenu.Item.Checkbox>
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger>Move file</ContextMenu.SubTrigger><ContextMenu.SubContent>
        <ContextMenu.Item>Archive file</ContextMenu.Item>
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
  </ContextMenu.Content>
</ContextMenu>
<Button
  onclick={() => {
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
  value={date}
  onValueChange={(value) => (date = typeof value === "string" ? value : null)}
>
  <DateField bind:value={date} locale="en-US" aria-label="Segmented date">
    {#snippet children(state)}
      {#each state.segments as part (part.key)}<DatePicker.Segment segment={part} />{/each}
    {/snippet}
  </DateField>
  <DatePicker.Input aria-label="Picker text" />
</DatePicker>

<Table.ScrollContainer id="windowed-table" style="height:180px">
  <Table.Content
    aria-label="Windowed records"
    selectionMode="multiple"
    selectedKeys={selection}
    onSelectionChange={(next) => {
      selection = next;
    }}
  >
    <Table.Header><Table.Row><Table.Column>Record</Table.Column></Table.Row></Table.Header>
    <Table.Body items={records} virtualized={{ height: 180, rowHeight: 36, overscan: 2 }}>
      {#snippet row(item)}
        <Table.Row itemKey={item.key} disabled={item.disabled}>
          <Table.Cell>{item.label}</Table.Cell>
        </Table.Row>
      {/snippet}
    </Table.Body>
  </Table.Content>
</Table.ScrollContainer>
<output aria-label="Window selection">{selection.size}</output>

<Table.Content
  aria-label="Folders"
  treeColumn="name"
  dragAndDrop={{
    onReorder({ keys, targetKey, dropPosition }) {
      lastDrop = `${[...keys].join(",")} ${dropPosition} ${targetKey}`;
    },
  }}
>
  <Table.Header><Table.Row><Table.Column>Name</Table.Column></Table.Row></Table.Header>
  <Table.Body>
    <Table.Row itemKey="parent" childRows={nestedRows}>
      <Table.Cell columnKey="name">
        Parent row <Button data-table-drag="">Drag parent</Button>
      </Table.Cell>
    </Table.Row>
    <Table.Row itemKey="peer"><Table.Cell columnKey="name">Peer row</Table.Cell></Table.Row>
  </Table.Body>
</Table.Content>
<output aria-label="Last drop">{lastDrop}</output>

<TagGroup
  aria-label="Topics"
  items={tags}
  selectionMode="single"
  onItemsChange={(next) => {
    if (deleteAllowed) tags = [...next];
  }}
>
  <TagGroup.List>
    {#snippet item(entry)}
      <Tag itemKey={entry.key} textValue={entry.textValue}>{entry.textValue}</Tag>
    {/snippet}
  </TagGroup.List>
</TagGroup>
<Button
  onclick={() => {
    deleteAllowed = true;
  }}
>
  Allow tag removal
</Button>

<Calendar
  bind:month
  min="2023-08-01"
  max="2027-12-31"
  onMonthChange={(value, details) => {
    if (block2024 && value.startsWith("2024")) details.cancel();
  }}
>
  <CalendarYearPicker.Trigger />
  <Calendar.Grid />
  <CalendarYearPicker.Grid />
</Calendar>
<Button
  onclick={() => {
    block2024 = false;
  }}
>
  Allow 2024
</Button>
<output aria-label="Calendar month">{month}</output>

<Button
  onclick={() => {
    toaster.loading("Sending", { id: "upload", duration: Infinity });
  }}
>
  Show pill
</Button>
<Button
  onclick={() => {
    sent = 100;
    toaster.update("upload", {
      type: "success",
      title: "The report was sent to all recipients",
      duration: Infinity,
      action: { label: "View", onAction: () => {} },
    });
  }}
>
  Update pill
</Button>
<Toast.Region {toaster}>
  {#snippet children(data)}
    <Toast variant="pill">
      <Toast.Indicator />
      <Toast.Content>
        {#if data.type === "loading"}
          <Toast.Progress value={sent} aria-label="Upload progress" />
        {/if}
        <Toast.Title />
        <Toast.Action />
        <Toast.Close aria-label="Dismiss upload" />
      </Toast.Content>
    </Toast>
  {/snippet}
</Toast.Region>
