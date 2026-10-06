"use client";

import { useId, useState, type FormEvent } from "react";
import { Avatar, Button, Input, ListBox, ListBoxItem, Modal, Popover, TextField } from "@lenso/ui";
import { Comment, Magnifier, Plus } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { chat } from "../styles/theme-builder-chat.stylex";
import { usePreviewActivity } from "./preview-activity";

export type Message = {
  id: string;
  author: "You" | "Sample assistant";
  text: string;
  document?: boolean;
};
export type Conversation = {
  id: string;
  title: string;
  messages: readonly Message[];
};

export const layoutNote = [
  "# Dashboard layout note",
  "",
  "Purpose: make the monthly studio report easy to scan.",
  "",
  "1. Keep the report title and date range together.",
  "2. Put revenue, expenses and profit before the charts.",
  "3. Use two chart columns on desktop; stack them on a phone.",
  "4. Keep the employee table in its own horizontal scroll region.",
  "",
  "Review at 390px and 1390px. Check keyboard focus and long labels in both themes.",
].join("\n");

export const initialConversations: Conversation[] = [
  {
    id: "design",
    title: "Review a dashboard layout",
    messages: [
      {
        id: "design-1",
        author: "You",
        text: "How would you organize a monthly dashboard for a small design studio?",
      },
      {
        id: "design-2",
        author: "Sample assistant",
        text: "Start with the decision the report needs to support: are we earning enough to cover this month’s work?\n\nKeep revenue, expenses and profit together at the top. Follow with the sales trend and traffic sources, then the employee records. Give each section a clear heading so the page still makes sense without the charts.\n\nHere is a short layout note to use in a review.",
        document: true,
      },
      { id: "design-3", author: "You", text: "What should change on a phone?" },
      {
        id: "design-4",
        author: "Sample assistant",
        text: "Stack the charts and use a single column for the summary values when space is tight. Keep 16px content gutters and let only the employee table scroll horizontally.\n\nCheck the longest employee name and report title at 390px. The date range and download action should remain reachable without making the entire page wider.",
      },
    ],
  },
  {
    id: "engineering",
    title: "Check keyboard navigation",
    messages: [
      { id: "engineering-1", author: "You", text: "What should I check in a keyboard review?" },
      {
        id: "engineering-2",
        author: "Sample assistant",
        text: "Use this short pass before a visual review:\n\n1. Tab through the page in reading order. Every action needs visible focus.\n2. Open a menu or dialog, then dismiss it with Escape. Focus should return to its trigger.\n3. Navigate lists with the arrow keys and confirm that the selected item opens the right content.\n4. Enter a multiline draft, switch conversations and return. The unfinished text should still be there.\n\nRepeat at a narrow width; a collapsed rail must not leave hidden controls in the Tab order.",
      },
    ],
  },
  {
    id: "studio",
    title: "Plan a studio review",
    messages: [
      { id: "studio-1", author: "You", text: "Help me structure a 20-minute studio review." },
      {
        id: "studio-2",
        author: "Sample assistant",
        text: "Reserve five minutes for the goal and constraints, ten for the working interface, and five for decisions.\n\nAsk each person to bring one concrete observation: a task that was difficult, a label that was unclear, or a keyboard step that failed. End with an owner and a next step for each decision, rather than a second round of general impressions.",
      },
    ],
  },
];

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ChatSearch({
  label,
  value,
  onChange,
  rail = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rail?: boolean;
}) {
  const activity = usePreviewActivity();
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={activity.active && open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(open) => {
        if (!open) setOpen(false);
      }}
    >
      <Popover.Trigger
        render={
          <Button
            size="sm"
            variant={rail ? "ghost" : "secondary"}
            aria-label={label}
            xstyle={rail ? chat.railAction : chat.headerAction}
          />
        }
      >
        <Button.Icon>
          <Magnifier />
        </Button.Icon>
        <span {...stylex.props(!rail && chat.desktopActionText)}>{rail ? label : "Search"}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align={rail ? "start" : "end"} sideOffset={8}>
          <Popover.Popup
            xstyle={chat.searchPopup}
            finalFocus={!activity.active ? activity.returnFocus : undefined}
          >
            <Popover.Title>{label}</Popover.Title>
            <TextField fullWidth>
              <label htmlFor={id} {...stylex.props(chat.visuallyHidden)}>
                {label}
              </label>
              <Input id={id} type="search" fullWidth value={value} onValueChange={onChange} />
            </TextField>
            <p {...stylex.props(chat.small, chat.muted)}>Filters this local preview as you type.</p>
            <Popover.Close render={<Button size="sm" variant="ghost" />}>Done</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover>
  );
}

