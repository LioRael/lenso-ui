"use client";
import { useState } from "react";
import { FloppyDisk, FolderOpen, SquarePlus, TrashBin } from "@gravity-ui/icons";
import { GlassButton, Menu, IconChevronRight } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  status: { fontSize: 13, color: "var(--lenso-label-secondary)", minHeight: 20 },
});
export function Default() {
  const [action, setAction] = useState(""),
    [pinned, setPinned] = useState(false);
  return (
    <div {...stylex.props(s.root)}>
      <Menu>
        <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
          操作
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup aria-label="File actions">
              <Menu.ActionGroup aria-label="Quick actions">
                <Menu.Action onClick={() => setAction("已新建")}>
                  <SquarePlus width={17} height={22} aria-hidden="true" />
                  新建
                </Menu.Action>
                <Menu.Action onClick={() => setAction("已保存")}>
                  <FloppyDisk width={17} height={22} aria-hidden="true" />
                  保存
                </Menu.Action>
                <Menu.Action variant="danger" onClick={() => setAction("已删除")}>
                  <TrashBin width={17} height={22} aria-hidden="true" />
                  删除
                </Menu.Action>
              </Menu.ActionGroup>
              <Menu.Separator />
              <Menu.Item onClick={() => setAction("已打开")}>
                <Menu.Item.Icon>
                  <FolderOpen width={20} height={20} aria-hidden="true" />
                </Menu.Item.Icon>
                <Menu.Item.Label>打开文件</Menu.Item.Label>
                <Menu.Item.Shortcut aria-hidden="true">⌘O</Menu.Item.Shortcut>
              </Menu.Item>
              <Menu.Item disabled>移动到文件夹</Menu.Item>
              <Menu.Item onClick={() => setAction("已打开详情")}>
                <Menu.Item.Content>
                  <Menu.Item.Label>文件详情</Menu.Item.Label>
                  <Menu.Item.Description>大小与权限</Menu.Item.Description>
                </Menu.Item.Content>
              </Menu.Item>
              <Menu.Separator />
              <Menu.Group>
                <Menu.GroupLabel>整理</Menu.GroupLabel>
                <Menu.CheckboxItem
                  checked={pinned}
                  onCheckedChange={setPinned}
                  closeOnClick={false}
                >
                  <Menu.CheckboxItemIndicator keepMounted>✓</Menu.CheckboxItemIndicator>加入收藏
                </Menu.CheckboxItem>
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger>
                    排序方式{" "}
                    <Menu.Item.SubmenuIndicator>
                      <IconChevronRight width={14} height={20} />
                    </Menu.Item.SubmenuIndicator>
                  </Menu.SubmenuTrigger>
                  <Menu.Portal>
                    <Menu.Positioner>
                      <Menu.Popup>
                        <Menu.RadioGroup defaultValue="name">
                          <Menu.RadioItem value="name">
                            <Menu.RadioItemIndicator>✓</Menu.RadioItemIndicator>名称
                          </Menu.RadioItem>
                          <Menu.RadioItem value="date">
                            <Menu.RadioItemIndicator>✓</Menu.RadioItemIndicator>修改日期
                          </Menu.RadioItem>
                        </Menu.RadioGroup>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.SubmenuRoot>
              </Menu.Group>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu>

      <Menu>
        <Menu.Bar aria-label="Edit actions">
          <Menu.BarItem onClick={() => setAction("Cut")}>Cut</Menu.BarItem>
          <Menu.BarItem onClick={() => setAction("Copied")}>Copy</Menu.BarItem>
          <Menu.BarItem onClick={() => setAction("Pasted")}>Paste</Menu.BarItem>
          <Menu.ExpandTrigger />
        </Menu.Bar>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup aria-label="More edit actions">
              <Menu.Item onClick={() => setAction("Selected all")}>Select All</Menu.Item>
              <Menu.Item onClick={() => setAction("Duplicated")}>Duplicate</Menu.Item>
              <Menu.Separator />
              <Menu.Item onClick={() => setAction("Shared")}>Share</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu>
      <output aria-live="polite" {...stylex.props(s.status)}>
        {action || (pinned ? "已加入收藏" : "选择一项操作")}
      </output>
    </div>
  );
}
