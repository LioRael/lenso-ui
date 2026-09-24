"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { Surface, type SurfaceProps } from "@lenso/ui/surface";

import {
  autosizePromptComposerInput,
  normalizePromptComposerMaxRows,
  observePromptComposerReflow,
} from "./autosize";
import { shouldSubmitPrompt, type PromptComposerSubmitShortcut } from "./keyboard";
import { styles } from "./prompt-composer.stylex";

interface PromptComposerContextValue {
  maxRows: number;
  onValueChange: (value: string) => void;
  submitShortcut: PromptComposerSubmitShortcut;
  value: string;
}

const PromptComposerContext = React.createContext<PromptComposerContextValue | null>(null);

function usePromptComposer(): PromptComposerContextValue {
  const context = React.useContext(PromptComposerContext);
  if (!context) {
    throw new Error("PromptComposer parts must be rendered inside PromptComposer.Root");
  }
  return context;
}

type StyleXProps<Props> = Omit<Props, "className"> & { xstyle?: stylex.StyleXStyles };

function assignRef<Value>(ref: React.ForwardedRef<Value>, value: Value | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export interface PromptComposerRootProps extends StyleXProps<
  Omit<React.ComponentPropsWithoutRef<"form">, "onChange">
> {
  maxRows?: number;
  onValueChange: (value: string) => void;
  surfaceXstyle?: SurfaceProps["xstyle"];
  submitShortcut?: PromptComposerSubmitShortcut;
  value: string;
}

export const PromptComposerRoot = React.forwardRef<HTMLFormElement, PromptComposerRootProps>(
  (
    {
      children,
      maxRows = 8,
      onValueChange,
      surfaceXstyle,
      submitShortcut = "mod-enter",
      value,
      xstyle,
      ...props
    },
    ref,
  ) => {
    const context = React.useMemo<PromptComposerContextValue>(
      () => ({
        maxRows: normalizePromptComposerMaxRows(maxRows),
        onValueChange,
        submitShortcut,
        value,
      }),
      [maxRows, onValueChange, submitShortcut, value],
    );

    return (
      <PromptComposerContext.Provider value={context}>
        <Surface level="panel" xstyle={[styles.surface, surfaceXstyle]}>
          <form
            {...props}
            {...stylex.props(styles.root, xstyle)}
            data-slot="prompt-composer"
            ref={ref}
          >
            {children}
          </form>
        </Surface>
      </PromptComposerContext.Provider>
    );
  },
);
PromptComposerRoot.displayName = "PromptComposer.Root";

export interface PromptComposerInputProps extends StyleXProps<
  Omit<React.ComponentPropsWithoutRef<"textarea">, "defaultValue" | "onChange" | "value">
> {
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export const PromptComposerInput = React.forwardRef<HTMLTextAreaElement, PromptComposerInputProps>(
  ({ onChange, onKeyDown, rows = 1, xstyle, ...props }, forwardedRef) => {
    const { maxRows, onValueChange, submitShortcut, value } = usePromptComposer();
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const resize = React.useCallback(() => {
      if (textareaRef.current) {
        autosizePromptComposerInput(textareaRef.current, maxRows);
      }
    }, [maxRows]);

    React.useLayoutEffect(resize, [resize, value]);

    React.useLayoutEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      return observePromptComposerReflow(textarea, resize);
    }, [resize]);

    return (
      <textarea
        {...props}
        {...stylex.props(styles.input, xstyle)}
        data-slot="prompt-composer-input"
        onChange={(event) => {
          onValueChange(event.currentTarget.value);
          onChange?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) {
            return;
          }

          if (
            shouldSubmitPrompt(
              {
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                isComposing: event.nativeEvent.isComposing,
                key: event.key,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
              },
              submitShortcut,
            )
          ) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        ref={(node) => {
          textareaRef.current = node;
          assignRef(forwardedRef, node);
        }}
        rows={rows}
        value={value}
      />
    );
  },
);
PromptComposerInput.displayName = "PromptComposer.Input";

export type PromptComposerToolbarProps = StyleXProps<React.ComponentPropsWithoutRef<"div">>;

export const PromptComposerToolbar = React.forwardRef<HTMLDivElement, PromptComposerToolbarProps>(
  ({ xstyle, ...props }, ref) => (
    <div
      {...props}
      {...stylex.props(styles.toolbar, xstyle)}
      data-slot="prompt-composer-toolbar"
      ref={ref}
    />
  ),
);
PromptComposerToolbar.displayName = "PromptComposer.Toolbar";

export type PromptComposerActionsProps = StyleXProps<React.ComponentPropsWithoutRef<"div">>;

export const PromptComposerActions = React.forwardRef<HTMLDivElement, PromptComposerActionsProps>(
  ({ xstyle, ...props }, ref) => (
    <div
      {...props}
      {...stylex.props(styles.actions, xstyle)}
      data-slot="prompt-composer-actions"
      ref={ref}
    />
  ),
);
PromptComposerActions.displayName = "PromptComposer.Actions";

export const PromptComposer = {
  Actions: PromptComposerActions,
  Input: PromptComposerInput,
  Root: PromptComposerRoot,
  Toolbar: PromptComposerToolbar,
} as const;

export type { PromptComposerSubmitShortcut } from "./keyboard";
