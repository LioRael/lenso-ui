"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { Button } from "@lenso/ui/button";

import { PromptComposer } from "../../../../registry/source/recipes/prompt-composer";
import { styles } from "./agent-page.stylex";

export interface AgentPageProps extends Omit<
  React.ComponentPropsWithoutRef<"main">,
  "className" | "onSubmit"
> {
  as?: "div" | "main";
  description?: string;
  draft: string;
  idPrefix?: string;
  onDraftChange: (value: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  title?: string;
  xstyle?: stylex.StyleXStyles;
}

export const AgentPage = React.forwardRef<HTMLElement, AgentPageProps>(function AgentPage(
  {
    as = "main",
    children,
    description = "A focused surface for one prompt-and-response workflow.",
    draft,
    idPrefix,
    onDraftChange,
    onSubmit,
    title = "Agent workspace",
    xstyle,
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
      <header {...stylex.props(styles.header)}>
        <div>
          <h1 id={titleId} {...stylex.props(styles.title)}>
            {title}
          </h1>
          <p {...stylex.props(styles.description)}>{description}</p>
        </div>
      </header>

      <section aria-label="Conversation" {...stylex.props(styles.transcript)}>
        <div {...stylex.props(styles.turns)}>{children}</div>
      </section>

      <div {...stylex.props(styles.composerDock)}>
        <span id={composerLabelId} {...stylex.props(styles.visuallyHidden)}>
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
            <span {...stylex.props(styles.shortcutHint)}>Control or Command + Enter to submit</span>
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
    className: stylex.props(styles.root, xstyle).className,
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

export interface AgentTurnProps extends Omit<
  React.ComponentPropsWithoutRef<"article">,
  "className"
> {
  label: string;
  speaker: "assistant" | "user";
  xstyle?: stylex.StyleXStyles;
}

export const AgentTurn = React.forwardRef<HTMLElement, AgentTurnProps>(function AgentTurn(
  { children, label, speaker, xstyle, ...props },
  ref,
) {
  return (
    <article
      {...props}
      className={stylex.props(styles.turn, speaker === "user" && styles.userTurn, xstyle).className}
      data-speaker={speaker}
      data-slot="agent-turn"
      ref={ref}
    >
      <h2 {...stylex.props(styles.turnLabel)}>{label}</h2>
      <div {...stylex.props(styles.turnBody)}>
        <div {...stylex.props(styles.turnContent)}>{children}</div>
      </div>
    </article>
  );
});
