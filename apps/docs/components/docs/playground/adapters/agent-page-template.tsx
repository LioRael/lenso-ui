"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { ThemeScope } from "@lenso/ui/theme-scope";

import { AgentPage, AgentTurn } from "../../../templates/agent-page";
import type { PlaygroundAdapter } from "../types";
import { styles } from "./template-pages.stylex";

function AgentPagePreview() {
  const [draft, setDraft] = React.useState("");

  return (
    <AgentPage
      as="div"
      draft={draft}
      idPrefix="agent-template-preview"
      onDraftChange={setDraft}
      onSubmit={(event) => event.preventDefault()}
    >
      <AgentTurn label="You" speaker="user">
        <p>Summarize the decision points in these notes and call out anything unresolved.</p>
      </AgentTurn>
      <AgentTurn label="Assistant" speaker="assistant">
        <p>
          The notes converge on three decisions: keep the scope narrow, expose explicit seams, and
          let the application own durable state.
        </p>
        <p>The remaining question is who approves the final rollout.</p>
      </AgentTurn>
    </AgentPage>
  );
}

export const agentPageAdapter: PlaygroundAdapter = ({ theme }) => (
  <ThemeScope className={stylex.props(styles.stage).className} theme={theme}>
    <div {...stylex.props(styles.frame)}>
      <AgentPagePreview />
    </div>
  </ThemeScope>
);
