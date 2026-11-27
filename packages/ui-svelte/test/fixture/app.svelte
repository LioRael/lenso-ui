<script lang="ts">
  import {
    Button,
    ButtonGroup,
    Checkbox,
    GlassButton,
    Input,
    List,
    Modal,
    PageControl,
    RefreshControl,
    Switch,
    TabBar,
    Table,
    Tabs,
  } from "@lenso/ui-svelte";
  import Parity from "./parity.svelte";
  import { Select } from "@lenso/ui-svelte/select";

  let busy = $state(true);
  let saves = $state(0);
  let email = $state("");
  let updates = $state(true);
  let enabled = $state(false);
  let region = $state("asia");
  let open = $state(false);
  let saved = $state("");
  let activeTab = $state("overview");
  let minimized = $state(true);
  let destination = $state("workspace");
  let refreshes = $state(0);
  let listSelection = $state<string[]>([]);
  let page = $state(0);
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "activity", label: "Recent activity" },
    { value: "archive", label: "Account archive" },
    { value: "settings", label: "Advanced settings" },
  ];
</script>

{#snippet details()}Member details{/snippet}

<main>
  <form
    onsubmit={(event) => {
      event.preventDefault();
      saved = new FormData(event.currentTarget).get("email")?.toString() ?? "";
    }}
  >
    <label for="email">Email</label>
    <Input
      id="email"
      name="email"
      type="email"
      required
      bind:value={email}
      onValueChange={(value, details) => {
        if (details.source === "agent" && value === "blocked@example.test") details.cancel();
      }}
    />
    <Checkbox name="updates" bind:checked={updates}>
      <Checkbox.Content>
        <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
        Product updates
      </Checkbox.Content>
    </Checkbox>
    <Switch bind:checked={enabled}>
      <Switch.Content>
        <Switch.Control><Switch.Track><Switch.Thumb /></Switch.Track></Switch.Control>
        Notifications
      </Switch.Content>
    </Switch>
    <Button variant="prominent" tint="#7357dd" type="submit" class="save-action">
      Save preferences
    </Button>
  </form>

  <Select bind:value={region}>
    <Select.Label>Region</Select.Label>
    <Select.Trigger><Select.Value /></Select.Trigger>
    <Select.Content>
      <Select.List>
        <Select.Item value="asia"><Select.ItemText>Asia</Select.ItemText></Select.Item>
        <Select.Item value="europe"><Select.ItemText>Europe</Select.ItemText></Select.Item>
      </Select.List>
    </Select.Content>
  </Select>

  <Modal bind:open>
    <Modal.Trigger>Open preferences</Modal.Trigger>
    <Modal.Backdrop />
    <Modal.Content>
      <Modal.Title>Preferences</Modal.Title>
      <Modal.Close>Done</Modal.Close>
    </Modal.Content>
  </Modal>

  <output aria-label="Current preferences">
    {email}|{updates}|{enabled}|{region}|{open}|{saved}
  </output>

  <Tabs bind:value={activeTab}>
    <Tabs.ListContainer id="compact-tabs" style="width:220px" overflowLabel="More sections">
      <Tabs.List aria-label="Sections">
        {#each tabs as tab (tab.value)}
          <Tabs.Tab value={tab.value}>{tab.label}</Tabs.Tab>
        {/each}
        <Tabs.Indicator />
      </Tabs.List>
    </Tabs.ListContainer>
    {#each tabs as tab (tab.value)}
      <Tabs.Panel value={tab.value}>Section: {tab.label}</Tabs.Panel>
    {/each}
  </Tabs>

  <Table>
    <Table.Content aria-label="Members" selectionMode="multiple">
      <Table.Header>
        <Table.Row>
          <Table.Column columnKey="selection" width={48}><Table.SelectionCheckbox /></Table.Column>
          <Table.Column columnKey="name" width="1fr" allowsSorting>Name</Table.Column>
          <Table.Column columnKey="actions" width={100}>
            Actions
            <Table.ColumnResizer aria-label="Resize actions" />
          </Table.Column>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row itemKey="alice" expandedContent={details} expandedColSpan={3}>
          <Table.Cell><Table.SelectionCheckbox aria-label="Select Alice" /></Table.Cell>
          <Table.Cell>Alice</Table.Cell>
          <Table.Cell><Table.ExpandButton /></Table.Cell>
        </Table.Row>
        <Table.Row itemKey="bo">
          <Table.Cell><Table.SelectionCheckbox aria-label="Select Bo" /></Table.Cell>
          <Table.Cell>Bo</Table.Cell>
          <Table.Cell></Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Content>
  </Table>

  <List
    aria-label="Tasks"
    editing
    value={listSelection}
    onValueChange={(value) => {
      listSelection = value;
    }}
  >
    <List.Item itemKey="review" textValue="Review">
      <List.Title>Review</List.Title>
    </List.Item>
  </List>
  <output aria-label="Task selection">{listSelection.join(",")}</output>

  <TabBar
    aria-label="Workspace"
    layout="vertical"
    {minimized}
    onMinimizedChange={(next) => {
      minimized = next;
    }}
  >
    <TabBar.Group>
      <TabBar.Link
        href="#workspace"
        isCurrent={destination === "workspace"}
        onclick={() => {
          destination = "workspace";
        }}
      >
        {#snippet icon()}<span>⌂</span>{/snippet}
        Workspace home
      </TabBar.Link>
      <TabBar.Link
        href="#library"
        isCurrent={destination === "library"}
        onclick={() => {
          destination = "library";
        }}
      >
        {#snippet icon()}<span>◇</span>{/snippet}
        Library
      </TabBar.Link>
    </TabBar.Group>
  </TabBar>

  <Button
    onclick={() => {
      minimized = !minimized;
    }}
  >
    Toggle workspace navigation
  </Button>

  <GlassButton>Glass action</GlassButton>

  <PageControl
    count={12}
    variant="plain"
    {page}
    onPageChange={(next) => {
      page = next;
    }}
  />

  <RefreshControl
    onRefresh={() => {
      refreshes += 1;
    }}
  >
    <RefreshControl.Trigger />
    <RefreshControl.Viewport>Refresh count {refreshes}</RefreshControl.Viewport>
  </RefreshControl>
  <Parity />
  <ButtonGroup disabled variant="prominent" size="lg"><Button>Grouped action</Button></ButtonGroup>
  <Button
    isLoading={busy}
    onclick={() => {
      saves++;
    }}
  >
    Save changes
  </Button><Button
    onclick={() => {
      busy = false;
    }}
  >
    Finish saving
  </Button><output aria-label="Save count">{saves}</output>
</main>
