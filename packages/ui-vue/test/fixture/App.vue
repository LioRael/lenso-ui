<script setup lang="ts">
import Parity from "./Parity.vue";
import { ref } from "vue";
import {
  Accordion,
  Disclosure,
  Button,
  ButtonGroup,
  Calendar,
  CalendarYearPicker,
  Command,
  ContextMenu,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  DatePicker,
  DateRangePicker,
  RangeCalendar,
  Pagination,
  PageControl,
  WheelPicker,
  ProgressCircle,
  type DatePickerValue,
  Checkbox,
  CheckboxGroup,
  GlassButton,
  GlassProvider,
  GlassToggleButton,
  Input,
  Modal,
  List,
  RefreshControl,
  SwipeActions,
  type ListMove,
  type SwipeAction,
  Select,
  SearchField,
  SectionIndex,
  ScrollEdge,
  ThemeScope,
  Tag,
  TagGroup,
  TabBar,
  Table,
  type CollectionDragAndDrop,
  type TableKey,
  IconCalendar,
  IconSearch,
  type TagGroupItem,
  Toast,
  createToaster,
  I18nProvider,
  useIsMounted,
  type SectionIndexItem,
  Switch,
  Tabs,
  type CalendarValue,
} from "@lenso/ui-vue";
import { badgeStyles } from "@lenso/tokens/badge";

const mounted = useIsMounted();
const viewport = ref<HTMLElement | null>(null);
const section = ref<string | null>(null);
const sections: SectionIndexItem[] = [
  { value: "a", label: "A", href: "#section-a" },
  { value: "b", label: "B", href: "#section-b", disabled: true },
  { value: "c", label: "C", href: "#section-c" },
];
const detached = ref(false);
const glassSelected = ref(false);
const disabled = ref(true);
const count = ref(0);
const name = ref("Mira");
const alerts = ref(false);
const search = ref("");
const command = ref("");
const color = ref("#ff0000");
const colorOpen = ref(false);
const reminders = ref<string[]>([]);
const role = ref<string | null>(null);
const yearMonth = ref("2025-05");
const yearOpen = ref(false);
const allowYear = ref(false);
const day = ref<CalendarValue>(null);
const range = ref<CalendarValue>(null);
const dueDate = ref<DatePickerValue>("2025-05-10");
const selectedRows = ref<string[]>([]);
const notes = ref(["First note", "Second note", "Third note"]);
const swipeSide = ref<"start" | "end" | null>(null);
const swipeInvocations = ref(0);
const refreshes = ref(0);
const swipeActions: SwipeAction[] = [
  {
    id: "archive",
    label: "Archive note",
    fullSwipe: true,
    onAction: () => swipeInvocations.value++,
  },
];

function reorderNotes({ keys, targetKey, dropPosition }: ListMove) {
  const moving = notes.value.filter((note) => keys.has(note));
  const next = notes.value.filter((note) => !keys.has(note));
  const target = next.indexOf(String(targetKey));
  next.splice(target + (dropPosition === "after" ? 1 : 0), 0, ...moving);
  notes.value = next;
}

const wheelValue = ref<string | null>("low");
const wheelOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal", disabled: true },
  { value: "high", label: "High" },
];
const activePage = ref(4);
const contextChecked = ref(false);
const toaster = createToaster();
const toastProgress = ref(8);
function showPill() {
  toastProgress.value = 8;
  toaster.loading("Sending", { id: "send-fixture" });
}
function updatePill() {
  toastProgress.value = 100;
  toaster.update("send-fixture", {
    type: "success",
    title: "The report was sent to all recipients",
    duration: Infinity,
    action: { label: "View", onAction: () => {} },
  });
}
const tags = ref<TagGroupItem[]>([
  { key: "alpha", textValue: "Alpha" },
  { key: "beta", textValue: "Beta" },
  { key: "gamma", textValue: "Gamma" },
]);
const allowRemove = ref(false);
const tabDestination = ref("summary");
const navMinimized = ref(false);
const tabScroll = ref<HTMLElement>();
const tableSelection = ref(new Set<TableKey>());
const tableRecords = Array.from({ length: 100 }, (_, index) => ({
  key: index + 1,
  label: `Record ${index + 1}`,
  disabled: index === 98,
}));
const tableDrop = ref("");
const tableDrag: CollectionDragAndDrop = {
  onReorder({ keys, targetKey, dropPosition }) {
    tableDrop.value = `${[...keys].join(",")} ${dropPosition} ${targetKey}`;
  },
};
const tableLoads = ref(0);
const activeTab = ref<string | null>("overview");
const overflowTab = ref<string | null>("general");
</script>

