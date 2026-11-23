import type { SetStateAction } from "react";
import { albums, trackById } from "./music-library";

export type MusicSurface = "inner" | "inner-right" | "cover" | "standalone";
export type MusicTab = "home" | "new" | "radio" | "library" | "search";
export type MusicPage =
  | { kind: "album"; id: number }
  | { kind: "playlist"; id: string }
  | { kind: "list"; id: "playlists" | "albums" | "songs" | "loved" };
export type MusicRepeat = "off" | "all" | "one";
export type MusicState = {
  tab: MusicTab;
  pages: MusicPage[];
  query: string;
  /** Track IDs in play order; `ordered` keeps the unshuffled order. */
  queue: number[];
  ordered: number[];
  index: number;
  source: string;
  playing: boolean;
  offset: number;
  playbackError: boolean;
  shuffle: boolean;
  repeat: MusicRepeat;
  loved: Set<number>;
  saved: Set<number>;
  recent: number[];
  nowPlaying: boolean;
  playerPane: "artwork" | "queue" | "lyrics";
  volume: number;
  dark: boolean;
};
type Snapshot = Readonly<{ revision: number; state: MusicState; interactive: boolean }>;
export type MusicModel = {
  readonly surface: MusicSurface;
  subscribe(listener: () => void): () => void;
  getSnapshot(): Snapshot;
  set<K extends keyof MusicState>(key: K, value: SetStateAction<MusicState[K]>): void;
  ready(snapshot: Snapshot): void;
  play(queue: number[], index: number, source: string): void;
  toggle(): void;
  next(): void;
  previous(): void;
  jumpTo(index: number): void;
  seek(seconds: number): void;
  setShuffle(shuffle: boolean): void;
  position(state?: MusicState): number;
  saveScroll(key: string, top: number): void;
  readScroll(key: string): number | undefined;
};
export type MusicFrame = HTMLIFrameElement & { musicModel?: MusicModel };

