"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";

import { PromptComposer } from "../../../../registry/source/recipes/prompt-composer";
import styles from "./agent-page.module.css";

function mergeClassName(generated?: string, className?: string): string {
  return [generated, className].filter(Boolean).join(" ");
}

export interface AgentPageProps extends Omit<React.ComponentPropsWithoutRef<"main">, "onSubmit"> {
  as?: "div" | "main";
  description?: string;
  draft: string;
  idPrefix?: string;
  onDraftChange: (value: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  title?: string;
}

export const AgentPage = React.forwardRef<HTMLElement, AgentPageProps>(function AgentPage(
  {
    as = "main",
    children,
    className,
    description = "A focused surface for one prompt-and-response workflow.",
    draft,
    idPrefix,
    onDraftChange,
    onSubmit,
    title = "Agent workspace",
    ...props
  },
  ref,
) {
  const generatedId = React.useId().replaceAll(":", "");
  const prefix = idPrefix ?? `agent-page-${generatedId}`;
  const titleId = `${prefix}-title`;
  const composerLabelId = `${prefix}-composer-label`;

  const content = (
    <>
      <header className={styles.header}>
        <div>
          <h1 id={titleId}>{title}</h1>
          <p>{description}</p>
        </div>
      </header>

      <section aria-label="Conversation" className={styles.transcript}>
        <div className={styles.turns}>{children}</div>
      </section>

      <div className={styles.composerDock}>
        <span className={styles.visuallyHidden} id={composerLabelId}>
          Message
        </span>
        <PromptComposer.Root
          aria-label="Compose a message"
          maxRows={8}
          onSubmit={onSubmit}
          onValueChange={onDraftChange}
          value={draft}
        >
          <PromptComposer.Input
            aria-labelledby={composerLabelId}
            placeholder="Describe what you want to work on…"
          />
          <PromptComposer.Toolbar>
            <span className={styles.shortcutHint}>Control or Command + Enter to submit</span>
            <PromptComposer.Actions>
              <Button type="submit">Send</Button>
            </PromptComposer.Actions>
          </PromptComposer.Toolbar>
        </PromptComposer.Root>
      </div>
    </>
  );

  const rootProps = {
    ...props,
    "aria-labelledby": titleId,
    className: mergeClassName(styles.root, className),
    "data-slot": "agent-page-template",
  };

  return as === "div" ? (
    <div {...rootProps} ref={ref as React.ForwardedRef<HTMLDivElement>}>
      {content}
    </div>
  ) : (
    <main {...rootProps} ref={ref}>
      {content}
    </main>
  );
});

export interface AgentTurnProps extends React.ComponentPropsWithoutRef<"article"> {
  label: string;
  speaker: "assistant" | "user";
}

export const AgentTurn = React.forwardRef<HTMLElement, AgentTurnProps>(function AgentTurn(
  { children, className, label, speaker, ...props },
  ref,
) {
  return (
    <article
      {...props}
      className={mergeClassName(styles.turn, className)}
      data-speaker={speaker}
      data-slot="agent-turn"
      ref={ref}
    >
      <h2>{label}</h2>
      <div className={styles.turnBody}>{children}</div>
    </article>
  );
});