<template>
  <main>
    <Button @click="disabled = !disabled">Toggle group</Button>
    <ButtonGroup aria-label="Bulk actions" variant="prominent" :disabled="disabled">
      <Button :xstyle="badgeStyles.root" @click="count++">Apply</Button>
    </ButtonGroup>
    <output aria-label="Applied count">{{ count }}</output>

    <GlassProvider :tint="0.4">
      <Button @click="detached = !detached">Toggle glass grouping</Button>
      <ButtonGroup aria-label="Glass actions" :is-detached="detached">
        <GlassButton>Glass accept</GlassButton>
        <GlassButton>Glass dismiss</GlassButton>
      </ButtonGroup>
      <GlassToggleButton v-model="glassSelected">Show glass detail</GlassToggleButton>
      <output aria-label="Glass detail enabled">{{ glassSelected }}</output>
    </GlassProvider>

    <Input v-model="name" aria-label="Name" full-width />
    <output aria-label="Saved name">{{ name }}</output>
    <Switch v-model="alerts">
      <Switch.Content>Alerts</Switch.Content>
      <Switch.Control><Switch.Track /><Switch.Thumb /></Switch.Control>
    </Switch>
    <output aria-label="Alerts enabled">{{ alerts }}</output>

    <CheckboxGroup v-model="reminders" aria-label="Reminders" variant="secondary">
      <Checkbox value="email" aria-label="Email reminders">
        <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
        <Checkbox.Content>Email reminders</Checkbox.Content>
      </Checkbox>
    </CheckboxGroup>
    <output aria-label="Reminder channels">{{ reminders.join(", ") }}</output>

    <Select v-model="role" placeholder="Select a role">
      <Select.Label>Role</Select.Label>
      <Select.Trigger><Select.Value /></Select.Trigger>
      <Select.Content>
        <Select.Item value="viewer">Viewer</Select.Item>
        <Select.Item value="editor">Editor</Select.Item>
      </Select.Content>
    </Select>
    <output aria-label="Selected role">{{ role }}</output>

    <Button>
      <template #render="{ props }">
        <a v-bind="props" href="#details">Read details</a>
      </template>
    </Button>
    <Accordion.Indicator />
    <Disclosure.Indicator><circle r="3" /></Disclosure.Indicator>
    <Modal>
      <Modal.Trigger>Open settings</Modal.Trigger>
      <Modal.Backdrop />
      <Modal.Content>
        <Modal.Title>Settings</Modal.Title>
        <Modal.Close />
        <Modal.Close>Done</Modal.Close>
      </Modal.Content>
    </Modal>

    <SearchField>
      <SearchField.Icon />
      <SearchField.Input v-model="search" type="search" aria-label="Search records" />
      <SearchField.Clear aria-label="Clear record search">Clear</SearchField.Clear>
    </SearchField>
    <Command>
      <Command.Header>
        <Command.InputGroup>
          <Command.SearchIcon />
          <Command.Input aria-label="Run command" />
        </Command.InputGroup>
      </Command.Header>
      <Command.List>
        <Command.Item value="archive" @select="command = 'archive'">Archive record</Command.Item>
        <Command.Item value="rename" @select="command = 'rename'">Rename record</Command.Item>
      </Command.List>
    </Command>
    <output aria-label="Selected command">{{ command }}</output>

    <ColorPicker v-model="color" v-model:open="colorOpen">
      <ColorPicker.Trigger>Edit accent</ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorPicker.Input aria-label="Accent color" />
        <ColorSlider channel="hue" aria-label="Hue">
          <ColorSlider.Thumb />
          <ColorSlider.Output aria-label="Hue value" />
        </ColorSlider>
      </ColorPicker.Popover>
    </ColorPicker>
    <ColorSwatch :color="color" color-name="Accent preview" />
    <output aria-label="Accent popup open">{{ colorOpen }}</output>

    <Tabs v-model="activeTab">
      <Tabs.List aria-label="Details">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
      <Tabs.Panel value="activity">Activity panel</Tabs.Panel>
    </Tabs>
    <Calendar v-model="day" default-month="2025-05" aria-label="Due date">
      <Calendar.Grid />
    </Calendar>
    <output aria-label="Selected day">{{ day }}</output>
    <DatePicker v-model="dueDate">
      <DatePicker.Input aria-label="Due date input" />
      <DatePicker.Trigger aria-label="Choose due date">Choose due date</DatePicker.Trigger>
      <DatePicker.Popover>
        <Calendar.Grid />
        <DatePicker.Close>Finish date selection</DatePicker.Close>
      </DatePicker.Popover>
    </DatePicker>
    <output aria-label="Due date value">{{ dueDate }}</output>
    <DateRangePicker :default-value="['2025-05-10', '2025-05-12']">
      <DateRangePicker.Input aria-label="Date range input" />
    </DateRangePicker>
    <RangeCalendar v-model="range" default-month="2025-05" aria-label="Vacation range">
      <RangeCalendar.Grid />
    </RangeCalendar>
    <output aria-label="Vacation value">{{
      Array.isArray(range) ? range.join(" to ") : range
    }}</output>
    <Pagination aria-label="Review pages">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Next href="#section-c" aria-label="Next review page">
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
    <ProgressCircle :value="30" :min="10" :max="50" aria-label="Export progress">
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
    <List v-model="selectedRows" editing aria-label="Notes" @reorder="reorderNotes">
      <List.Section title="Recent">
        <List.Item v-for="note in notes" :key="note" :item-key="note" v-slot="{ isSelected }">
          <List.Title :data-selected="isSelected">{{ note }}</List.Title>
        </List.Item>
      </List.Section>
    </List>
    <output aria-label="Selected notes">{{ selectedRows.join(", ") }}</output>
    <SwipeActions v-model:open-side="swipeSide" :end-actions="swipeActions" style="width: 320px">
      Swipe this note
    </SwipeActions>
    <output aria-label="Open swipe side">{{ swipeSide }}</output>
    <output aria-label="Archived notes">{{ swipeInvocations }}</output>
    <RefreshControl
      :on-refresh="
        () => {
          refreshes++;
        }
      "
      :threshold="40"
    >
      <RefreshControl.Trigger />
      <RefreshControl.Viewport>
        <span>Refresh content</span>
      </RefreshControl.Viewport>
    </RefreshControl>
    <output aria-label="Refresh count">{{ refreshes }}</output>
    <form aria-label="Priority form">
      <WheelPicker
        v-model="wheelValue"
        :options="wheelOptions"
        name="priority"
        aria-label="Priority wheel"
      />
    </form>
    <output aria-label="Priority value">{{ wheelValue }}</output>
    <Tabs v-model="overflowTab">
      <Tabs.ListContainer style="width: 210px" overflow-label="More settings tabs">
        <Tabs.List aria-label="Settings tabs">
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
          <Tabs.Tab value="privacy">Privacy controls</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel value="general">General settings pane</Tabs.Panel>
      <Tabs.Panel value="notifications">Notifications pane</Tabs.Panel>
      <Tabs.Panel value="privacy">Privacy pane</Tabs.Panel>
    </Tabs>
    <ContextMenu compact>
      <ContextMenu.Trigger>File options</ContextMenu.Trigger>
      <ContextMenu.Content>
        <template #preview>
          <ContextMenu.Preview>File preview</ContextMenu.Preview>
        </template>
        <template #bar>
          <ContextMenu.BarItem value="quick">Quick action</ContextMenu.BarItem>
        </template>
        <ContextMenu.CheckboxItem value="details" v-model="contextChecked" :close-on-select="false">
          Show details
        </ContextMenu.CheckboxItem>
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>Move file</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item value="archive">Archive file</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
      </ContextMenu.Content>
    </ContextMenu>
    <output aria-label="File details enabled">{{ contextChecked }}</output>
    <Button @click="showPill">Show pill</Button>
    <Button @click="updatePill">Update pill</Button>
    <Toast.Region :toaster="toaster">
      <Toast variant="pill">
        <Toast.Content>
          <Toast.Progress :value="toastProgress" aria-label="Sending progress" />
          <Toast.Marquee><Toast.Title /></Toast.Marquee>
          <Toast.Action />
          <Toast.Close aria-label="Close toast">×</Toast.Close>
        </Toast.Content>
      </Toast>
    </Toast.Region>
    <TagGroup
      aria-label="Topics"
      :items="tags"
      selection-mode="single"
      @items-change="
        (next) => {
          if (allowRemove) tags = next;
        }
      "
    >
      <TagGroup.List v-slot="item">
        <Tag :item-key="item.key" :text-value="item.textValue" v-slot="{ isSelected }">
          <span :aria-current="isSelected ? 'true' : 'false'">{{ item.textValue }}</span>
        </Tag>
      </TagGroup.List>
    </TagGroup>
    <Button @click="allowRemove = true">Allow tag removal</Button>
    <Calendar
      v-model:month="yearMonth"
      v-model:is-year-picker-open="yearOpen"
      min="2023-08-01"
      max="2027-12-31"
      aria-label="Year picker calendar"
      @month-change="
        (month, details) => {
          if (month.startsWith('2024') && !allowYear) details.cancel();
        }
      "
    >
      <CalendarYearPicker.Trigger />
      <Calendar.Grid />
      <CalendarYearPicker.Grid />
    </Calendar>
    <output aria-label="Selected month">{{ yearMonth }}</output>
    <output aria-label="Year picker open">{{ yearOpen }}</output>
    <Button @click="allowYear = true">Allow 2024</Button>
    <Button @click="navMinimized = true">Minimize section navigation</Button>
    <TabBar
      v-model:minimized="navMinimized"
      aria-label="Section navigation"
      layout="vertical"
      auto-minimize
      :scroll-target="tabScroll"
    >
      <TabBar.Group>
        <TabBar.Link
          href="#summary"
          :is-current="tabDestination === 'summary'"
          @click.prevent="tabDestination = 'summary'"
        >
          <template #icon><IconCalendar /></template>
          Summary destination
        </TabBar.Link>
        <TabBar.Link
          href="#records"
          :is-current="tabDestination === 'records'"
          @click.prevent="tabDestination = 'records'"
        >
          <template #icon><IconSearch /></template>
          Records destination
        </TabBar.Link>
      </TabBar.Group>
    </TabBar>
    <div ref="tabScroll" aria-label="Navigation scroll area" style="height: 100px; overflow: auto">
      <div style="height: 250px">Navigation content</div>
    </div>
    <Table>
      <Table.ScrollContainer style="height: 180px; overflow: auto">
        <Table.Content
          v-model:selected-keys="tableSelection"
          aria-label="Windowed records"
          selection-mode="multiple"
        >
          <Table.Header>
            <Table.Row><Table.Column>Record</Table.Column></Table.Row>
          </Table.Header>
          <Table.Body
            :items="tableRecords"
            :virtualized="{ height: 180, rowHeight: 36, overscan: 2 }"
            v-slot="record"
          >
            <Table.Row :item-key="record.key" :disabled="record.disabled" style="height: 36px">
              <Table.Cell>{{ record.label }}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
    <output aria-label="Window selection">{{ tableSelection.size }}</output>
    <Table.Content aria-label="Folders" tree-column="name" :drag-and-drop="tableDrag">
      <Table.Body>
        <Table.Row item-key="parent">
          <Table.Cell column-key="name">
            Parent row <Button data-table-drag>Drag parent</Button>
          </Table.Cell>
          <template #childRows>
            <Table.Row item-key="child"
              ><Table.Cell column-key="name">Child row</Table.Cell></Table.Row
            >
          </template>
        </Table.Row>
        <Table.Row item-key="peer"><Table.Cell column-key="name">Peer row</Table.Cell></Table.Row>
      </Table.Body>
    </Table.Content>
    <output aria-label="Last drop">{{ tableDrop }}</output>
    <Table>
      <Table.ResizableContainer style="width: 420px; height: 150px; overflow: auto">
        <Table.Content aria-label="Accounts">
          <Table.Header>
            <Table.Row>
              <Table.Column
                column-key="name"
                :width="90"
                :min-width="60"
                :max-width="160"
                allows-sorting
                v-slot="{ sortDirection }"
              >
                <Table.SortableColumnHeader :sort-direction="sortDirection"
                  >Name</Table.SortableColumnHeader
                >
                <Table.ColumnResizer aria-label="Resize name column" />
              </Table.Column>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row v-for="index in 10" :key="index"
              ><Table.Cell>Account {{ index }}</Table.Cell></Table.Row
            >
            <Table.LoadMore :has-more="tableLoads === 0" @load-more="tableLoads++"
              >Load more accounts</Table.LoadMore
            >
          </Table.Body>
        </Table.Content>
      </Table.ResizableContainer>
    </Table>
    <output aria-label="Account loads">{{ tableLoads }}</output>
    <I18nProvider locale="ar">
      <PageControl
        v-model:page="activePage"
        :count="20"
        variant="plain"
        aria-label="Review slides"
      />
      <output aria-label="Current slide">{{ activePage }}</output>
      <ThemeScope theme="dark" :glass-transparency="0.4" style="position: relative">
        <SectionIndex v-model="section" :items="sections" />
        <output aria-label="Current section">{{ section }}</output>
        <output aria-label="Mounted">{{ mounted() }}</output>
        <ScrollEdge :scroll-ref="viewport" />
        <div ref="viewport" aria-label="Sections" style="overflow-y: auto; height: 100px">
          <div id="section-a" style="height: 250px">A section</div>
          <div id="section-c" style="height: 250px">C section</div>
        </div>
      </ThemeScope>
      <Parity />
    </I18nProvider>
  </main>
</template>