type NavigationProps = {
  conversations: readonly Conversation[];
  active: string;
  search: string;
  setSearch: (value: string) => void;
  select: (key: string) => void;
  create: (title: string) => void;
};

export function ChatNavigation({
  conversations,
  active,
  search,
  setSearch,
  select,
  create,
}: NavigationProps) {
  const activity = usePreviewActivity();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const visible = conversations.filter((item) =>
    [
      item.title,
      ...item.messages.map((message) => message.text),
      item.messages.some((message) => message.document) ? layoutNote : "",
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || title.trim().length > 80) return;
    create(title.trim());
    setTitle("");
    setOpen(false);
  }

  return (
    <div {...stylex.props(chat.navigation)}>
      <header {...stylex.props(chat.identity)}>
        <Avatar size="sm" aria-hidden="true">
          <Avatar.Fallback>YO</Avatar.Fallback>
        </Avatar>
        <div>
          <h2 {...stylex.props(chat.identityTitle)}>Your workspace</h2>
          <p {...stylex.props(chat.small, chat.muted)}>Local conversations</p>
        </div>
      </header>
      <div {...stylex.props(chat.railContent)}>
        <Modal
          open={activity.active && open}
          onOpenChange={setOpen}
          onOpenChangeComplete={(open) => {
            if (!open) setOpen(false);
          }}
        >
          <Modal.Trigger render={<Button size="sm" variant="ghost" xstyle={chat.railAction} />}>
            <Button.Icon>
              <Plus />
            </Button.Icon>
            New conversation
          </Modal.Trigger>
          <Modal.Portal>
            <Modal.Backdrop />
            <Modal.Viewport>
              <Modal.Popup
                size="sm"
                finalFocus={!activity.active ? activity.returnFocus : undefined}
              >
                <Modal.Header>
                  <Modal.Title>New conversation</Modal.Title>
                  <Modal.Description>
                    Create a local conversation. No model is connected.
                  </Modal.Description>
                </Modal.Header>
                <form onSubmit={submit}>
                  <Modal.Body>
                    <TextField fullWidth>
                      <label htmlFor={`${id}-title`}>Conversation title</label>
                      <Input
                        id={`${id}-title`}
                        fullWidth
                        required
                        maxLength={80}
                        value={title}
                        onValueChange={setTitle}
                      />
                    </TextField>
                    <p {...stylex.props(chat.small, chat.muted)}>
                      Use 1–80 characters, excluding surrounding spaces.
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
                    <Button type="submit" disabled={!title.trim() || title.trim().length > 80}>
                      Create conversation
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
        <ChatSearch label="Search conversations" value={search} onChange={setSearch} rail />
        <h3 {...stylex.props(chat.recentTitle)}>Recent</h3>
        <ListBox
          aria-label="Conversations"
          selectionMode="single"
          selectedKeys={new Set([active])}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0];
            if (typeof key === "string") select(key);
          }}
          xstyle={chat.channelList}
        >
          {visible.map((item) => (
            <ListBoxItem
              key={item.id}
              itemKey={item.id}
              textValue={item.title}
              aria-label={item.title}
              xstyle={[chat.channelRow, active === item.id && chat.selectedChannel]}
            >
              <Comment aria-hidden="true" width={16} height={16} />
              <span title={item.title} {...stylex.props(chat.rowTitle)}>
                {item.title}
              </span>
            </ListBoxItem>
          ))}
        </ListBox>
        {visible.length === 0 && (
          <p {...stylex.props(chat.small, chat.muted)}>No conversations match your search.</p>
        )}
      </div>
      <p {...stylex.props(chat.localNote)}>
        Sample answers · No model connected.
        <br />
        Drafts and messages stay in this preview.
      </p>
    </div>
  );
}
