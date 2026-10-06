"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from "react";
import { Button, Card, TextArea, TextField } from "@lenso/ui";
import { ArrowDownToLine, ArrowUp, Copy, Paperclip } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { chat } from "../styles/theme-builder-chat.stylex";
import { downloadText, layoutNote, type Message } from "./theme-builder-chat-parts";

export function ChatAnswer({
  message,
  announce,
}: {
  message: Message;
  announce: (text: string) => void;
}) {
  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(
        message.text + (message.document ? `\n\n${layoutNote}` : ""),
      );
      announce("Answer copied.");
    } catch {
      announce("Could not copy the answer. Select the text to copy it manually.");
    }
  }
  return (
    <div {...stylex.props(chat.answer)}>
      <p {...stylex.props(chat.sampleLabel)}>SAMPLE ANSWER</p>
      <p dir="auto" {...stylex.props(chat.messageText)}>
        {message.text}
      </p>
      {message.document && (
        <Card xstyle={chat.document}>
          <Card.Header>
            <Card.Title>Dashboard layout note</Card.Title>
            <Card.Description>Original sample · Markdown document</Card.Description>
          </Card.Header>
          <Card.Content>
            <ol {...stylex.props(chat.documentList)}>
              <li>Title and date range together</li>
              <li>Revenue, expenses and profit first</li>
              <li>Two chart columns, stacked on phones</li>
              <li>A separate scroll region for the table</li>
            </ol>
          </Card.Content>
          <Card.Footer>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => downloadText(layoutNote, "dashboard-layout-note.md")}
            >
              <Button.Icon>
                <ArrowDownToLine />
              </Button.Icon>
              Download sample
            </Button>
          </Card.Footer>
        </Card>
      )}
      <Button size="sm" variant="ghost" onClick={copyAnswer} xstyle={chat.copyButton}>
        <Button.Icon>
          <Copy />
        </Button.Icon>
        Copy answer
      </Button>
    </div>
  );
}

export function ChatComposer({
  draft,
  setDraft,
  submit,
  textareaRef,
  conversationId,
  announce,
}: {
  draft: string;
  setDraft: (value: string | ((current: string) => string)) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  conversationId: string;
  announce: (text: string) => void;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError("Choose a .txt or .md file.");
      return;
    }
    if (file.size > 64 * 1024) {
      setError("Text files must be 64 KiB or smaller.");
      return;
    }
    const originTextarea = textareaRef.current;
    const originFocus = document.activeElement;
    try {
      const text = await file.text();
      if (text.includes("\0")) {
        setError("This file is not plain text. Choose a .txt or .md file.");
        return;
      }
      // The setter is bound to the conversation where this import began.
      setDraft((current) => (current ? `${current}\n\n${text}` : text));
      if (
        originTextarea?.isConnected &&
        originTextarea === textareaRef.current &&
        originTextarea.getClientRects().length > 0 &&
        document.activeElement === originFocus
      ) {
        announce(`${file.name} imported into the local draft.`);
        originTextarea.focus();
      }
    } catch {
      setError("Could not read this file. Please choose another text file.");
    }
  }

  return (
    <div {...stylex.props(chat.composerDock)}>
      <form onSubmit={submit} {...stylex.props(chat.composer)}>
        <TextField key={conversationId} fullWidth>
          <label htmlFor={`${id}-message`} {...stylex.props(chat.visuallyHidden)}>
            Message
          </label>
          <TextArea
            ref={textareaRef}
            id={`${id}-message`}
            name="message"
            fullWidth
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message…"
            aria-describedby={`${id}-note`}
            xstyle={chat.textarea}
          />
        </TextField>
        <div {...stylex.props(chat.composerFooter)}>
          <label htmlFor={`${id}-file`} {...stylex.props(chat.visuallyHidden)}>
            Attach text file
          </label>
          <input
            ref={fileRef}
            id={`${id}-file`}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={importFile}
            {...stylex.props(chat.hiddenFile)}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            aria-label="Attach text file"
            onClick={() => fileRef.current?.click()}
            xstyle={chat.roundButton}
          >
            <Button.Icon>
              <Paperclip />
            </Button.Icon>
          </Button>
          <Button
            type="submit"
            size="sm"
            aria-label="Send message"
            disabled={!draft.trim()}
            xstyle={chat.roundButton}
          >
            <Button.Icon>
              <ArrowUp />
            </Button.Icon>
          </Button>
        </div>
      </form>
      {error && (
        <p role="alert" {...stylex.props(chat.importError)}>
          {error}
        </p>
      )}
      <p id={`${id}-note`} {...stylex.props(chat.composerNote)}>
        Local only · Sends add your message. No AI replies are generated.
      </p>
    </div>
  );
}
