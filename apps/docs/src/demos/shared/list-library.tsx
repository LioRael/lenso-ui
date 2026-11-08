"use client";
import { useId, useRef, useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { ArrowsRotateRight, ChevronLeft } from "@gravity-ui/icons";
import {
  Button,
  List,
  Modal,
  NavigationBar,
  RefreshControl,
  SectionIndex,
  Toolbar,
  type ListReorderDetails,
} from "@lenso/ui";

type Entry = { id: string; title: string; group: string; detail: string };
const seed: Entry[] = [
  { id: "a-access", title: "Accessibility", group: "A", detail: "Reading notes" },
  { id: "a-animation", title: "Animation", group: "A", detail: "Motion studies" },
  { id: "a-architecture", title: "Architecture", group: "A", detail: "Interface decisions" },
  { id: "b-books", title: "Books", group: "B", detail: "To read this month" },
  { id: "b-browser", title: "Browsers", group: "B", detail: "Compatibility notes" },
  { id: "b-build", title: "Builds", group: "B", detail: "Release checklist" },
  { id: "c-calendar", title: "Calendars", group: "C", detail: "Date and time notes" },
  { id: "c-colors", title: "Colors", group: "C", detail: "Palette studies" },
  { id: "c-components", title: "Components", group: "C", detail: "Design references" },
];
const s = stylex.create({
  root: {
    height: 520,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
    backgroundColor: "var(--lenso-background-grouped-primary)",
    color: "var(--lenso-label-primary)",
    fontFamily: "var(--lenso-font-body)",
    borderRadius: 26,
    overflow: "clip",
  },
  fullscreen: { height: "100dvh", borderRadius: 0 },
  viewport: { padding: 16 },
  back: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    minHeight: 44,
  },
  backIcon: { transform: { default: "none", ":dir(rtl)": "scaleX(-1)" } },
  columns: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 44px",
    gap: 8,
    alignItems: "start",
  },
  index: { position: "sticky", top: 12 },
  footer: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    padding: "8px 16px",
    minHeight: 44,
    fontSize: 13,
    color: "var(--lenso-label-secondary)",
  },
  grow: { flex: "1 1 auto" },
  note: {
    margin: 0,
    padding: "4px 16px 12px",
    fontSize: 13,
    color: "var(--lenso-label-secondary)",
  },
  empty: { padding: 24, textAlign: "center" },
  content: { width: "100%" },
});
export interface ListLibraryProps {
  locale?: "en" | "cn";
  fullscreen?: boolean;
}
export function ListLibrary({ locale = "en", fullscreen = false }: ListLibraryProps) {
  const cn = locale === "cn";
  const prefix = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const refreshNumber = useRef(0);
  const [items, setItems] = useState(seed);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());
  const [active, setActive] = useState("A");
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(cn ? "示例资料库" : "Sample library");
  const [removed, setRemoved] = useState<{ entries: Entry[]; order: string[] } | null>(null);
  const [opened, setOpened] = useState<Entry | null>(null);
  const groups = ["A", "B", "C"].filter((group) => items.some((item) => item.group === group));
  const remove = (keys: ReadonlySet<Key>) => {
    const entries = items.filter((item) => keys.has(item.id));
    setRemoved({ entries, order: items.map((item) => item.id) });
    setItems(items.filter((item) => !keys.has(item.id)));
    setSelected(new Set());
    setNotice(
      cn
        ? `已删除 ${entries.length} 项`
        : `Deleted ${entries.length} ${entries.length === 1 ? "item" : "items"}`,
    );
  };
  const undo = () => {
    if (!removed) return;
    setItems((previous) => {
      const next = [...previous];
      for (const entry of removed.entries) {
        if (next.some((item) => item.id === entry.id)) continue;
        const original = removed.order.indexOf(entry.id);
        const following = removed.order
          .slice(original + 1)
          .find((key) => next.some((item) => item.id === key));
        const before = following ? next.findIndex((item) => item.id === following) : next.length;
        next.splice(before, 0, entry);
      }
      return next;
    });
    setRemoved(null);
    setNotice(cn ? "已撤销删除" : "Deletion undone");
  };
  const reorder = ({ keys, targetKey, dropPosition }: ListReorderDetails) => {
    const moving = items.filter((item) => keys.has(item.id));
    const rest = items.filter((item) => !keys.has(item.id));
    const target = rest.findIndex((item) => item.id === targetKey);
    if (target < 0) return;
    const next = [...rest];
    next.splice(target + (dropPosition === "after" ? 1 : 0), 0, ...moving);
    setItems(next);
    setNotice(cn ? "已更新顺序" : "Order updated");
  };
  const refresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const number = ++refreshNumber.current;
      setItems((previous) => [
        {
          id: `a-refresh-${number}`,
          title: cn ? `新增资料 ${number}` : `Additional note ${number}`,
          group: "A",
          detail: cn ? "刚刚更新" : "Just updated",
        },
        ...previous,
      ]);
      setNotice(cn ? "资料库已更新" : "Library updated");
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <Modal.Root
      open={opened !== null}
      onOpenChange={(open) => {
        if (!open) setOpened(null);
      }}
    >
      <RefreshControl
        onRefresh={refresh}
        disabled={editing}
        refreshLabel={cn ? "刷新" : "Refresh"}
        pullLabel={cn ? "下拉刷新" : "Pull to refresh"}
        releaseLabel={cn ? "松开刷新" : "Release to refresh"}
        refreshingLabel={cn ? "正在刷新" : "Refreshing"}
        completeLabel={cn ? "刷新完成" : "Refresh complete"}
        errorLabel={cn ? "刷新失败，请重试" : "Couldn't refresh. Try again."}
        xstyle={[s.root, fullscreen && s.fullscreen]}
        aria-label={cn ? "资料库" : "Library"}
      >
        <NavigationBar
          title={cn ? "资料库" : "Library"}
          large={false}
          scrollRef={viewport}
          leading={
            fullscreen ? (
              <Toolbar.Link
                href={`/${locale}/docs/react/components/list`}
                aria-label={cn ? "返回组件" : "Back to components"}
                xstyle={s.back}
              >
                <ChevronLeft
                  aria-hidden="true"
                  {...stylex.props(s.backIcon)}
                  width={22}
                  height={22}
                />
              </Toolbar.Link>
            ) : undefined
          }
          trailing={
            <Toolbar.Group>
              <RefreshControl.Trigger
                aria-label={cn ? "刷新" : "Refresh"}
                render={<Toolbar.Button isIconOnly />}
              >
                <ArrowsRotateRight aria-hidden="true" width={20} height={20} />
              </RefreshControl.Trigger>
              <Toolbar.Button
                disabled={refreshing}
                onClick={() => {
                  setEditing(!editing);
                  setSelected(new Set());
                }}
              >
                {editing ? (cn ? "完成" : "Done") : cn ? "编辑" : "Edit"}
              </Toolbar.Button>
            </Toolbar.Group>
          }
        />
        <p {...stylex.props(s.note)}>
          {editing
            ? cn
              ? "选择条目；拖动右侧手柄调整组内顺序。"
              : "Select items; drag a handle to reorder within its section."
            : cn
              ? "下拉更新，左滑显示删除操作。"
              : "Pull to update; swipe left for row actions."}
        </p>
        <RefreshControl.Viewport
          ref={viewport}
          xstyle={s.viewport}
          aria-label={cn ? "资料库内容" : "Library content"}
          onScroll={(event) => {
            const view = event.currentTarget;
            const top = view.getBoundingClientRect().top + 24;
            const atEnd =
              view.scrollTop > 0 && view.scrollTop + view.clientHeight >= view.scrollHeight - 1;
            const current = atEnd
              ? groups.at(-1)
              : (groups.findLast((group) => {
                  const heading = document.getElementById(`${prefix}-${group}`);
                  return heading && heading.getBoundingClientRect().top <= top;
                }) ?? groups[0]);
            if (current) setActive(current);
          }}
        >
          <div {...stylex.props(s.columns)}>
            <List
              variant="plain"
              aria-label={cn ? "资料" : "Library entries"}
              editing={editing}
              disabled={refreshing}
              selectedKeys={selected}
              onSelectionChange={setSelected}
              onReorder={reorder}
              onKeyDown={(event) => {
                if (!event.defaultPrevented && event.key === "Escape") {
                  setEditing(false);
                  setSelected(new Set());
                }
              }}
            >
              {groups.map((group) => (
                <List.Section key={group} title={group} id={`${prefix}-${group}`}>
                  {items
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <List.Item
                        key={item.id}
                        itemKey={item.id}
                        textValue={item.title}
                        height="tall"
                        selectionLabel={cn ? `选择 ${item.title}` : `Select ${item.title}`}
                        reorderLabel={cn ? `移动 ${item.title}` : `Move ${item.title}`}
                        endActionsLabel={
                          cn ? `显示 ${item.title} 的操作` : `Actions for ${item.title}`
                        }
                        endActions={[
                          {
                            id: "delete",
                            label: cn ? "删除" : "Delete",
                            variant: "danger",
                            onAction: () => remove(new Set([item.id])),
                          },
                        ]}
                      >
                        {({ editing }) =>
                          editing ? (
                            <List.Content>
                              <List.Title>{item.title}</List.Title>
                              <List.Description>{item.detail}</List.Description>
                            </List.Content>
                          ) : (
                            <Modal.Trigger
                              aria-label={`${cn ? "打开" : "Open"} ${item.title}`}
                              render={<List.Action xstyle={s.content} />}
                              onClick={() => {
                                setOpened(item);
                                setNotice(cn ? `已打开 ${item.title}` : `Opened ${item.title}`);
                              }}
                            >
                              <List.Content>
                                <List.Title>{item.title}</List.Title>
                                <List.Description>{item.detail}</List.Description>
                              </List.Content>
                            </Modal.Trigger>
                          )
                        }
                      </List.Item>
                    ))}
                </List.Section>
              ))}
            </List>
            <SectionIndex
              aria-label={cn ? "资料分组" : "Library sections"}
              items={groups.map((group) => ({
                value: group,
                label: group,
                href: `#${prefix}-${group}`,
              }))}
              value={groups.includes(active) ? active : groups[0]}
              onValueChange={setActive}
              xstyle={s.index}
            />
          </div>
          {!items.length && (
            <div {...stylex.props(s.empty)}>
              <p>{cn ? "资料库为空" : "The library is empty"}</p>
              <RefreshControl.Trigger>{cn ? "加载资料" : "Load entries"}</RefreshControl.Trigger>
            </div>
          )}
        </RefreshControl.Viewport>
        <div {...stylex.props(s.footer)}>
          <span {...stylex.props(s.grow)}>
            {editing
              ? cn
                ? `已选 ${selected.size} 项`
                : `${selected.size} selected`
              : cn
                ? `${items.length} 项资料`
                : `${items.length} entries`}
          </span>
          {editing && (
            <>
              <Button
                size="sm"
                disabled={refreshing || !items.length}
                onClick={() => setSelected(new Set(items.map((item) => item.id)))}
              >
                {cn ? "全选" : "Select all"}
              </Button>
              <Button
                size="sm"
                destructive
                disabled={refreshing || !selected.size}
                onClick={() => remove(selected)}
              >
                {cn ? "删除所选" : "Delete selected"}
              </Button>
            </>
          )}
          {removed && (
            <Button size="sm" disabled={refreshing} onClick={undo}>
              {cn ? "撤销" : "Undo"}
            </Button>
          )}
        </div>
        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- This announces list actions, not a form-associated calculation. */}
        <p role="status" aria-live="polite" {...stylex.props(s.note)}>
          {notice}
        </p>
      </RefreshControl>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup>
            <Modal.Title>{opened?.title}</Modal.Title>
            <Modal.Description>{opened?.detail}</Modal.Description>
            <p>
              {cn
                ? "示例资料，可在列表中选择、排序或删除。"
                : "A sample entry that you can select, reorder or delete in the library."}
            </p>
            <Modal.Close render={<Button />}>{cn ? "关闭" : "Close"}</Modal.Close>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>
  );
}
