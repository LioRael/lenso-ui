import { useCallback, useEffect, useReducer, useRef, useState, type RefObject } from "react";
import { Button, Glass, Menu, Slider, type XStyle } from "@lenso/ui";
import {
  Ellipsis,
  ListUl,
  MusicNote,
  PauseFill,
  PlayFill,
  Plus,
  Check,
  Shuffle,
  Star,
  StarFill,
  VolumeFill,
  VolumeLowFill,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import {
  albumOf,
  formatTime,
  trackById,
  type MusicAlbum,
  type MusicPlaylist,
} from "../lib/music-library";
import type { MusicModel, MusicState } from "../lib/music-model";
import { music as s } from "../styles/music-demo.stylex";

const playbackError = "Couldn’t play preview";

export function Artwork({
  album,
  playlist,
  featured = false,
  xstyle,
}: {
  album?: MusicAlbum;
  playlist?: MusicPlaylist;
  featured?: boolean;
  xstyle?: XStyle;
}) {
  if (playlist) {
    const albums = [...new Set(playlist.trackIds.map((id) => albumOf(trackById(id))))];
    return (
      <span
        aria-hidden="true"
        {...stylex.props(
          s.art,
          s.generated,
          s.gradient(...playlist.colors),
          featured && s.topPickArt,
          xstyle,
        )}
      >
        <span {...stylex.props(s.playlistCollage, featured && s.topPickCollage)}>
          {Array.from({ length: 4 }, (_, index) => (
            <img
              key={index}
              src={albums[index % albums.length]?.artwork}
              alt=""
              draggable={false}
              loading="lazy"
              {...stylex.props(s.playlistCover)}
            />
          ))}
        </span>
        <span {...stylex.props(s.playlistShade)} />
        <span {...stylex.props(s.generatedMark, featured && s.topPickMark)}>Music · Mix</span>
        <span {...stylex.props(s.generatedTitle, featured && s.topPickTitle)}>
          {playlist.title}
        </span>
        {featured && (
          <span {...stylex.props(s.topPickArtists)}>
            <span {...stylex.props(s.topPickCategory)}>Made for You</span>
            <span>
              {albums
                .slice(0, 3)
                .map(({ artist }) => artist)
                .join(", ")}
            </span>
          </span>
        )}
      </span>
    );
  }
  return (
    <span {...stylex.props(s.art, xstyle)}>
      <img
        key={album!.id}
        src={album!.artwork}
        alt=""
        draggable={false}
        loading="lazy"
        {...stylex.props(s.image)}
      />
    </span>
  );
}

export function PlayingBars({ playing, compact = false }: { playing: boolean; compact?: boolean }) {
  return (
    <span aria-hidden="true" {...stylex.props(s.bars, compact && s.compactBars)}>
      {[0, 260, 520].map((delay) => (
        <span
          key={delay}
          {...stylex.props(
            s.bar,
            compact && s.compactBar,
            playing && s.barPlaying,
            s.barDelay(-delay),
          )}
        />
      ))}
    </span>
  );
}

/** Re-renders while playing so time-derived UI advances; the model owns the position. */
export function usePlaybackPosition(model: MusicModel, state: MusicState, enabled = true) {
  const [, tick] = useReducer((value: number) => value + 1, 0);
  useEffect(() => {
    if (!enabled || !state.playing) return;
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [enabled, state.playing]);
  return model.position(state);
}

function SkipIcon({ previous, xstyle }: { previous?: boolean; xstyle: XStyle }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...stylex.props(xstyle)}>
      <path
        transform={previous ? "translate(24) scale(-1 1)" : undefined}
        d="M2 5.8c0-.8.9-1.3 1.5-.9l8.9 6.1V5.8c0-.8.9-1.3 1.5-.9l9 6.2a1.1 1.1 0 0 1 0 1.8l-9 6.2c-.6.4-1.5-.1-1.5-.9V13l-8.9 6.1c-.6.4-1.5-.1-1.5-.9Z"
      />
    </svg>
  );
}

