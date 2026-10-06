"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Popover } from "@lenso/ui";
import { ArrowDownToLine, Bars } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { chat } from "../styles/theme-builder-chat.stylex";
import {
  ChatNavigation,
  ChatSearch,
  downloadText,
  initialConversations,
  layoutNote,
  type Message,
} from "./theme-builder-chat-parts";
import { ChatAnswer, ChatComposer } from "./theme-builder-chat-content";
import { usePreviewActivity } from "./preview-activity";

export function ThemeBuilderChat() {
  const { active: previewActive, returnFocus } = usePreviewActivity();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  const [active, setActive] = useState("design");
  const [search, setSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState("");
  const [scrollRequest, setScrollRequest] = useState(0);
  const sequence = useRef(0);
  const paneRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const conversation = conversations.find((item) => item.id === active) ?? conversations[0]!;
  const draft = drafts[conversation.id] ?? "";
  const query = messageSearch.trim().toLocaleLowerCase();
  const messages = conversation.messages.filter((message) =>
    `${message.author} ${message.text} ${message.document ? layoutNote : ""}`
      .toLocaleLowerCase()
      .includes(query),
  );

  // Only explicit history navigation and sends move the reading position.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    if (pane.clientHeight > 0) {
      pane.scrollTop = pane.scrollHeight;
      return;
    }
    // Global preview panels mount hidden; initialize history when first revealed.
    const observer = new ResizeObserver(() => {
      if (pane.clientHeight > 0) {
        pane.scrollTop = pane.scrollHeight;
        observer.disconnect();
      }
    });
    observer.observe(pane);
    return () => observer.disconnect();
  }, [active, scrollRequest]);

  function selectConversation(key: string) {
    setActive(key);
    setMessageSearch("");
  }

  function createConversation(title: string) {
    sequence.current += 1;
    const key = `conversation-${sequence.current}`;
    setConversations((current) => [...current, { id: key, title, messages: [] }]);
    setSearch("");
    selectConversation(key);
  }

  function setDraft(value: string | ((current: string) => string)) {
    const key = conversation.id;
    setDrafts((current) => ({
      ...current,
      [key]: typeof value === "function" ? value(current[key] ?? "") : value,
    }));
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    sequence.current += 1;
    const message: Message = { id: `message-${sequence.current}`, author: "You", text: draft };
    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id ? { ...item, messages: [...item.messages, message] } : item,
      ),
    );
    setDraft("");
    setMessageSearch("");
    setAnnouncement(`Message added locally to ${conversation.title}.`);
    setScrollRequest((current) => current + 1);
    composerRef.current?.focus();
  }

  function exportTranscript() {
    downloadText(
      [
        `${conversation.title} — Local preview transcript`,
        "Static sample assistant answers and locally added user messages. No model is connected.",
        "",
        ...conversation.messages.map(
          (message) =>
            `${message.author}\n${message.text}${message.document ? `\n\n${layoutNote}` : ""}\n`,
        ),
      ].join("\n"),
      `conversation-${conversation.id}.txt`,
    );
  }

  const navigation = {
    conversations,
    active: conversation.id,
    search,
    setSearch,
    select: selectConversation,
    create: createConversation,
  };
  return (
    <section aria-label="Chat local demo" {...stylex.props(chat.root)}>
      <aside {...stylex.props(chat.desktopRail)}>
        <ChatNavigation {...navigation} />
      </aside>
      <section
        aria-label={`Conversation in ${conversation.title}`}
        {...stylex.props(chat.conversation)}
      >
        <header {...stylex.props(chat.conversationHeader)}>
          <Popover
            open={previewActive && navigationOpen}
            onOpenChange={setNavigationOpen}
            onOpenChangeComplete={(open) => {
              if (!open) setNavigationOpen(false);
            }}
          >
            <Popover.Trigger
              render={
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Conversations"
                  xstyle={chat.menuButton}
                />
              }
            >
              <Button.Icon>
                <Bars />
              </Button.Icon>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="bottom" align="start" sideOffset={8}>
                <Popover.Popup
                  xstyle={chat.navigationPopup}
                  finalFocus={previewActive ? undefined : returnFocus}
                >
                  <Popover.Title xstyle={chat.visuallyHidden}>Conversations</Popover.Title>
                  <ChatNavigation {...navigation} />
                  <Popover.Close
                    render={<Button size="sm" variant="ghost" xstyle={chat.backButton} />}
                  >
                    Back to conversation
                  </Popover.Close>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover>
          <div {...stylex.props(chat.headerTitle)}>
            <h3 {...stylex.props(chat.channelTitle)}>{conversation.title}</h3>
            <p {...stylex.props(chat.headerSubtitle)}>Updated locally · Sample conversation</p>
          </div>
          <ChatSearch label="Search messages" value={messageSearch} onChange={setMessageSearch} />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Export transcript"
            onClick={exportTranscript}
            xstyle={chat.headerAction}
          >
            <Button.Icon>
              <ArrowDownToLine />
            </Button.Icon>
            <span {...stylex.props(chat.desktopActionText)}>Export transcript</span>
          </Button>
        </header>
        {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- History needs native keyboard scrolling. */}
        <div
          ref={paneRef}
          aria-label="Message history"
          tabIndex={0}
          {...stylex.props(chat.messagePane)}
        >
          <ol aria-label="Messages" {...stylex.props(chat.thread)}>
            {messages.map((message) => (
              <li
                key={message.id}
                {...stylex.props(chat.message, message.author === "You" && chat.ownMessage)}
              >
                {message.author === "You" ? (
                  <p dir="auto" {...stylex.props(chat.messageText, chat.ownBubble)}>
                    <span {...stylex.props(chat.visuallyHidden)}>You: </span>
                    {message.text}
                  </p>
                ) : (
                  <ChatAnswer message={message} announce={setAnnouncement} />
                )}
              </li>
            ))}
          </ol>
          {messages.length === 0 && (
            <p {...stylex.props(chat.emptyState)}>
              {query
                ? "No messages match your search."
                : "No messages yet. Write the first note below."}
            </p>
          )}
        </div>
        {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
        <ChatComposer
          key={conversation.id}
          conversationId={conversation.id}
          draft={draft}
          setDraft={setDraft}
          submit={sendMessage}
          textareaRef={composerRef}
          announce={setAnnouncement}
        />
      </section>
      <output aria-live="polite" aria-atomic="true" {...stylex.props(chat.visuallyHidden)}>
        {announcement}
      </output>
    </section>
  );
}
