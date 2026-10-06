"use client";

import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Avatar,
  Button,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Popover,
  TextArea,
  TextField,
  type CollectionKey,
} from "@lenso/ui";
import { Archive, Bars, Envelope, Pencil, Star, ArrowRotateLeft } from "@gravity-ui/icons";
import { mail as s } from "@/styles/theme-builder-mail.stylex";

type Folder = "Inbox" | "Starred" | "Archived";
type Mail = {
  id: string;
  sender: string;
  email: string;
  subject: string;
  time: string;
  body: string[];
  starred: boolean;
  archived: boolean;
  replies: string[];
};

const folders = [
  { label: "Inbox", Icon: Envelope },
  { label: "Starred", Icon: Star },
  { label: "Archived", Icon: Archive },
] as const;
const sampleMail: Mail[] = [
  {
    id: "field-notes",
    sender: "Maya Chen",
    email: "maya@northline.example",
    subject: "Field Notes — ready for a first look",
    time: "10:42 AM",
    body: [
      "Hi team,",
      "The first pass of the Field Notes identity is ready for review. We’ve kept the wordmark quiet and given the editorial layouts a little more room to breathe.",
      "Could you take a look at the type hierarchy before Thursday? I’m especially interested in how the small captions feel beside the larger stories.",
      "If the direction feels right, I’ll carry it through to the product pages next.",
      "Thanks,\nMaya",
    ],
    starred: true,
    archived: false,
    replies: [],
  },
  {
    id: "research",
    sender: "Oliver Grant",
    email: "oliver@northline.example",
    subject: "What we heard in the onboarding interviews",
    time: "9:18 AM",
    body: [
      "Morning everyone,",
      "A clear pattern from yesterday’s sessions: people want to see a useful example before setting up their own workspace.",
      "For the next prototype, let’s try a sample project with one obvious starting point. We can keep the advanced configuration out of the first-run flow.",
      "I’ll bring the interview notes to our product critique.",
      "Oliver",
    ],
    starred: false,
    archived: false,
    replies: [],
  },
  {
    id: "critique",
    sender: "Sofia Reyes",
    email: "sofia@northline.example",
    subject: "Thursday critique / bring one open question",
    time: "Yesterday",
    body: [
      "Hi studio,",
      "Our critique is at 2 PM on Thursday. Bring one unfinished piece and one question you’d like the group to help with.",
      "We’ll start with the booking flow, then look at Field Notes. No polished decks needed.",
      "See you there,\nSofia",
    ],
    starred: false,
    archived: false,
    replies: [],
  },
  {
    id: "handoff",
    sender: "James Park",
    email: "james@northline.example",
    subject: "Booking flow handoff — a few details",
    time: "Tuesday",
    body: [
      "Hey team,",
      "The booking flow is ready for implementation. The final review caught two details: preserve the selected date when going back, and put the error message beside the field it belongs to.",
      "I’ve written up the empty, loading, and confirmation states so there’s no guesswork at handoff.",
      "Thanks for the thoughtful feedback,\nJames",
    ],
    starred: true,
    archived: false,
    replies: [],
  },
  {
    id: "print",
    sender: "Amara Okafor",
    email: "amara@northline.example",
    subject: "Print proofs approved",
    time: "Monday",
    body: [
      "Hi all,",
      "The paper samples arrived and the warm stock is the winner. The small type holds up well, even on the reverse of the postcards.",
      "I’ve approved the proofs. We’re all set for next week’s studio open house.",
      "Amara",
    ],
    starred: false,
    archived: true,
    replies: [],
  },
];

function inFolder(message: Mail, folder: Folder) {
  if (folder === "Archived") return message.archived;
  if (folder === "Starred") return message.starred && !message.archived;
  return !message.archived;
}