function shuffled(ids: number[]) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function createMusicSession() {
  const startQueue = albums[0]!.tracks.map((track) => track.id);
  let state: MusicState = {
    tab: "home",
    pages: [],
    query: "",
    queue: startQueue,
    ordered: startQueue,
    index: 2,
    source: albums[0]!.title,
    playing: false,
    offset: 0,
    playbackError: false,
    shuffle: false,
    repeat: "off",
    loved: new Set([101, 602]),
    saved: new Set([0, 2, 4, 6]),
    recent: [0, 2, 4],
    nowPlaying: false,
    playerPane: "artwork",
    volume: 0.7,
    dark: false,
  };
  let revision = 0;
  let frozen = { state, revision };
  let folding = false;
  let active: MusicSurface | null = "inner";
  let audio: HTMLAudioElement | undefined;
  let playRequest = 0;
  const scrolls = new Map<string, number>();
  const listeners = new Set<() => void>();
  const paintListeners = new Set<() => void>();
  const views = new Map<
    MusicSurface,
    { model?: MusicModel; snapshot: Snapshot; ready: number; painted: boolean }
  >();

  function publish() {
    for (const [surface, view] of views) {
      const snapshot = folding ? frozen : { state, revision };
      const interactive = surface === "standalone" || surface === active;
      // An old inactive paint cannot acknowledge the newly interactive presentation.
      if (view.snapshot.interactive !== interactive) view.painted = false;
      view.ready = -1;
      view.snapshot = { ...snapshot, interactive };
    }
    listeners.forEach((listener) => listener());
    paintListeners.forEach((listener) => listener());
  }
  function commit(next: MusicState) {
    if (audio && next.volume !== state.volume) audio.volume = next.volume;
    state = next;
    revision++;
    publish();
  }
  function position(value = state) {
    if (value === frozen.state && folding) return value.offset;
    const track = trackById(value.queue[value.index]!);
    return audio?.getAttribute("src") === track.audio
      ? Math.min(track.duration, audio.currentTime)
      : value.offset;
  }
  function failPlayback() {
    if (state.playbackError) return;
    commit({ ...state, playing: false, offset: position(), playbackError: true });
  }
  function syncAudio(reset: boolean) {
    const request = ++playRequest;
    if (!audio && !state.playing) return;
    if (!audio) {
      // Keep the decoder in the session's document, not in a display that can be hidden.
      audio = document.createElement("audio");
      audio.hidden = true;
      audio.preload = "none";
      audio.volume = state.volume;
      audio.addEventListener("ended", finishTrack);
      audio.addEventListener("error", failPlayback);
      document.body.append(audio);
    }
    const src = trackById(state.queue[state.index]!).audio;
    if (audio.getAttribute("src") !== src || audio.error) audio.src = src;
    if (reset) audio.currentTime = state.offset;
    if (!state.playing) {
      audio.pause();
      return;
    }
    void audio.play().catch(() => {
      if (request === playRequest) failPlayback();
    });
  }
  function moveTo(index: number, playing = state.playing) {
    const id = state.queue[index]!;
    const album = trackById(id).albumId;
    commit({
      ...state,
      index,
      playing,
      offset: 0,
      playbackError: false,
      recent: [album, ...state.recent.filter((item) => item !== album)].slice(0, 8),
    });
    syncAudio(true);
  }
  function finishTrack() {
    if (state.repeat === "one") return moveTo(state.index);
    if (state.index < state.queue.length - 1) return moveTo(state.index + 1);
    if (state.repeat === "all") return moveTo(0);
    moveTo(state.index, false);
  }
  const commands = {
    play(queue: number[], index: number, source: string) {
      const order = state.shuffle
        ? [queue[index]!, ...shuffled([...queue.slice(0, index), ...queue.slice(index + 1)])]
        : queue;
      state = { ...state, queue: order, ordered: queue, source };
      moveTo(state.shuffle ? 0 : index, true);
    },
    toggle() {
      const offset = position();
      const reset = state.playbackError || !audio;
      commit({ ...state, playing: !state.playing, offset, playbackError: false });
      syncAudio(reset);
    },
    next() {
      if (state.index < state.queue.length - 1) moveTo(state.index + 1);
      else moveTo(0, state.repeat === "all" && state.playing);
    },
    previous() {
      if (position() > 3 || state.index === 0) commands.seek(0);
      else moveTo(state.index - 1);
    },
    seek(seconds: number) {
      if (audio) audio.currentTime = seconds;
      commit({ ...state, offset: seconds });
    },
    setShuffle(shuffle: boolean) {
      if (shuffle === state.shuffle) return;
      const current = state.queue[state.index]!;
      const queue = shuffle
        ? [current, ...shuffled(state.ordered.filter((id) => id !== current))]
        : state.ordered;
      commit({ ...state, shuffle, queue, index: queue.indexOf(current) });
    },
  };

  function screen(surface: MusicSurface): MusicModel {
    const existing = views.get(surface);
    if (existing?.model) return existing.model;
    const view: { model?: MusicModel; snapshot: Snapshot; ready: number; painted: boolean } = {
      snapshot: {
        ...(folding ? frozen : { state, revision }),
        interactive: surface === "standalone" || surface === active,
      },
      ready: -1,
      painted: false,
    };
    // Only the surface the user can reach may change shared state.
    const gated =
      <A extends unknown[]>(command: (...args: A) => void) =>
      (...args: A) => {
        if (view.snapshot.interactive) command(...args);
      };
    const model: MusicModel = {
      surface,
      subscribe(listener) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      getSnapshot: () => view.snapshot,
      set: gated((key, value) => {
        const next = typeof value === "function" ? value(state[key]) : value;
        if (!Object.is(next, state[key])) commit({ ...state, [key]: next });
      }),
      play: gated(commands.play),
      toggle: gated(commands.toggle),
      next: gated(commands.next),
      previous: gated(commands.previous),
      jumpTo: gated((index) => moveTo(index, true)),
      seek: gated(commands.seek),
      setShuffle: gated(commands.setShuffle),
      position: (value = view.snapshot.state) => position(value),
      saveScroll: gated((key: string, top: number) => void scrolls.set(key, top)),
      readScroll: (key) => scrolls.get(key),
      ready(value) {
        if (value !== view.snapshot || value.revision === view.ready) return;
        view.ready = value.revision;
        view.painted = true;
        paintListeners.forEach((listener) => listener());
      },
    };
    view.model = model;
    views.set(surface, view);
    return model;
  }
  return {
    screen,
    handoff(action: () => void) {
      action();
    },
    setPose(angle: number, busy: boolean) {
      const nextFolding = busy || (angle > 0.5 && angle < 179.5);
      const nextActive = nextFolding ? null : angle >= 179.5 ? "inner" : "cover";
      if (nextFolding === folding && nextActive === active) return;
      if (nextFolding && !folding) frozen = { state: { ...state, offset: position() }, revision };
      folding = nextFolding;
      active = nextActive;
      publish();
    },
    isReady(surface: Exclude<MusicSurface, "standalone">) {
      const ready = (name: MusicSurface) => {
        const view = views.get(name);
        return Boolean(view && view.ready === view.snapshot.revision);
      };
      return folding && surface !== "cover"
        ? ready("inner") && ready("inner-right")
        : Boolean(views.get(surface)?.painted);
    },
    subscribePaint(listener: () => void) {
      paintListeners.add(listener);
      return () => {
        paintListeners.delete(listener);
      };
    },
    dispose() {
      playRequest++;
      if (audio) {
        audio.removeEventListener("ended", finishTrack);
        audio.removeEventListener("error", failPlayback);
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio.remove();
        audio = undefined;
      }
      listeners.clear();
      paintListeners.clear();
    },
  };
}
