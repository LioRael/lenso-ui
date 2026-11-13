import { useCallback, useEffect, useRef, useState } from "react";
import { ActionSheet, Button, GlassButton, Menu, Modal, Tabs, Toolbar } from "@lenso/ui";
import {
  ArrowRotateLeft,
  ArrowUturnCcwLeft,
  ArrowUturnCwRight,
  Crop,
  Ellipsis,
  Palette,
  Sliders,
  Sun,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import {
  adjustmentFilter,
  centeredCrop,
  commitEdit,
  hasAdjustments,
  orientedSize,
  originalAdjustments,
  redoEdit,
  rotateCropLeft,
  renderPhotoEdit,
  sameAdjustments,
  undoEdit,
  type EditHistory,
  type PhotoAdjustments,
  type PhotoEdit,
  type PhotoPreset,
} from "../lib/photos-adjustments";
import type { DemoPhoto } from "../lib/photos-library";
import { editor as s } from "../styles/photos-editor.stylex";
import { PhotosEditorPreview } from "./photos-editor-preview";
import { PhotosEditorRuler } from "./photos-editor-ruler";

type Adjustment = "exposure" | "brightness" | "contrast" | "saturation" | "warmth" | "tint";
type Mode = "adjust" | "filters" | "crop";
const tools: { key: Adjustment; label: string }[] = [
  { key: "exposure", label: "Exposure" },
  { key: "brightness", label: "Brightness" },
  { key: "contrast", label: "Contrast" },
  { key: "saturation", label: "Saturation" },
  { key: "warmth", label: "Warmth" },
  { key: "tint", label: "Tint" },
];
function AdjustmentGlyph({ tool }: { tool: Adjustment }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={23}
      height={23}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {tool === "exposure" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 8h6m-3-3v6m-3 5h6" />
        </>
      ) : tool === "contrast" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
        </>
      ) : tool === "brightness" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      ) : tool === "saturation" ? (
        <path d="M12 3c-2 4-7 7-7 12a7 7 0 0 0 14 0c0-5-5-8-7-12Zm-4 13c0 2 1 3 3 3" />
      ) : tool === "warmth" ? (
        <>
          <path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z" />
          <path d="M12 8v10m5-11h3m-3 4h2" />
        </>
      ) : (
        <>
          <circle cx="9" cy="10" r="6" />
          <circle cx="15" cy="14" r="6" />
        </>
      )}
    </svg>
  );
}
const presets: { key: PhotoPreset; label: string }[] = [
  { key: "original", label: "Original" },
  { key: "vivid", label: "Vivid" },
  { key: "vivid-warm", label: "Vivid Warm" },
  { key: "vivid-cool", label: "Vivid Cool" },
  { key: "dramatic", label: "Dramatic" },
  { key: "dramatic-warm", label: "Dramatic Warm" },
  { key: "dramatic-cool", label: "Dramatic Cool" },
  { key: "mono", label: "Mono" },
  { key: "silvertone", label: "Silvertone" },
  { key: "noir", label: "Noir" },
];
const modes = [
  { key: "adjust", label: "Adjust", Icon: Sliders },
  { key: "filters", label: "Filters", Icon: Palette },
  { key: "crop", label: "Crop", Icon: Crop },
] as const;
const ratios = [
  { label: "Freeform", value: 0 },
  { label: "Original", value: -1 },
  { label: "Square", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
];

export function PhotosEditor({
  photo,
  initial,
  onSave,
  onClose,
}: {
  photo: DemoPhoto;
  initial: PhotoAdjustments;
  onSave: (edit: PhotoEdit | undefined) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const draftRef = useRef(initial);
  const [history, setHistory] = useState<EditHistory>({ past: [], present: initial, future: [] });
  const [tool, setTool] = useState<Adjustment>("exposure");
  const [mode, setMode] = useState<Mode>("adjust");
  const [comparing, setComparing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const discardPanel = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aspect, setAspect] = useState(0);
  const [portraitCrop, setPortraitCrop] = useState(photo.height > photo.width);
  const [showRatios, setShowRatios] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: photo.width,
    height: photo.height,
  });
  const loaded = useCallback((size: { width: number; height: number }) => setDimensions(size), []);
  const active = useRef(true);
  const carousel = useRef<HTMLDivElement>(null);
  const swipingTools = useRef(false);
  const carouselFrame = useRef(0);
  const dirty = !sameAdjustments(initial, draft);
  const label =
    mode === "adjust"
      ? tools.find((item) => item.key === tool)!.label
      : mode === "filters"
        ? presets.find((item) => item.key === draft.preset)!.label
        : showRatios
          ? "Aspect ratio"
          : "Straighten";
  function update(value: PhotoAdjustments) {
    draftRef.current = value;
    setDraft(value);
    setComparing(false);
  }
  function commit() {
    setHistory((previous) => commitEdit(previous, draftRef.current));
  }
  function apply(value: PhotoAdjustments) {
    update(value);
    setHistory((previous) => commitEdit(previous, value));
  }
  function navigateHistory(direction: "undo" | "redo") {
    const committed = commitEdit(history, draftRef.current);
    const next = direction === "undo" ? undoEdit(committed) : redoEdit(committed);
    setHistory(next);
    update(next.present);
  }
  function requestClose() {
    if (saving) return;
    if (dirty) setConfirm(true);
    else onClose();
  }
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (swipingTools.current) return;
    const selected = carousel.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    selected?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [tool, mode, draft.preset]);
  useEffect(() => {
    const node = carousel.current;
    const finish = () => {
      if (swipingTools.current) {
        commit();
        swipingTools.current = false;
      }
    };
    node?.addEventListener("scrollend", finish);
    return () => {
      node?.removeEventListener("scrollend", finish);
      cancelAnimationFrame(carouselFrame.current);
      carouselFrame.current = 0;
    };
  }, [mode]);
  function scrollTools() {
    if (!swipingTools.current || carouselFrame.current) return;
    carouselFrame.current = requestAnimationFrame(() => {
      carouselFrame.current = 0;
      const node = carousel.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      const center = bounds.left + bounds.width / 2;
      let nearest = 0,
        distance = Infinity;
      [...node.querySelectorAll("button")].forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const next = Math.abs(rect.left + rect.width / 2 - center);
        if (next < distance) {
          nearest = index;
          distance = next;
        }
      });
      if (mode === "adjust" && tools[nearest]) setTool(tools[nearest]!.key);
      if (
        mode === "filters" &&
        presets[nearest] &&
        draftRef.current.preset !== presets[nearest]!.key
      )
        update({ ...draftRef.current, preset: presets[nearest]!.key });
    });
  }
  async function save() {
    if (!dirty || saving) return;
    if (!hasAdjustments(draft)) {
      onSave(undefined);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const blob = await renderPhotoEdit(photo, draft);
      if (active.current) {
        const size = orientedSize(dimensions.width, dimensions.height, draft.rotation);
        onSave({
          src: URL.createObjectURL(blob),
          adjustments: draft,
          width: Math.round(size.width * draft.crop.width),
          height: Math.round(size.height * draft.crop.height),
        });
      }
    } catch {
      if (active.current) {
        setSaving(false);
        setError("Couldn’t save this edit. Please try again.");
      }
    }
  }
  function chooseAspect(value: number, portrait = portraitCrop) {
    setAspect(value);
    setPortraitCrop(portrait);
    const size = orientedSize(dimensions.width, dimensions.height, draft.rotation);
    apply({
      ...draft,
      crop: centeredCrop(
        size.width,
        size.height,
        value < 0 ? size.width / size.height : value > 1 && portrait ? 1 / value : value,
      ),
    });
  }
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <Modal.Backdrop variant="transparent" />
      <Modal.Content size="full" xstyle={s.popup}>
        <ActionSheet
          dim={false}
          open={confirm}
          onOpenChange={(open, details) => {
            if (open && !dirty) {
              details.cancel();
              onClose();
              return;
            }
            setConfirm(open);
          }}
        >
          <Tabs
            value={mode}
            onValueChange={(value) => {
              if (value === "adjust" || value === "filters" || value === "crop") {
                commit();
                swipingTools.current = false;
                setMode(value);
                setComparing(false);
              }
            }}
            glass
            onKeyDown={(event) => {
              if (!(event.metaKey || event.ctrlKey) || saving || event.defaultPrevented) return;
              if (event.key.toLowerCase() === "z" || event.key.toLowerCase() === "y") {
                event.preventDefault();
                navigateHistory(
                  event.shiftKey || event.key.toLowerCase() === "y" ? "redo" : "undo",
                );
              }
            }}
            aria-busy={saving}
            inert={saving}
            xstyle={[s.layout, mode === "crop" && s.cropLayout]}
          >
            <header {...stylex.props(s.header)}>
              <ActionSheet.Trigger
                render={
                  <GlassButton size="sm" disabled={saving} xstyle={confirm && s.cancelHidden} />
                }
              >
                Cancel
              </ActionSheet.Trigger>
              <GlassButton
                size="sm"
                xstyle={s.done}
                variant="prominent"
                disabled={!dirty || saving}
                isLoading={saving}
                onClick={save}
              >
                Done
              </GlassButton>
            </header>
            <Toolbar aria-label="Editing tools" xstyle={s.toolbar}>
              <Toolbar.Group xstyle={s.toolbarGroup}>
                {mode === "crop" ? (
                  <>
                    <Toolbar.Button
                      aria-label="Flip horizontally"
                      aria-pressed={draft.flipped}
                      xstyle={s.toolbarIcon}
                      onClick={() => apply({ ...draft, flipped: !draft.flipped })}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width={22}
                        height={22}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path d="M12 2v20M9 6 2 18h7ZM15 6l7 12h-7Z" />
                      </svg>
                    </Toolbar.Button>
                    <Toolbar.Button
                      aria-label="Rotate left"
                      xstyle={s.toolbarIcon}
                      onClick={() => {
                        setPortraitCrop((previous) => !previous);
                        apply({
                          ...draft,
                          rotation: (draft.rotation + 270) % 360,
                          crop: rotateCropLeft(draft.crop),
                        });
                      }}
                    >
                      <ArrowRotateLeft width={22} height={22} />
                    </Toolbar.Button>
                  </>
                ) : (
                  <>
                    <Toolbar.Button
                      aria-label="Undo edit"
                      disabled={!history.past.length || saving}
                      xstyle={s.toolbarIcon}
                      onClick={() => navigateHistory("undo")}
                    >
                      <ArrowUturnCcwLeft width={22} height={22} />
                    </Toolbar.Button>
                    <Toolbar.Button
                      aria-label="Redo edit"
                      disabled={!history.future.length || saving}
                      xstyle={s.toolbarIcon}
                      onClick={() => navigateHistory("redo")}
                    >
                      <ArrowUturnCwRight width={22} height={22} />
                    </Toolbar.Button>
                  </>
                )}
              </Toolbar.Group>
              <Modal.Title xstyle={s.title}>
                {modes.find((item) => item.key === mode)!.label}
              </Modal.Title>
              <Toolbar.Group xstyle={[s.toolbarGroup, s.toolbarGroupEnd]}>
                {mode === "crop" && (
                  <Toolbar.Button
                    aria-label="Aspect ratio"
                    aria-pressed={showRatios}
                    xstyle={s.toolbarIcon}
                    onClick={() => setShowRatios(!showRatios)}
                  >
                    <Crop width={22} height={22} />
                  </Toolbar.Button>
                )}
                <Menu>
                  <Menu.Trigger
                    render={<Toolbar.Button aria-label="Editor options" xstyle={s.toolbarIcon} />}
                  >
                    <Ellipsis width={22} height={22} />
                  </Menu.Trigger>
                  <Menu.Content align="end">
                    <Menu.Item
                      disabled={!hasAdjustments(draft) || saving}
                      onClick={() => {
                        setAspect(0);
                        apply(originalAdjustments);
                      }}
                    >
                      Reset all adjustments
                    </Menu.Item>
                    <Menu.CheckboxItem
                      disabled={mode === "crop"}
                      checked={comparing}
                      onCheckedChange={setComparing}
                      value="photos-editor"
                    >
                      Compare original
                    </Menu.CheckboxItem>
                  </Menu.Content>
                </Menu>
              </Toolbar.Group>
            </Toolbar>
            <Modal.Description xstyle={s.hidden}>
              Edit this sample photo. Hold the image to compare. Your original is kept.
            </Modal.Description>
            <div inert={saving} {...stylex.props(s.workspace)}>
              <PhotosEditorPreview
                src={photo.src}
                title={photo.title}
                value={draft}
                cropping={mode === "crop"}
                lockedAspect={
                  aspect === 0
                    ? 0
                    : aspect < 0
                      ? orientedSize(dimensions.width, dimensions.height, draft.rotation).width /
                        orientedSize(dimensions.width, dimensions.height, draft.rotation).height
                      : aspect > 1 && portraitCrop
                        ? 1 / aspect
                        : aspect
                }
                comparing={comparing}
                onCompare={setComparing}
                onChange={(value) => {
                  update(value);
                }}
                onCommit={commit}
                onLoaded={loaded}
              />
            </div>
            <div inert={saving} {...stylex.props(s.controls)}>
              <div {...stylex.props(s.parameterName)} aria-live="polite">
                {comparing ? "Original" : label}
              </div>
              <Tabs.Panel value="adjust" xstyle={s.panel}>
                <div
                  ref={mode === "adjust" ? carousel : undefined}
                  {...stylex.props(s.carousel)}
                  aria-label="Adjustment tools"
                  onPointerDown={() => {
                    swipingTools.current = true;
                  }}
                  onWheel={() => {
                    swipingTools.current = true;
                  }}
                  onScroll={scrollTools}
                >
                  {tools.map(({ key, label: name }) => (
                    <Button
                      key={key}
                      variant="borderless"
                      aria-label={name}
                      aria-pressed={tool === key}
                      onClick={() => {
                        swipingTools.current = false;
                        commit();
                        setTool(key);
                      }}
                      xstyle={s.tool}
                    >
                      <span {...stylex.props(s.toolIcon, draft[key] !== 0 && s.modifiedIcon)}>
                        {tool === key && draft[key] !== 0 ? (
                          draft[key]
                        ) : (
                          <AdjustmentGlyph tool={key} />
                        )}
                      </span>
                    </Button>
                  ))}
                </div>
                <PhotosEditorRuler
                  key={tool}
                  label={label}
                  value={draft[tool]}
                  onChange={(value) => update({ ...draft, [tool]: value })}
                  onCommit={commit}
                />
              </Tabs.Panel>
              <Tabs.Panel value="filters" xstyle={s.panel}>
                <div
                  ref={mode === "filters" ? carousel : undefined}
                  {...stylex.props(s.carousel)}
                  aria-label="Photo filters"
                  onPointerDown={() => {
                    swipingTools.current = true;
                  }}
                  onWheel={() => {
                    swipingTools.current = true;
                  }}
                  onScroll={scrollTools}
                >
                  {presets.map(({ key, label: name }) => (
                    <Button
                      key={key}
                      variant="borderless"
                      aria-label={name}
                      aria-pressed={draft.preset === key}
                      xstyle={s.filterButton}
                      onClick={() => {
                        swipingTools.current = false;
                        apply({ ...draft, preset: key });
                      }}
                    >
                      <img
                        src={photo.thumb}
                        alt=""
                        draggable={false}
                        {...stylex.props(
                          s.filterThumb,
                          s.filter(adjustmentFilter({ ...originalAdjustments, preset: key })),
                          draft.preset === key && s.filterSelected,
                        )}
                      />
                    </Button>
                  ))}
                </div>
                {draft.preset !== "original" && (
                  <PhotosEditorRuler
                    label="Filter intensity"
                    value={draft.intensity}
                    min={0}
                    onChange={(intensity) => update({ ...draft, intensity })}
                    onCommit={commit}
                  />
                )}
              </Tabs.Panel>
              <Tabs.Panel value="crop" xstyle={s.panel}>
                {showRatios ? (
                  <>
                    <div {...stylex.props(s.orientation)}>
                      <Button
                        variant="borderless"
                        aria-label="Portrait crop"
                        disabled={aspect <= 1}
                        aria-pressed={portraitCrop}
                        onClick={() => chooseAspect(aspect, true)}
                      >
                        <svg aria-hidden="true" width={18} height={24} viewBox="0 0 18 24">
                          <rect
                            x="2"
                            y="2"
                            width="14"
                            height="20"
                            rx="2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="borderless"
                        aria-label="Landscape crop"
                        disabled={aspect <= 1}
                        aria-pressed={!portraitCrop}
                        onClick={() => chooseAspect(aspect, false)}
                      >
                        <svg aria-hidden="true" width={24} height={18} viewBox="0 0 24 18">
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="14"
                            rx="2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          />
                        </svg>
                      </Button>
                    </div>
                    <div {...stylex.props(s.ratios)} aria-label="Crop aspect ratios">
                      {ratios.map((item) => (
                        <Button
                          key={item.label}
                          variant="borderless"
                          aria-pressed={aspect === item.value}
                          onClick={() => chooseAspect(item.value)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="borderless"
                      aria-label="Reset straighten"
                      disabled={draft.straighten === 0}
                      onClick={() => apply({ ...draft, straighten: 0 })}
                      xstyle={s.tool}
                    >
                      <span {...stylex.props(s.toolIcon, draft.straighten !== 0 && s.modifiedIcon)}>
                        {draft.straighten || <Sun aria-hidden="true" />}
                      </span>
                    </Button>
                    <PhotosEditorRuler
                      label="Straighten angle"
                      value={draft.straighten}
                      min={-45}
                      max={45}
                      onChange={(straighten) => update({ ...draft, straighten })}
                      onCommit={commit}
                    />
                  </>
                )}
              </Tabs.Panel>
            </div>
            <Tabs.List aria-label="Editing mode" xstyle={s.modes}>
              {modes.map(({ key, label: name, Icon }) => (
                <Tabs.Tab key={key} value={key} xstyle={s.mode}>
                  <Icon aria-hidden="true" width={22} height={22} />
                  {name}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {error && <output {...stylex.props(s.status)}>{error}</output>}
          </Tabs>
          <ActionSheet.Backdrop />
          <ActionSheet.Content
            ref={discardPanel}
            initialFocus={() => discardPanel.current}
            xstyle={s.discardPopup}
          >
            <ActionSheet.Header xstyle={s.discardHeader}>
              <ActionSheet.Title xstyle={s.discardTitle}>Discard changes?</ActionSheet.Title>
            </ActionSheet.Header>
            <ActionSheet.Actions>
              <ActionSheet.Action destructive onClick={onClose}>
                Discard changes
              </ActionSheet.Action>
            </ActionSheet.Actions>
          </ActionSheet.Content>
        </ActionSheet>
      </Modal.Content>
    </Modal>
  );
}