function matchesSearch(message: Mail, search: string) {
  return [message.sender, message.email, message.subject, ...message.body, ...message.replies]
    .join(" ")
    .toLowerCase()
    .includes(search.trim().toLowerCase());
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function ComposeForm({
  reply,
  onSend,
  recipientRef,
}: {
  reply: Mail | null;
  onSend: (recipient: string, subject: string, body: string) => void;
  recipientRef: RefObject<HTMLElement | null>;
}) {
  const [recipient, setRecipient] = useState(reply?.email ?? "");
  const [subject, setSubject] = useState(reply ? `Re: ${reply.subject}` : "");
  const [body, setBody] = useState("");
  const valid = !!recipient.trim() && !!subject.trim() && !!body.trim();
  const helpId = useId();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (valid && event.currentTarget.reportValidity())
      onSend(recipient.trim(), subject.trim(), body.trim());
  }

  return (
    <form onSubmit={submit} {...stylex.props(s.composeForm)}>
      <TextField fullWidth name="recipient">
        <Label>To</Label>
        <Input
          ref={recipientRef}
          type="email"
          required
          fullWidth
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
        />
      </TextField>
      <TextField fullWidth name="subject">
        <Label>Subject</Label>
        <Input
          required
          fullWidth
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </TextField>
      <TextField fullWidth name="message">
        <Label>Message</Label>
        <TextArea
          required
          fullWidth
          rows={6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </TextField>
      <p id={helpId} {...stylex.props(s.small, s.muted)}>
        Fill in a recipient, subject, and message to send locally.
      </p>
      <div {...stylex.props(s.actions)}>
        <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
        <Button type="submit" disabled={!valid} aria-describedby={helpId}>
          Send locally
        </Button>
      </div>
    </form>
  );
}

function FolderButtons({
  folder,
  messages,
  onChange,
  compact = false,
}: {
  folder: Folder;
  messages: Mail[];
  onChange: (folder: Folder) => void;
  compact?: boolean;
}) {
  return (
    <nav aria-label="Mail folders" {...stylex.props(s.folders)}>
      {folders.map(({ label, Icon }) => (
        <Button
          key={label}
          size="sm"
          variant="ghost"
          aria-label={label}
          aria-pressed={folder === label}
          xstyle={[s.folder, folder === label && s.activeFolder]}
          onClick={() => onChange(label)}
        >
          <Button.Icon>
            <Icon />
          </Button.Icon>
          <span {...stylex.props(s.folderText, compact && s.compactText)}>{label}</span>
          <span {...stylex.props(s.count, compact && s.compactText)}>
            {messages.filter((message) => inFolder(message, label)).length}
          </span>
        </Button>
      ))}
    </nav>
  );
}

function MailThread({
  selected,
  headingId,
  onBack,
  onStar,
  onArchive,
  onReply,
}: {
  selected: Mail | null;
  headingId: string;
  onBack: () => void;
  onStar: () => void;
  onArchive: () => void;
  onReply: () => void;
}) {
  return (
    <section
      aria-labelledby={selected ? headingId : undefined}
      aria-label={selected ? undefined : "Reading pane"}
      {...stylex.props(s.thread)}
    >
      {selected ? (
        <>
          <div {...stylex.props(s.threadToolbar)}>
            <Button size="sm" variant="ghost" xstyle={s.back} onClick={onBack}>
              Back to list
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              aria-label={selected.starred ? "Unstar" : "Star"}
              aria-pressed={selected.starred}
              onClick={onStar}
            >
              <Button.Icon>
                <Star />
              </Button.Icon>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              aria-label={selected.archived ? "Restore to inbox" : "Archive"}
              onClick={onArchive}
            >
              <Button.Icon>{selected.archived ? <ArrowRotateLeft /> : <Archive />}</Button.Icon>
            </Button>
          </div>
          <article {...stylex.props(s.article)}>
            <h3 id={headingId} {...stylex.props(s.threadSubject)}>
              {selected.subject}
            </h3>
            <div {...stylex.props(s.identity)}>
              <Avatar xstyle={s.avatar}>
                <Avatar.Fallback>{initials(selected.sender)}</Avatar.Fallback>
              </Avatar>
              <div {...stylex.props(s.identityCopy)}>
                <strong>{selected.sender}</strong>
                <span {...stylex.props(s.muted)}>{selected.email}</span>
              </div>
              <span {...stylex.props(s.time)}>{selected.time}</span>
            </div>
            <div {...stylex.props(s.body)}>
              {selected.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {selected.replies.map((body, index) => (
              <div key={`${selected.id}-${index}`} {...stylex.props(s.reply)}>
                <strong {...stylex.props(s.small)}>You · sent locally</strong>
                <p {...stylex.props(s.replyBody)}>{body}</p>
              </div>
            ))}
            <Modal.Trigger render={<Button size="sm" variant="secondary" />} onClick={onReply}>
              Reply
            </Modal.Trigger>
          </article>
        </>
      ) : (
        <p {...stylex.props(s.empty)}>Select a message to read the conversation.</p>
      )}
    </section>
  );
}

export function ThemeBuilderMail() {
  const headingId = useId();
  const [messages, setMessages] = useState(sampleMail);
  const [folder, setFolder] = useState<Folder>("Inbox");
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<CollectionKey>>(new Set(["field-notes"]));
  const [showThread, setShowThread] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState<Mail | null>(null);
  const [notice, setNotice] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLElement>(null);
  const recipientRef = useRef<HTMLElement>(null);
  const visible = messages.filter(
    (message) => inFolder(message, folder) && matchesSearch(message, search),
  );
  const visibleKeys = new Set(visible.map((message) => message.id));
  const activeKeys = new Set([...selectedKeys].filter((key) => visibleKeys.has(String(key))));
  const selected = visible.find((message) => activeKeys.has(message.id)) ?? null;

  function updateMessage(id: string, update: (message: Mail) => Mail) {
    setMessages((current) =>
      current.map((message) => (message.id === id ? update(message) : message)),
    );
  }

  function backToList() {
    setShowThread(false);
    requestAnimationFrame(() => {
      const option =
        listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]') ??
        listRef.current?.querySelector<HTMLElement>('[role="option"]');
      (option ?? listRef.current)?.focus();
    });
  }

  function changeFolder(next: Folder) {
    setFolder(next);
    setSelectedKeys(new Set());
    setShowThread(false);
    setNavOpen(false);
  }

  function send(recipient: string, subject: string, body: string) {
    if (reply)
      updateMessage(reply.id, (message) => ({ ...message, replies: [...message.replies, body] }));
    setNotice(`Sent locally to ${recipient}: ${subject}. Nothing left this demo.`);
    setOpen(false);
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <section aria-label="Sample studio inbox" {...stylex.props(s.root)}>
        <div {...stylex.props(s.workspace)}>
          <aside {...stylex.props(s.rail)}>
            <div {...stylex.props(s.profile)}>
              <Avatar xstyle={s.avatar}>
                <Avatar.Fallback>NS</Avatar.Fallback>
              </Avatar>
              <div {...stylex.props(s.compactText)}>
                <h2 {...stylex.props(s.studio)}>Northline Studio</h2>
                <p {...stylex.props(s.small, s.muted)}>Sample mail</p>
              </div>
            </div>
            <FolderButtons folder={folder} messages={messages} onChange={changeFolder} compact />
            <div {...stylex.props(s.railFooter)}>
              <p {...stylex.props(s.small, s.muted, s.compactText)}>
                Local sample · No email delivered
              </p>
              <Modal.Trigger
                aria-label="Compose"
                render={<Button size="sm" fullWidth xstyle={s.compose} />}
                onClick={() => setReply(null)}
              >
                <Button.Icon>
                  <Pencil />
                </Button.Icon>
                <span {...stylex.props(s.compactText)}>Compose</span>
              </Modal.Trigger>
            </div>
          </aside>
          <header {...stylex.props(s.mobileHeader)}>
            <Popover open={navOpen} onOpenChange={setNavOpen}>
              <Popover.Trigger
                render={<Button size="sm" variant="ghost" />}
                aria-label="Mail folders"
              >
                <Button.Icon>
                  <Bars />
                </Button.Icon>
                {folder}
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side="bottom" align="start" sideOffset={8}>
                  <Popover.Popup xstyle={s.navPopup}>
                    <Popover.Title>Sample mail</Popover.Title>
                    <FolderButtons folder={folder} messages={messages} onChange={changeFolder} />
                    <Popover.Description>Local sample. No email delivered.</Popover.Description>
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover>
            <Modal.Trigger render={<Button size="sm" />} onClick={() => setReply(null)}>
              Compose
            </Modal.Trigger>
          </header>
          <div {...stylex.props(s.list, showThread && selected && s.listHidden)}>
            <div {...stylex.props(s.listHeader)}>
              <Input
                ref={fallbackRef}
                type="search"
                fullWidth
                aria-label="Search mail"
                placeholder="Search mail…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedKeys(new Set());
                  setShowThread(false);
                }}
              />
            </div>
            <ListBox
              ref={listRef}
              aria-label={`${folder} messages`}
              selectionMode="single"
              selectedKeys={activeKeys}
              onSelectionChange={setSelectedKeys}
              onAction={() => {
                setShowThread(true);
                requestAnimationFrame(() => {
                  if (window.matchMedia("(max-width: 767px)").matches) threadRef.current?.focus();
                });
              }}
              xstyle={s.messageList}
            >
              {visible.map((message) => (
                <ListBoxItem
                  key={message.id}
                  itemKey={message.id}
                  textValue={`${message.sender} ${message.subject}`}
                  aria-label={`${message.sender}: ${message.subject}`}
                  xstyle={[s.messageRow, selected?.id === message.id && s.selectedRow]}
                >
                  <Avatar xstyle={s.avatar}>
                    <Avatar.Fallback>{initials(message.sender)}</Avatar.Fallback>
                  </Avatar>
                  <span {...stylex.props(s.messageCopy)}>
                    <span {...stylex.props(s.senderLine)}>
                      <span {...stylex.props(s.sender)}>{message.sender}</span>
                      <span {...stylex.props(s.time)}>{message.time}</span>
                    </span>
                    <span {...stylex.props(s.subject)}>{message.subject}</span>
                    <span {...stylex.props(s.excerpt)}>{message.body[1]}</span>
                  </span>
                </ListBoxItem>
              ))}
            </ListBox>
            {!visible.length && (
              <p {...stylex.props(s.empty)}>No messages found. Try another folder or search.</p>
            )}
          </div>
          <div
            ref={threadRef}
            tabIndex={-1}
            {...stylex.props(s.threadFrame, (!showThread || !selected) && s.threadHidden)}
          >
            <MailThread
              selected={selected}
              headingId={headingId}
              onBack={backToList}
              onReply={() => setReply(selected)}
              onStar={() => {
                if (!selected) return;
                updateMessage(selected.id, (message) => ({
                  ...message,
                  starred: !message.starred,
                }));
                if (folder === "Starred") {
                  setSelectedKeys(new Set());
                  backToList();
                }
              }}
              onArchive={() => {
                if (!selected) return;
                updateMessage(selected.id, (message) => ({
                  ...message,
                  archived: !message.archived,
                }));
                setNotice(selected.archived ? "Moved to Inbox." : "Moved to Archived.");
                setSelectedKeys(new Set());
                backToList();
              }}
            />
          </div>
        </div>
        <output {...stylex.props(s.status)}>
          {notice || "Messages and changes stay in this preview."}
        </output>
      </section>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup
            size="md"
            initialFocus={recipientRef}
            finalFocus={reply && selected?.id !== reply.id ? fallbackRef : undefined}
            xstyle={s.popup}
          >
            <Modal.Header>
              <Modal.Title>{reply ? "Reply to message" : "New message"}</Modal.Title>
              <Modal.Description>
                This is a local demo. No email will be delivered.
              </Modal.Description>
              <Modal.Close />
            </Modal.Header>
            <Modal.Body>
              {open && (
                <ComposeForm
                  key={reply?.id ?? "compose"}
                  reply={reply}
                  onSend={send}
                  recipientRef={recipientRef}
                />
              )}
            </Modal.Body>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>
  );
}
