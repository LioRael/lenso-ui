import {
  Button,
  Checkbox,
  Label,
  List,
  Modal,
  PageControl,
  RefreshControl,
  TabBar,
  Tabs,
  TextField,
  WheelPicker,
} from "@lenso/ui-solid";
import { Table, type SortDescriptor, type TableKey } from "@lenso/ui-solid/table";
import { Select } from "@lenso/ui-solid/select";
import { GlassButton } from "@lenso/ui-solid/glass-button";
import * as stylex from "@stylexjs/stylex";
import { createMemo, createSignal } from "solid-js";

const styles = stylex.create({
  save: { minWidth: 112 },
});

const records = [
  { key: "alpha", name: "Alpha" },
  { key: "zulu", name: "Zulu" },
  { key: "locked", name: "Locked" },
];
const columns = [{ key: "name" }, { key: "selection" }];

function AccountsTable() {
  const [sort, setSort] = createSignal<SortDescriptor>();
  const [selected, setSelected] = createSignal<ReadonlySet<TableKey>>(new Set());
  const [loads, setLoads] = createSignal(0);
  const items = createMemo(() =>
    sort()?.direction === "descending" ? [...records].reverse() : records,
  );

  return (
    <Table>
      <Table.ResizableContainer style={{ width: "440px", height: "170px" }}>
        <Table.Content
          aria-label="Accounts"
          selectionMode="multiple"
          selectedKeys={selected()}
          onSelectionChange={setSelected}
          disabledKeys={new Set(["locked"])}
          sortDescriptor={sort()}
          onSortChange={setSort}
        >
          <Table.Header columns={columns}>
            {(column) =>
              column.key === "name" ? (
                <Table.Column
                  columnKey={column.key}
                  allowsSorting
                  width={180}
                  minWidth={100}
                  maxWidth={320}
                >
                  {({ sortDirection }) => (
                    <>
                      <Table.SortableColumnHeader sortDirection={sortDirection}>
                        Name
                      </Table.SortableColumnHeader>
                      <Table.ColumnResizer aria-label="Resize name column" />
                    </>
                  )}
                </Table.Column>
              ) : (
                <Table.Column columnKey={column.key} width="1fr">
                  <Table.SelectionCheckbox aria-label="Select all accounts" />
                </Table.Column>
              )
            }
          </Table.Header>
          <Table.Body items={items()}>
            {(item) => (
              <Table.Row
                itemKey={item.key}
                expandedColSpan={2}
                expandedContent={<span>Details for {item.name}</span>}
              >
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>
                  <Table.SelectionCheckbox aria-label={`Select ${item.name}`} />
                  <Table.ExpandButton aria-label={`Toggle details for ${item.name}`} />
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
          <Table.Body>
            <tr>
              <td colspan={2} style={{ height: "250px" }}>
                More account history
              </td>
            </tr>
            <Table.LoadMore colSpan={2} hasMore={loads() === 0} onLoadMore={() => setLoads(1)}>
              <Table.LoadMoreContent>Load more accounts</Table.LoadMoreContent>
            </Table.LoadMore>
          </Table.Body>
        </Table.Content>
      </Table.ResizableContainer>
      <output aria-label="Account loads">{loads()}</output>
    </Table>
  );
}

export function App() {
  const [dark, setDark] = createSignal(false);
  const [saved, setSaved] = createSignal("");
  const [source, setSource] = createSignal("");
  const [scroller, setScroller] = createSignal<HTMLDivElement>();

  return (
    <main data-theme={dark() ? "dark" : "light"}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(String(new FormData(event.currentTarget).get("updates") ?? "off"));
        }}
      >
        <Checkbox
          name="updates"
          value="yes"
          defaultChecked="indeterminate"
          class={(state) => ({ selected: state.checked })}
          onCheckedChange={(_, details) => setSource(details.source)}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Product updates
          </Checkbox.Content>
        </Checkbox>

        <Button
          type="submit"
          variant="prominent"
          size={dark() ? "lg" : "md"}
          tint="rgb(0, 80, 160)"
          xstyle={styles.save}
          style={{ "margin-inline-start": "8px" }}
        >
          Save preferences
        </Button>
        <Button type="reset">Reset preferences</Button>
      </form>
      <Button
        render={(props) => <button {...props} data-custom-render="true" />}
        onClick={() => setDark(!dark())}
      >
        Change theme
      </Button>
      <TextField>
        <Label>Display name</Label>
        <TextField.Input />
      </TextField>
      <Tabs defaultValue="one">
        <Tabs.ListContainer style={{ width: "230px" }}>
          <Tabs.List aria-label="Preferences sections">
            <Tabs.Tab value="one">General</Tabs.Tab>
            <Tabs.Tab value="two">Privacy</Tabs.Tab>
            <Tabs.Tab value="three">Reports</Tabs.Tab>
            <Tabs.Tab value="four" disabled>
              Archive
            </Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel value="one">General preferences</Tabs.Panel>
        <Tabs.Panel value="two">Privacy preferences</Tabs.Panel>
        <Tabs.Panel value="three">Reports preferences</Tabs.Panel>
      </Tabs>
      <Modal>
        <Modal.Trigger>Open settings</Modal.Trigger>
        <Modal.Backdrop />
        <Modal.Content>
          <Modal.Title>Account settings</Modal.Title>
          <Modal.Close>Close settings</Modal.Close>
        </Modal.Content>
      </Modal>
      <Select defaultValue="daily">
        <Select.Trigger aria-label="Update frequency">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.List>
            <Select.Item value="daily">
              <Select.ItemText>Daily</Select.ItemText>
            </Select.Item>
            <Select.Item value="weekly">
              <Select.ItemText>Weekly</Select.ItemText>
            </Select.Item>
          </Select.List>
        </Select.Content>
      </Select>
      <WheelPicker
        aria-label="Reminder time"
        options={[
          { value: "8", label: "8 AM" },
          { value: "9", label: "9 AM" },
        ]}
      />
      <List editing>
        <List.Item itemKey="one" textValue="First item">
          <List.Title>First item</List.Title>
        </List.Item>
      </List>
      <PageControl variant="plain" count={12} />
      <GlassButton>Glass action</GlassButton>
      <RefreshControl
        onRefresh={async () => {
          await Promise.resolve();
        }}
      >
        <RefreshControl.Trigger>Refresh settings</RefreshControl.Trigger>
      </RefreshControl>
      <TabBar aria-label="Account navigation" autoMinimize scrollTarget={scroller}>
        <TabBar.Group>
          <TabBar.Link href="#saved" isCurrent>
            Overview
          </TabBar.Link>
          <TabBar.Link href="#source">Activity</TabBar.Link>
        </TabBar.Group>
      </TabBar>
      <div id="tabbar-scroll" ref={setScroller} style={{ height: "100px", overflow: "auto" }}>
        <div style={{ height: "250px" }}>Account activity</div>
      </div>
      <AccountsTable />
      <output id="saved">{saved()}</output>
      <output id="source">{source()}</output>
    </main>
  );
}
