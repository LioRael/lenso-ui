"use client";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { Collapsible } from "@base-ui/react/collapsible";
import { Button, Separator, Toast } from "@lenso/ui";

type Stage = "checking" | "available" | "downloading" | "installed";
type UpdateData = { stage: Stage; progress?: number };
const s = stylex.create({
  demo: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  help: {
    margin: 0,
    fontSize: 12,
    lineHeight: "18px",
    textAlign: "center",
    color: "var(--lenso-label-secondary)",
  },
  glyph: { width: 18, height: 18 },
  installed: { width: 297, maxWidth: "calc(var(--toast-pill-available, 100vw) - 24px)" },
  row: { display: "flex", alignItems: "center", gap: 10 },
  disclosure: {
    appearance: "none",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    minWidth: 0,
    flex: "1 1 0",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textAlign: "start",
    cursor: "pointer",
    fontFamily: "inherit",
    borderRadius: 4,
    outlineStyle: "solid",
    outlineWidth: { default: 0, ":focus-visible": 2 },
    outlineColor: "var(--lenso-focus-ring)",
    outlineOffset: 2,
  },
  expanded: { borderRadius: 16 },
  panel: {
    height: {
      default: "var(--collapsible-panel-height)",
      ":is([data-starting-style],[data-ending-style])": 0,
    },
    opacity: { default: 1, ":is([data-starting-style],[data-ending-style])": 0 },
    overflow: "hidden",
    marginInlineStart: -14,
    marginInlineEnd: -10,
    transition: {
      default: "opacity 180ms ease",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  details: {
    paddingTop: 12,
    paddingBottom: 11,
    paddingInline: 12,
  },
  divider: {
    marginTop: 8,
    marginBottom: 0,
    height: 1,
    width: "100%",
    backgroundColor: "var(--lenso-separator)",
  },
  description: { fontSize: 13, lineHeight: "18px" },
});

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...stylex.props(s.glyph)}>
      <rect x="1.5" y="1.5" width="17" height="17" rx="4" fill="currentColor" />
      <path
        d="M10 5v10m-4-4 4 4 4-4"
        stroke="var(--lenso-label-on-tint)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function InstalledIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...stylex.props(s.glyph)}>
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="m6 10 3 3 5-7"
        stroke="var(--lenso-label-on-tint)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpdateNotice({
  toast,
}: {
  toast: ComponentProps<typeof Toast.Root>["toast"] & { data?: UpdateData };
}) {
  const [expanded, setExpanded] = useState(false);
  const stage = toast.data?.stage;
  const installed = stage === "installed";
  if (!installed && expanded) setExpanded(false);
  return (
    <Toast.Root toast={toast} variant="pill" xstyle={expanded && s.expanded}>
      {installed ? (
        <Collapsible.Root open={expanded} onOpenChange={setExpanded} {...stylex.props(s.installed)}>
          <div {...stylex.props(s.row)}>
            <Toast.Indicator>
              <InstalledIcon />
            </Toast.Indicator>
            <Toast.Title
              render={<Collapsible.Trigger />}
              aria-label="Update installed. Your terminal tabs won't be lost"
              xstyle={s.disclosure}
            >
              {expanded ? (
                "Update installed."
              ) : (
                <Toast.Marquee>Update installed. Your terminal tabs won't be lost</Toast.Marquee>
              )}
            </Toast.Title>
            <Toast.Action />
            <Toast.Close aria-label="Dismiss update notification" />
          </div>
          <Collapsible.Panel {...stylex.props(s.panel)}>
            <Separator xstyle={s.divider} />
            <div {...stylex.props(s.details)}>
              <Toast.Description xstyle={s.description} />
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      ) : stage === "downloading" ? (
        <Toast.Progress value={toast.data?.progress ?? 0} aria-label="Downloading update">
          <Toast.Content>
            <Toast.Title />
          </Toast.Content>
        </Toast.Progress>
      ) : (
        <>
          <Toast.Indicator>{stage === "available" ? <DownloadIcon /> : undefined}</Toast.Indicator>
          <Toast.Content>
            <Toast.Title />
          </Toast.Content>
          {stage === "available" && (
            <>
              <Toast.Action />
              <Toast.Close aria-label="Dismiss update notification" />
            </>
          )}
        </>
      )}
    </Toast.Root>
  );
}

function UpdateWorkflow({
  placement,
}: {
  placement: ComponentProps<typeof Toast.Viewport>["placement"];
}) {
  const manager = Toast.useToastManager<UpdateData>();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const id = useRef<string | null>(null);
  const [relaunch, setRelaunch] = useState(false);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);
  const later = (action: () => void, delay: number) => {
    timers.current.push(setTimeout(action, delay));
  };
  const download = (event: MouseEvent<HTMLButtonElement>) => {
    if (!id.current) return;
    event.currentTarget.closest<HTMLElement>('[data-slot="toast"]')?.focus({ preventScroll: true });
    const current = id.current;
    manager.update(current, {
      title: "Downloading update",
      type: "progress",
      actionProps: undefined,
      data: { stage: "downloading", progress: 0 },
    });
    [1, 2, 3, 4, 7, 12, 18, 24, 31, 40, 49, 58, 68, 78, 88, 96, 100].forEach((progress, index) =>
      later(
        () => {
          manager.update(current, { data: { stage: "downloading", progress } });
        },
        (index + 1) * 280,
      ),
    );
    later(
      () =>
        manager.update(current, {
          title: "Update installed.",
          description: "Your terminal tabs won't be lost",
          type: "success",
          data: { stage: "installed" },
          actionProps: {
            children: "Relaunch Now",
            onClick: () => {
              setRelaunch(true);
              manager.close(current);
            },
          },
        }),
      5200,
    );
  };
  const check = () => {
    clear();
    setRelaunch(false);
    id.current = manager.add({
      id: "rex-update-demo",
      title: "Checking for updates",
      type: "loading",
      timeout: 0,
      description: undefined,
      actionProps: undefined,
      data: { stage: "checking" },
      onClose: clear,
    });
    const current = id.current;
    later(
      () =>
        manager.update(current, {
          title: "An update is available",
          type: "accent",
          data: { stage: "available" },
          actionProps: { children: "Download", onClick: download },
        }),
      1400,
    );
  };
  return (
    <>
      <div {...stylex.props(s.demo)}>
        <Button onClick={check}>Check for updates</Button>
        <p {...stylex.props(s.help)}>
          {relaunch
            ? "Relaunch simulated. You can replay the update."
            : "Local demo · Download to continue, then expand the completed message."}
        </p>
      </div>
      <Toast.Portal>
        <Toast.Viewport placement={placement}>
          {manager.toasts.map((toast) => (
            <UpdateNotice key={toast.id} toast={toast} />
          ))}
        </Toast.Viewport>
      </Toast.Portal>
    </>
  );
}

export function Pill({
  placement = "bottom-end",
}: Pick<ComponentProps<typeof Toast.Viewport>, "placement">) {
  return (
    <Toast.Provider timeout={0}>
      <UpdateWorkflow placement={placement} />
    </Toast.Provider>
  );
}