function LyricsIcon({ xstyle }: { xstyle: XStyle }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...stylex.props(xstyle)}>
      <path
        d="M7 17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6l-6 4z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M7 9h4v3l-2 2H7l1.5-2H7zm6 0h4v3l-2 2h-2l1.5-2H13z" fill="currentColor" />
    </svg>
  );
}

function ShuffleButton({
  model,
  state,
  mini,
}: {
  model: MusicModel;
  state: MusicState;
  mini?: boolean;
}) {
  return (
    <Button
      variant="borderless"
      aria-label="Shuffle"
      aria-pressed={state.shuffle}
      onClick={() => model.setShuffle(!state.shuffle)}
      xstyle={
        mini
          ? [s.miniButton, s.wideMiniButton, s.miniMode, state.shuffle && s.miniModeActive]
          : [s.modeButton, state.shuffle && s.modeButtonActive]
      }
    >
      <Shuffle aria-hidden="true" {...stylex.props(s.smallIcon)} />
    </Button>
  );
}

function RepeatButton({
  model,
  state,
  mini,
}: {
  model: MusicModel;
  state: MusicState;
  mini?: boolean;
}) {
  const mode = state.repeat;
  return (
    <Button
      variant="borderless"
      aria-label={`Repeat: ${mode === "one" ? "One" : mode === "all" ? "All" : "Off"}`}
      aria-pressed={mode !== "off"}
      onClick={() => model.set("repeat", mode === "off" ? "all" : mode === "all" ? "one" : "off")}
      xstyle={
        mini
          ? [s.miniButton, s.wideMiniButton, s.miniMode, mode !== "off" && s.miniModeActive]
          : [s.modeButton, mode !== "off" && s.modeButtonActive]
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        {...stylex.props(mini ? s.icon : s.smallIcon)}
      >
        <path
          d="M4 10V8a3 3 0 0 1 3-3h12m-3-3 3 3-3 3m4 6v2a3 3 0 0 1-3 3H5m3 3-3-3 3-3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {mode === "one" && (
          <path
            d="m10 10 2-1.5V16m-2 0h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </Button>
  );
}

function SongOptions({
  model,
  album,
  saved,
  xstyle,
  onShowAlbum,
}: {
  model: MusicModel;
  album: MusicAlbum;
  saved: boolean;
  xstyle: XStyle;
  onShowAlbum: (id: number) => void;
}) {
  return (
    <Menu>
      <Menu.Trigger
        render={<Button variant="borderless" xstyle={xstyle} />}
        aria-label="More options"
      >
        <Ellipsis aria-hidden="true" {...stylex.props(s.smallIcon)} />
      </Menu.Trigger>
      <Menu.Content aria-label="Song options" side="top" align="end" sideOffset={8}>
        <Menu.Item
          onClick={() =>
            model.set("saved", (previous) => {
              const next = new Set(previous);
              if (!next.delete(album.id)) next.add(album.id);
              return next;
            })
          }
        >
          <Menu.Item.Icon>{saved ? <Check /> : <Plus />}</Menu.Item.Icon>
          <Menu.Item.Label>{saved ? "In Library" : "Add to Library"}</Menu.Item.Label>
        </Menu.Item>
        <Menu.Item onClick={() => onShowAlbum(album.id)}>
          <Menu.Item.Icon>
            <MusicNote />
          </Menu.Item.Icon>
          <Menu.Item.Label>Go to Album</Menu.Item.Label>
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}

export function MiniPlayer({
  model,
  state,
  openRef,
  onShowAlbum,
}: {
  model: MusicModel;
  state: MusicState;
  openRef: RefObject<HTMLElement | null>;
  onShowAlbum: (id: number) => void;
}) {
  const track = trackById(state.queue[state.index]!);
  const album = albumOf(track);
  const duo = model.surface !== "standalone";
  const position = usePlaybackPosition(model, state, !duo);
  const wideDuo = duo && model.surface !== "cover";
  const buttonStyle = [s.miniButton, wideDuo && s.wideMiniButton];
  const setDefaultTrigger = useCallback(
    (node: HTMLButtonElement | null) => {
      openRef.current = node;
    },
    [openRef],
  );
  function openPlayer(trigger: HTMLElement, pane: MusicState["playerPane"]) {
    openRef.current = trigger;
    model.set("playerPane", pane);
    model.set("nowPlaying", true);
  }
  const transport = (
    <>
      {wideDuo && (
        <>
          <ShuffleButton model={model} state={state} mini />
          <Button
            variant="borderless"
            aria-label="Previous"
            onClick={model.previous}
            xstyle={buttonStyle}
          >
            <SkipIcon previous xstyle={s.icon} />
          </Button>
        </>
      )}
      <Button
        variant="borderless"
        aria-label={state.playing ? "Pause" : "Play"}
        onClick={model.toggle}
        xstyle={buttonStyle}
      >
        {state.playing ? (
          <PauseFill {...stylex.props(s.icon)} />
        ) : (
          <PlayFill {...stylex.props(s.icon)} />
        )}
      </Button>
      <Button variant="borderless" aria-label="Next" onClick={model.next} xstyle={buttonStyle}>
        <SkipIcon xstyle={s.icon} />
      </Button>
      {wideDuo && <RepeatButton model={model} state={state} mini />}
    </>
  );
  return (
    <Glass
      render={<section aria-label="Mini player" />}
      xstyle={[s.mini, duo && s.duoMini, wideDuo && s.wideMini]}
    >
      {wideDuo && transport}
      <button
        ref={setDefaultTrigger}
        type="button"
        aria-label={`Now Playing: ${track.title}, ${album.artist}`}
        aria-haspopup="dialog"
        aria-expanded={state.nowPlaying}
        onClick={(event) => openPlayer(event.currentTarget, state.playerPane)}
        {...stylex.props(s.miniOpen)}
      >
        <Artwork album={album} xstyle={[s.miniArt, duo && s.duoMiniArt]} />
        <span {...stylex.props(s.caption)}>
          <span {...stylex.props(s.miniTitle)}>{track.title}</span>
          <span aria-live="polite" {...stylex.props(s.secondary)}>
            {state.playbackError ? playbackError : album.artist}
          </span>
        </span>
      </button>
      {wideDuo && (
        <>
          <SongOptions
            model={model}
            album={album}
            saved={state.saved.has(album.id)}
            xstyle={buttonStyle}
            onShowAlbum={onShowAlbum}
          />
          <Button
            variant="borderless"
            aria-label="Lyrics"
            aria-haspopup="dialog"
            onClick={(event) => openPlayer(event.currentTarget, "lyrics")}
            xstyle={buttonStyle}
          >
            <LyricsIcon xstyle={s.icon} />
          </Button>
          <Button
            variant="borderless"
            aria-label="Playing Next"
            aria-haspopup="dialog"
            onClick={(event) => openPlayer(event.currentTarget, "queue")}
            xstyle={buttonStyle}
          >
            <ListUl aria-hidden="true" {...stylex.props(s.icon)} />
          </Button>
        </>
      )}
      {!wideDuo && transport}
      {!duo && (
        <span aria-hidden="true" {...stylex.props(s.miniProgress)}>
          <span {...stylex.props(s.miniProgressFill((position / track.duration) * 100))} />
        </span>
      )}
    </Glass>
  );
}

export function NowPlaying({
  model,
  state,
  interactive,
  returnFocus,
  onShowAlbum,
}: {
  model: MusicModel;
  state: MusicState;
  interactive: boolean;
  returnFocus: RefObject<HTMLElement | null>;
  onShowAlbum: (id: number) => void;
}) {
  const track = trackById(state.queue[state.index]!);
  const album = albumOf(track);
  const position = usePlaybackPosition(model, state);
  const [draft, setDraft] = useState<number | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(state.nowPlaying);
  useEffect(() => {
    if (wasOpen.current === state.nowPlaying) return;
    wasOpen.current = state.nowPlaying;
    if (!interactive) return;
    if (state.nowPlaying) close.current?.focus({ preventScroll: true });
    else returnFocus.current?.focus({ preventScroll: true });
  }, [state.nowPlaying, interactive, returnFocus]);
  const loved = state.loved.has(track.id);
  const shown = draft ?? position;
  const upcoming = state.queue.slice(state.index + 1);
  const toggleLove = () =>
    model.set("loved", (previous) => {
      const next = new Set(previous);
      if (!next.delete(track.id)) next.add(track.id);
      return next;
    });
  const footerButton = (active: boolean) => [s.footerButton, active && s.footerButtonActive];
  const showQueue = state.playerPane === "queue";
  const showLyrics = state.playerPane === "lyrics";
  return (
    // The simulator renders the same player in inert mirror frames, outside the top layer.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      open={state.nowPlaying}
      aria-modal="true"
      aria-label="Now Playing"
      inert={!state.nowPlaying}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          model.set("nowPlaying", false);
        }
      }}
      {...stylex.props(
        s.player,
        state.nowPlaying && s.playerOpen,
        !interactive && s.playerInactive,
        s.playerColor(album.accent),
      )}
    >
      <img
        key={album.id}
        src={album.artwork}
        alt=""
        aria-hidden="true"
        {...stylex.props(s.playerBackdrop)}
      />
      <span {...stylex.props(s.playerShade)} />
      <div {...stylex.props(s.playerBody, s.playerLandscape)}>
        <header {...stylex.props(s.playerHeader)}>
          <Button
            ref={close}
            variant="borderless"
            aria-label="Close Now Playing"
            onClick={() => model.set("nowPlaying", false)}
            xstyle={s.playerClose}
          >
            <span aria-hidden="true" {...stylex.props(s.playerGrabber)} />
          </Button>
        </header>
        {showQueue ? (
          <div {...stylex.props(s.queue)}>
            <div {...stylex.props(s.queueHeader)}>
              <div>
                <h2 {...stylex.props(s.queueTitle)}>Playing Next</h2>
                <p {...stylex.props(s.queueSource)}>From {state.source}</p>
              </div>
              <div {...stylex.props(s.queueModes)}>
                <ShuffleButton model={model} state={state} />
                <RepeatButton model={model} state={state} />
              </div>
            </div>
            {upcoming.length ? (
              <ol aria-label="Playing next" {...stylex.props(s.queueList)}>
                {upcoming.map((id, offset) => {
                  const item = trackById(id);
                  const itemAlbum = albumOf(item);
                  return (
                    <li key={`${id}-${offset}`}>
                      <button
                        type="button"
                        onClick={() => model.jumpTo(state.index + offset + 1)}
                        {...stylex.props(s.queueRow)}
                      >
                        <Artwork album={itemAlbum} xstyle={s.queueArt} />
                        <span {...stylex.props(s.caption)}>
                          <span {...stylex.props(s.captionTitle)}>{item.title}</span>
                          <span {...stylex.props(s.secondary)}>{itemAlbum.artist}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p {...stylex.props(s.queueSource)}>Nothing else is queued.</p>
            )}
          </div>
        ) : showLyrics ? (
          <div {...stylex.props(s.lyricsEmpty)}>
            <LyricsIcon xstyle={s.transportIcon} />
            <h2 {...stylex.props(s.queueTitle)}>Lyrics</h2>
            <p {...stylex.props(s.queueSource)}>This instrumental preview has no lyrics.</p>
          </div>
        ) : (
          <div {...stylex.props(s.playerArtworkSlot)}>
            <Artwork
              album={album}
              xstyle={[s.playerArtwork, state.playing && s.playerArtworkPlaying]}
            />
          </div>
        )}
        <div {...stylex.props(s.playerControls)}>
          <div {...stylex.props(s.playerInfo)}>
            <div {...stylex.props(s.playerText)}>
              <p {...stylex.props(s.playerTitle)}>{track.title}</p>
              <p aria-live="polite" {...stylex.props(s.playerArtist)}>
                {state.playbackError ? playbackError : `${album.artist} · Preview`}
              </p>
            </div>
            <Button
              variant="borderless"
              aria-label={loved ? "Remove from Favorites" : "Add to Favorites"}
              aria-pressed={loved}
              onClick={toggleLove}
              xstyle={s.playerRound}
            >
              {loved ? (
                <StarFill {...stylex.props(s.smallIcon)} />
              ) : (
                <Star {...stylex.props(s.smallIcon)} />
              )}
            </Button>
            <SongOptions
              model={model}
              album={album}
              saved={state.saved.has(album.id)}
              xstyle={s.playerRound}
              onShowAlbum={onShowAlbum}
            />
          </div>
          <div {...stylex.props(s.progress)}>
            <Slider
              min={0}
              max={track.duration}
              step={1}
              value={Math.round(shown)}
              format={formatTime}
              onValueChange={(value) => setDraft(typeof value === "number" ? value : value[0]!)}
              onValueCommit={(value) => {
                model.seek(typeof value === "number" ? value : value[0]!);
                setDraft(null);
              }}
              xstyle={s.slider}
            >
              <Slider.Control xstyle={s.playerSliderControl}>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb aria-label="Playback position" xstyle={s.playerSliderThumb} />
                </Slider.Track>
              </Slider.Control>
            </Slider>
            <div aria-hidden="true" {...stylex.props(s.times)}>
              <span>{formatTime(shown)}</span>
              <span>-{formatTime(track.duration - shown)}</span>
            </div>
          </div>
          <div {...stylex.props(s.transport)}>
            <Button
              variant="borderless"
              aria-label="Previous"
              onClick={model.previous}
              xstyle={s.transportButton}
            >
              <SkipIcon previous xstyle={s.transportIcon} />
            </Button>
            <Button
              variant="borderless"
              aria-label={state.playing ? "Pause" : "Play"}
              onClick={model.toggle}
              xstyle={s.transportButton}
            >
              {state.playing ? (
                <PauseFill {...stylex.props(s.playIcon)} />
              ) : (
                <PlayFill {...stylex.props(s.playIcon)} />
              )}
            </Button>
            <Button
              variant="borderless"
              aria-label="Next"
              onClick={model.next}
              xstyle={s.transportButton}
            >
              <SkipIcon xstyle={s.transportIcon} />
            </Button>
          </div>
          <div {...stylex.props(s.volume)}>
            <VolumeLowFill aria-hidden="true" {...stylex.props(s.smallIcon)} />
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={state.volume}
              format={{ style: "percent" }}
              onValueChange={(value) =>
                model.set("volume", typeof value === "number" ? value : value[0]!)
              }
              xstyle={s.slider}
            >
              <Slider.Control xstyle={s.playerSliderControl}>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb aria-label="Volume" xstyle={s.playerSliderThumb} />
                </Slider.Track>
              </Slider.Control>
            </Slider>
            <VolumeFill aria-hidden="true" {...stylex.props(s.smallIcon)} />
          </div>
          <div {...stylex.props(s.playerFooter)}>
            {model.surface !== "standalone" && (
              <Button
                variant="borderless"
                aria-label="Lyrics"
                aria-pressed={showLyrics}
                onClick={() => model.set("playerPane", showLyrics ? "artwork" : "lyrics")}
                xstyle={footerButton(showLyrics)}
              >
                <LyricsIcon xstyle={s.icon} />
              </Button>
            )}
            <Button
              variant="borderless"
              aria-label="Playing Next"
              aria-pressed={showQueue}
              onClick={() => model.set("playerPane", showQueue ? "artwork" : "queue")}
              xstyle={footerButton(showQueue)}
            >
              <ListUl {...stylex.props(s.icon)} />
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
