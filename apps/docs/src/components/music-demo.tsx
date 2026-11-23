"use client";

import { isComposing } from "@ui-sdk/core";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Button,
  Glass,
  GlassButton,
  Link,
  Menu,
  ScrollEdge,
  SearchField,
  TabBar,
  ThemeScope,
} from "@lenso/ui";
import {
  AntennaSignal,
  ArrowUpFromSquare,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleExclamation,
  Ellipsis,
  HeartFill,
  HouseFill,
  LayoutCellsLarge,
  ListUl,
  LocationArrowFill,
  Magnifier,
  Moon,
  MusicNote,
  PlayFill,
  Plus,
  Shuffle,
  SquareListUl,
  Sun,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import {
  albumOf,
  albums,
  formatTime,
  playlistById,
  playlists,
  stationTracks,
  stations,
  trackById,
  tracks,
  type MusicAlbum,
  type MusicTrack,
} from "../lib/music-library";
import {
  createMusicSession,
  type MusicModel,
  type MusicPage,
  type MusicTab,
} from "../lib/music-model";
import { deviceLab } from "../styles/device-lab.stylex";
import { music as s } from "../styles/music-demo.stylex";
import { Artwork, MiniPlayer, NowPlaying, PlayingBars } from "./music-player";

const tabletQuery = "(min-width: 768px)";
function subscribeTablet(onChange: () => void) {
  const query = matchMedia(tabletQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isTabletViewport = () => matchMedia(tabletQuery).matches;
const isServerTablet = () => false;

const statusClock = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function DuoMusicStatus({ onDarkBackdrop }: { onDarkBackdrop: boolean }) {
  const [time, setTime] = useState(() => statusClock.format(new Date()));
  useEffect(() => {
    let timer: number;
    function update() {
      const now = new Date();
      setTime(statusClock.format(now));
      timer = window.setTimeout(update, 60_000 - (now.getTime() % 60_000));
    }
    update();
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <aside
      aria-label="Simulated device status"
      {...stylex.props(s.duoStatus, onDarkBackdrop && s.duoStatusOnDark)}
    >
      <LocationArrowFill aria-hidden="true" width={11} height={11} />
      <time dateTime={time}>{time}</time>
      <svg aria-hidden="true" viewBox="0 0 32 32" width="32" height="32" fill="none">
        <g stroke="currentColor" strokeLinecap="round" strokeWidth="2">
          <path d="M5.8 25.6a14 14 0 0 1 18.1-21.1" />
          <path d="M23.9 4.5a14 14 0 0 1 2.3 21.1" opacity=".35" />
          <path
            d="M10 13a9.5 9.5 0 0 1 12 0m-9.5 2.8a5.5 5.5 0 0 1 7 0m-4.8 2.7a2 2 0 0 1 2.6 0"
            strokeWidth="1.6"
          />
        </g>
        <g fill="currentColor">
          <circle cx="16" cy="21" r=".9" />
          <circle cx="10.8" cy="29" r="1.2" />
          <circle cx="16" cy="30" r="1.2" opacity=".65" />
          <circle cx="21.2" cy="29" r="1.2" opacity=".4" />
        </g>
      </svg>
    </aside>
  );
}

function DuoAlbumShare({ album }: { album: MusicAlbum }) {
  const [feedback, setFeedback] = useState<{ copied: boolean } | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);
  return (
    <>
      <Button
        variant="borderless"
        isIconOnly
        aria-label="Share album"
        xstyle={[s.duoActionButton, s.duoGroupedAction]}
        onClick={async () => {
          const text = `${album.title} · ${album.artist}`;
          setFeedback(null);
          if (navigator.share) {
            try {
              await navigator.share({ text });
              return;
            } catch (error) {
              if (error instanceof DOMException && error.name === "AbortError") return;
            }
          }
          try {
            await navigator.clipboard.writeText(text);
            setFeedback({ copied: true });
          } catch {
            setFeedback({ copied: false });
          }
        }}
      >
        <ArrowUpFromSquare aria-hidden="true" width={19} height={19} />
      </Button>
      <output {...stylex.props(s.duoShareFeedback, !feedback && s.duoShareSilent)}>
        {feedback?.copied ? (
          <>
            <Check aria-hidden="true" width={14} height={14} />
            <span>Album details copied</span>
          </>
        ) : feedback ? (
          <>
            <CircleExclamation aria-hidden="true" width={14} height={14} />
            <span>Couldn’t share album details</span>
          </>
        ) : null}
      </output>
    </>
  );
}

const destinations = [
  { tab: "home", label: "Home", Icon: HouseFill },
  { tab: "new", label: "New", Icon: LayoutCellsLarge },
  { tab: "radio", label: "Radio", Icon: AntennaSignal },
  { tab: "library", label: "Library", Icon: SquareListUl },
] as const;
const genres = [
  ["Indie Pop", "#e0475b", "#f59e7c"],
  ["Electronic", "#3d5a8c", "#6c8ff0"],
  ["R&B", "#5b3f8f", "#c06ee8"],
  ["Folk", "#3f6f3a", "#a3c46c"],
  ["Ambient", "#273a6b", "#58a6c9"],
  ["Lo-fi", "#5f6e7f", "#a7b4c2"],
  ["Soul", "#9d2f2f", "#e7915a"],
  ["Rock", "#1f5d84", "#3f3f46"],
  ["Latin", "#4f7f2a", "#e9b949"],
  ["Classical", "#6f7d6a", "#c9b79c"],
] as const;
type LibraryList = "playlists" | "albums" | "songs" | "loved";
const libraryLists: { id: LibraryList; label: string; Icon: typeof ListUl }[] = [
  { id: "playlists", label: "Playlists", Icon: ListUl },
  { id: "albums", label: "Albums", Icon: LayoutCellsLarge },
  { id: "songs", label: "Songs", Icon: MusicNote },
  { id: "loved", label: "Loved Songs", Icon: HeartFill },
];

/**
 * Keeps scroll offsets shared between screens: the inactive half of a folding
 * display must match the interactive one, and the cover resumes where it was left.
 */
function useSyncedScroll(
  model: MusicModel,
  key: string,
  element: RefObject<HTMLElement | null>,
  interactive: boolean,
  snapshot: object,
) {
  const applied = useRef<string | null>(null);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    // Mirrors follow every published snapshot; the interactive screen restores
    // only when it navigates or takes over, so it never fights the user's scroll.
    const view = `${key}|${interactive}`;
    if (interactive && applied.current === view) return;
    applied.current = view;
    node.scrollTo({ top: model.readScroll(key) ?? 0, behavior: "instant" });
  }, [model, key, interactive, element, snapshot]);
  return () => {
    const node = element.current;
    if (node && interactive) model.saveScroll(key, node.scrollTop);
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = `music-${title.toLowerCase().replaceAll(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} {...stylex.props(s.section)}>
      <h2 id={id} {...stylex.props(s.sectionHeader)}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function AlbumCard({ album, onOpen }: { album: MusicAlbum; onOpen: (id: number) => void }) {
  return (
    <button type="button" onClick={() => onOpen(album.id)} {...stylex.props(s.card)}>
      <Artwork album={album} />
      <span {...stylex.props(s.caption)}>
        <span {...stylex.props(s.captionTitle)}>{album.title}</span>
        <span {...stylex.props(s.secondary)}>{album.artist}</span>
      </span>
    </button>
  );
}

function SongRow({
  track,
  current,
  playing,
  loved,
  duo,
  onPlay,
}: {
  track: MusicTrack;
  current: boolean;
  playing: boolean;
  loved: boolean;
  duo: boolean;
  onPlay: () => void;
}) {
  const album = albumOf(track);
  const artwork = <Artwork album={album} xstyle={[s.rowArt, duo && s.duoSongArt]} />;
  return (
    <li>
      <button
        type="button"
        aria-current={current || undefined}
        onClick={onPlay}
        {...stylex.props(s.row, duo && s.duoSongRow)}
      >
        {duo ? (
          <span {...stylex.props(s.duoSongArtworkSlot)}>
            {artwork}
            {current && (
              <span aria-hidden="true" {...stylex.props(s.duoSongPlaying)}>
                <PlayingBars playing={playing} compact />
              </span>
            )}
          </span>
        ) : (
          artwork
        )}
        <span {...stylex.props(s.rowBody)}>
          <span {...stylex.props(s.captionTitle, current && s.trackCurrent)}>{track.title}</span>
          <span {...stylex.props(s.secondary)}>
            {album.artist} · {album.title}
          </span>
        </span>
        <span {...stylex.props(s.rowTrailing)}>
          {loved && <HeartFill aria-label="Loved" {...stylex.props(s.loved)} />}
          {current && !duo ? (
            <PlayingBars playing={playing} />
          ) : (
            <span {...stylex.props(s.trackDuration, duo && s.duoSongDuration)}>
              {formatTime(track.duration)}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

export function MusicDemo({ model: controlled }: { model?: MusicModel } = {}) {
  const [local] = useState(() => (controlled ? null : createMusicSession()));
  const model = controlled ?? local!.screen("standalone");
  const snapshot = useSyncExternalStore(model.subscribe, model.getSnapshot, model.getSnapshot);
  const { state, interactive, revision } = snapshot;
  const tablet = useSyncExternalStore(
    subscribeTablet,
    // WebKit can report a transient viewport width for a hidden simulator iframe.
    () => (model.surface === "standalone" ? isTabletViewport() : model.surface !== "cover"),
    isServerTablet,
  );
  const main = useRef<HTMLElement>(null);
  const miniOpen = useRef<HTMLElement>(null);
  const page = state.pages.at(-1);
  const album = page?.kind === "album" ? albums[page.id]! : null;
  const duoAlbum = Boolean(controlled && album);
  const coverAlbum = duoAlbum && model.surface === "cover";
  const splitAlbum = duoAlbum && tablet;
  const duoSongs = Boolean(controlled && page?.kind === "list" && page.id === "songs");
  const viewKey = page ? `${page.kind}:${page.id}` : state.tab;
  const saveScroll = useSyncedScroll(model, viewKey, main, interactive, snapshot);
  useEffect(() => () => local?.dispose(), [local]);
  useEffect(() => {
    if (controlled) model.ready(snapshot);
  }, [controlled, model, snapshot]);

  const current = trackById(state.queue[state.index]!);
  const navigate = (tab: MusicTab) => {
    saveScroll();
    if (state.pages.length) model.set("pages", []);
    model.set("tab", tab);
  };
  const open = (destination: MusicPage) => {
    if (page?.kind === destination.kind && page.id === destination.id) return;
    saveScroll();
    model.set("pages", (pages) => [...pages, destination]);
  };
  const openAlbum = (id: number) => open({ kind: "album", id });
  const playTracks = (ids: number[], index: number, source: string) =>
    model.play(ids, index, source);
  const playCollection = (ids: number[], source: string) => {
    if (state.shuffle) model.setShuffle(false);
    playTracks(ids, 0, source);
  };
  const toggleSet = (key: "loved" | "saved", id: number) =>
    model.set(key, (previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const songList = (ids: number[], source: string) => (
    <ul {...stylex.props(s.list, duoSongs && s.duoSongsList)}>
      {ids.map((id, index) => (
        <SongRow
          key={id}
          track={trackById(id)}
          current={current.id === id}
          playing={state.playing}
          loved={state.loved.has(id)}
          duo={duoSongs}
          onPlay={() => playTracks(ids, index, source)}
        />
      ))}
    </ul>
  );

  function header(title: string) {
    return (
      <header {...stylex.props(s.header)}>
        <h1 {...stylex.props(s.title)}>{title}</h1>
        <Menu>
          <Menu.Trigger
            render={<Button variant="borderless" xstyle={s.avatar} />}
            aria-label="Account and appearance"
          >
            L
          </Menu.Trigger>
          <Menu.Content aria-label="Account" side="bottom" align="end" sideOffset={8}>
            <Menu.Item onClick={() => model.set("dark", !state.dark)}>
              <Menu.Item.Icon>{state.dark ? <Sun /> : <Moon />}</Menu.Item.Icon>
              <Menu.Item.Label>
                {state.dark ? "Light Appearance" : "Dark Appearance"}
              </Menu.Item.Label>
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </header>
    );
  }

  function home() {
    const recent = state.recent.map((id) => albums[id]!);
    return (
      <>
        {header("Home")}
        <Section title="Top Picks for You">
          <div {...stylex.props(s.shelf, s.topPicksShelf)}>
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                aria-label={`${playlist.title}, Made for You`}
                onClick={() => open({ kind: "playlist", id: playlist.id })}
                {...stylex.props(s.card)}
              >
                <Artwork playlist={playlist} featured />
              </button>
            ))}
          </div>
        </Section>
        <Section title="Recently Played">
          <div {...stylex.props(s.shelf)}>
            {recent.map((album) => (
              <AlbumCard key={album.id} album={album} onOpen={openAlbum} />
            ))}
          </div>
        </Section>
        <Section title="Your Favorite Artists">
          <div {...stylex.props(s.shelf)}>
            {albums.slice(0, 8).map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => openAlbum(album.id)}
                {...stylex.props(s.card)}
              >
                <Artwork album={album} xstyle={s.round} />
                <span {...stylex.props(s.caption)}>
                  <span {...stylex.props(s.captionTitle)}>{album.artist}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Stations for You">{stationShelf()}</Section>
      </>
    );
  }

  function stationShelf() {
    return (
      <div {...stylex.props(s.shelf, s.wideShelf)}>
        {stations.map((station) => (
          <button
            key={station.id}
            type="button"
            onClick={() => playTracks(stationTracks(station), 0, station.title)}
            {...stylex.props(s.card)}
          >
            <span {...stylex.props(s.feature, s.gradient(...station.colors))}>
              <span {...stylex.props(s.featureText)}>
                <span {...stylex.props(s.featureBadge)}>RADIO MIX</span>
                <span {...stylex.props(s.featureTitle)}>{station.title}</span>
                <span {...stylex.props(s.featureSubtitle)}>{station.subtitle}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  function newReleases() {
    const fresh = albums.filter((album) => album.year === 2026);
    const latest = fresh.flatMap((album) => album.tracks.slice(0, 2).map((track) => track.id));
    return (
      <>
        {header("New")}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.shelf, s.wideShelf)}>
            {fresh.slice(0, 4).map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => openAlbum(album.id)}
                {...stylex.props(s.card)}
              >
                <span {...stylex.props(s.feature)}>
                  <img src={album.artwork} alt="" draggable={false} {...stylex.props(s.image)} />
                  <span {...stylex.props(s.featureShade)} />
                  <span {...stylex.props(s.featureText)}>
                    <span {...stylex.props(s.featureBadge)}>NEW ALBUM</span>
                    <span {...stylex.props(s.featureTitle)}>{album.title}</span>
                    <span {...stylex.props(s.featureSubtitle)}>{album.artist}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <Section title="New Releases">
          <div {...stylex.props(s.shelf)}>
            {fresh.map((album) => (
              <AlbumCard key={album.id} album={album} onOpen={openAlbum} />
            ))}
          </div>
        </Section>
        <Section title="Latest Songs">{songList(latest, "Latest Songs")}</Section>
      </>
    );
  }

  function radio() {
    return (
      <>
        {header("Radio")}
        <Section title="Stations">{stationShelf()}</Section>
        <Section title="Episodes">
          <ul {...stylex.props(s.list)}>
            {stations.map((station) => {
              const ids = stationTracks(station);
              return (
                <li key={station.id}>
                  <button
                    type="button"
                    onClick={() => playTracks(ids, 0, station.title)}
                    {...stylex.props(s.row)}
                  >
                    <span
                      {...stylex.props(s.art, s.rowArt, s.gradient(...station.colors))}
                      aria-hidden="true"
                    />
                    <span {...stylex.props(s.rowBody)}>
                      <span {...stylex.props(s.captionTitle)}>{station.title} Hour</span>
                      <span {...stylex.props(s.secondary)}>
                        {ids.length} songs · {station.subtitle}
                      </span>
                    </span>
                    <span {...stylex.props(s.rowTrailing)}>
                      <PlayFill aria-hidden="true" {...stylex.props(s.smallIcon)} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      </>
    );
  }

  function library() {
    const saved = albums.filter((album) => state.saved.has(album.id));
    return (
      <>
        {header("Library")}
        <ul {...stylex.props(s.list, s.section)}>
          {libraryLists.map(({ id, label, Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => open({ kind: "list", id })}
                {...stylex.props(s.navRow)}
              >
                <Icon aria-hidden="true" {...stylex.props(s.navIcon)} />
                <span {...stylex.props(s.navLabel)}>{label}</span>
                <span {...stylex.props(s.navLabel)}>
                  <ChevronRight
                    aria-hidden="true"
                    {...stylex.props(s.smallIcon, s.sectionChevron)}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Section title="Recently Added">
          {saved.length ? (
            <div {...stylex.props(s.grid)}>
              {saved.map((album) => (
                <AlbumCard key={album.id} album={album} onOpen={openAlbum} />
              ))}
            </div>
          ) : (
            <p {...stylex.props(s.empty)}>Albums you add appear here.</p>
          )}
        </Section>
      </>
    );
  }

  function search() {
    const query = state.query.trim().toLowerCase();
    const albumMatches = albums.filter((album) =>
      `${album.title} ${album.artist} ${album.genre}`.toLowerCase().includes(query),
    );
    const songMatches = tracks
      .filter((track) => {
        const album = albumOf(track);
        return `${track.title} ${album.artist} ${album.genre}`.toLowerCase().includes(query);
      })
      .slice(0, 12)
      .map((track) => track.id);
    return (
      <>
        {header("Search")}
        <div {...stylex.props(s.searchHeader)}>
          <SearchField fullWidth name="music-search" aria-label="Search music">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                aria-label="Search music"
                placeholder="Artists, Songs, Albums"
                value={state.query}
                onValueChange={(value) => model.set("query", value)}
                onKeyDownCapture={(event) => {
                  if (isComposing(event)) event.stopPropagation();
                }}
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
        {!query ? (
          <Section title="Browse Categories">
            <div {...stylex.props(s.categories)}>
              {genres.map(([genre, from, to]) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => model.set("query", genre)}
                  {...stylex.props(s.category, s.gradient(from, to))}
                >
                  {genre}
                </button>
              ))}
            </div>
          </Section>
        ) : albumMatches.length + songMatches.length === 0 ? (
          <output {...stylex.props(s.empty)}>No results for “{state.query.trim()}”.</output>
        ) : (
          <>
            {albumMatches.length > 0 && (
              <Section title="Albums">
                <div {...stylex.props(s.shelf)}>
                  {albumMatches.map((album) => (
                    <AlbumCard key={album.id} album={album} onOpen={openAlbum} />
                  ))}
                </div>
              </Section>
            )}
            {songMatches.length > 0 && (
              <Section title="Songs">{songList(songMatches, `“${state.query.trim()}”`)}</Section>
            )}
          </>
        )}
      </>
    );
  }

  function pageBar(menu?: ReactNode) {
    const back = (
      <GlassButton
        isIconOnly
        aria-label="Back"
        onClick={() => {
          saveScroll();
          model.set("pages", (pages) => pages.slice(0, -1));
        }}
        xstyle={[s.pageBarControl, controlled && s.duoActionButton]}
      >
        <ChevronLeft width={controlled ? 19 : 22} height={controlled ? 19 : 22} />
      </GlassButton>
    );
    return (
      <div {...stylex.props(s.pageBar, controlled && s.duoPageBar)}>
        <ScrollEdge
          variant="soft"
          edge="top"
          scrollRef={duoAlbum ? main : undefined}
          xstyle={s.pageEdge}
        />
        {controlled ? (
          <div {...stylex.props(s.duoPageControls)}>
            {back}
            {menu}
          </div>
        ) : (
          <>
            {back}
            {menu}
          </>
        )}
      </div>
    );
  }

  function trackList(ids: number[], source: string, withArt: boolean) {
    return (
      <ol
        aria-label="Songs"
        {...stylex.props(
          s.tracks,
          coverAlbum && s.coverAlbumTracks,
          splitAlbum && s.splitAlbumTracks,
        )}
      >
        {ids.map((id, index) => {
          const track = trackById(id);
          const album = albumOf(track);
          const isCurrent = current.id === id;
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={isCurrent || undefined}
                onClick={() => playTracks(ids, index, source)}
                {...stylex.props(s.track, withArt && s.trackWithArt, duoAlbum && s.albumTrack)}
              >
                {withArt ? (
                  <Artwork album={album} xstyle={s.queueArt} />
                ) : (
                  <span {...stylex.props(s.trackNumber, duoAlbum && s.albumTrackNumber)}>
                    {isCurrent ? (
                      <PlayingBars playing={state.playing} compact={duoAlbum} />
                    ) : (
                      track.number
                    )}
                  </span>
                )}
                <span {...stylex.props(s.rowBody, duoAlbum && s.albumTrackCell)}>
                  <span
                    {...stylex.props(
                      s.captionTitle,
                      duoAlbum ? s.albumTrackTitle : isCurrent && s.trackCurrent,
                    )}
                  >
                    {track.title}
                  </span>
                  {withArt && <span {...stylex.props(s.secondary)}>{album.artist}</span>}
                </span>
                <span {...stylex.props(s.rowTrailing, duoAlbum && s.albumTrackCell)}>
                  {state.loved.has(id) && (
                    <HeartFill aria-label="Loved" {...stylex.props(s.loved)} />
                  )}
                  {withArt && isCurrent ? (
                    <PlayingBars playing={state.playing} />
                  ) : (
                    <span {...stylex.props(!duoAlbum && s.trackDuration)}>
                      {formatTime(track.duration)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    );
  }

  function collectionHero({
    art,
    title,
    subtitle,
    meta,
    description,
    ids,
    source,
  }: {
    art: ReactNode;
    title: string;
    subtitle: string;
    meta: string;
    description?: string;
    ids: number[];
    source: string;
  }) {
    const shuffle = (
      <Button
        variant="borderless"
        isIconOnly={duoAlbum}
        aria-label={duoAlbum ? "Shuffle" : undefined}
        onClick={() => {
          if (!state.shuffle) model.setShuffle(true);
          playTracks(ids, Math.floor(Math.random() * ids.length), source);
        }}
        xstyle={duoAlbum ? [s.duoAlbumAction, s.duoAlbumShuffle] : s.heroAction}
      >
        <Shuffle aria-hidden="true" {...stylex.props(s.smallIcon)} />
        {!duoAlbum && "Shuffle"}
      </Button>
    );
    return (
      <div
        {...stylex.props(s.hero, coverAlbum && s.coverAlbumHero, splitAlbum && s.splitAlbumHero)}
      >
        {art}
        <div {...stylex.props(s.heroText, splitAlbum && s.splitAlbumText)}>
          <h1 {...stylex.props(s.heroTitle)}>{title}</h1>
          <p {...stylex.props(s.heroArtist, duoAlbum && s.duoAlbumArtist)}>{subtitle}</p>
          <p {...stylex.props(s.heroMeta)}>{meta}</p>
          {description && <p {...stylex.props(s.heroDescription)}>{description}</p>}
          <div
            {...stylex.props(
              s.heroActions,
              duoAlbum && s.duoAlbumActions,
              coverAlbum && s.coverAlbumActions,
            )}
          >
            {duoAlbum && shuffle}
            <Button
              variant={duoAlbum ? "prominent" : "borderless"}
              fullWidth={duoAlbum || undefined}
              tint={duoAlbum ? "var(--lenso-label-primary)" : undefined}
              onClick={() => playCollection(ids, source)}
              xstyle={duoAlbum ? [s.duoAlbumAction, s.duoAlbumPlay] : s.heroAction}
            >
              <PlayFill aria-hidden="true" {...stylex.props(s.smallIcon)} />
              Play
            </Button>
            {!duoAlbum && shuffle}
          </div>
        </div>
      </div>
    );
  }

  function albumPage(album: MusicAlbum) {
    const ids = album.tracks.map((track) => track.id);
    const minutes = Math.round(album.tracks.reduce((sum, track) => sum + track.duration, 0) / 60);
    const saved = state.saved.has(album.id);
    const options = (
      <Menu morphTrigger={!duoAlbum}>
        <Menu.Trigger
          render={
            duoAlbum ? (
              <Button
                variant="borderless"
                isIconOnly
                xstyle={[s.duoActionButton, s.duoGroupedAction, s.duoMore]}
              />
            ) : (
              <GlassButton isIconOnly xstyle={s.pageBarControl} />
            )
          }
          aria-label="Album options"
        >
          <Ellipsis width={duoAlbum ? 19 : 22} height={duoAlbum ? 19 : 22} />
        </Menu.Trigger>
        <Menu.Content
          aria-label="Album options"
          side={duoAlbum ? "left" : "bottom"}
          align={duoAlbum ? "start" : "end"}
          sideOffset={8}
        >
          <Menu.Item onClick={() => toggleSet("saved", album.id)}>
            <Menu.Item.Icon>{saved ? <Check /> : <Plus />}</Menu.Item.Icon>
            <Menu.Item.Label>{saved ? "Remove from Library" : "Add to Library"}</Menu.Item.Label>
          </Menu.Item>
          <Menu.Item onClick={() => playCollection(ids, album.title)}>
            <Menu.Item.Icon>
              <PlayFill />
            </Menu.Item.Icon>
            <Menu.Item.Label>Play</Menu.Item.Label>
          </Menu.Item>
        </Menu.Content>
      </Menu>
    );
    return (
      <>
        {pageBar(
          duoAlbum ? (
            <Glass xstyle={s.duoActionsGlass}>
              <DuoAlbumShare album={album} />
              {options}
            </Glass>
          ) : (
            options
          ),
        )}
        <div {...stylex.props(splitAlbum && s.splitAlbum)}>
          {collectionHero({
            art: (
              <Artwork
                album={album}
                xstyle={[s.heroArt, coverAlbum && s.coverAlbumArt, splitAlbum && s.splitAlbumArt]}
              />
            ),
            title: album.title,
            subtitle: album.artist,
            meta: `${album.genre} · ${album.year}`,
            ids,
            source: album.title,
          })}
          <div>
            {trackList(ids, album.title, false)}
            <p {...stylex.props(s.footerNote, splitAlbum && s.splitAlbumFooter)}>
              {album.tracks.length} songs, {minutes} minutes
            </p>
          </div>
        </div>
      </>
    );
  }

  function playlistPage(id: string) {
    const playlist = playlistById(id);
    const minutes = Math.round(
      playlist.trackIds.reduce((sum, track) => sum + trackById(track).duration, 0) / 60,
    );
    return (
      <>
        {pageBar()}
        {collectionHero({
          art: <Artwork playlist={playlist} xstyle={s.heroArt} />,
          title: playlist.title,
          subtitle: "Lenso Music",
          meta: `Updated today · ${minutes} minutes`,
          description: playlist.description,
          ids: playlist.trackIds,
          source: playlist.title,
        })}
        {trackList(playlist.trackIds, playlist.title, true)}
      </>
    );
  }

  function listPage(id: LibraryList) {
    const title = libraryLists.find((item) => item.id === id)!.label;
    const savedAlbums = albums.filter((album) => state.saved.has(album.id));
    const songs =
      id === "loved"
        ? tracks.filter((track) => state.loved.has(track.id))
        : savedAlbums.flatMap((album) => album.tracks);
    return (
      <>
        {pageBar()}
        <header {...stylex.props(s.header)}>
          <h1 {...stylex.props(s.title)}>{title}</h1>
        </header>
        <div {...stylex.props(s.section, duoSongs && s.duoSongsSection)}>
          {id === "albums" ? (
            savedAlbums.length ? (
              <div {...stylex.props(s.grid)}>
                {savedAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} onOpen={openAlbum} />
                ))}
              </div>
            ) : (
              <p {...stylex.props(s.empty)}>Albums you add appear here.</p>
            )
          ) : id === "playlists" ? (
            <ul {...stylex.props(s.list)}>
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    type="button"
                    onClick={() => open({ kind: "playlist", id: playlist.id })}
                    {...stylex.props(s.row)}
                  >
                    <Artwork playlist={playlist} xstyle={s.rowArt} />
                    <span {...stylex.props(s.rowBody)}>
                      <span {...stylex.props(s.captionTitle)}>{playlist.title}</span>
                      <span {...stylex.props(s.secondary)}>{playlist.trackIds.length} songs</span>
                    </span>
                    <span {...stylex.props(s.rowTrailing)}>
                      <ChevronRight aria-hidden="true" {...stylex.props(s.smallIcon)} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : songs.length ? (
            songList(
              songs.map((track) => track.id),
              title,
            )
          ) : (
            <p {...stylex.props(s.empty)}>
              {id === "loved" ? "Songs you love appear here." : "Songs you add appear here."}
            </p>
          )}
        </div>
      </>
    );
  }

  const content = album
    ? albumPage(album)
    : page?.kind === "playlist"
      ? playlistPage(page.id)
      : page?.kind === "list"
        ? listPage(page.id)
        : { home, new: newReleases, radio, library, search }[state.tab]();

  const miniPlayer = (
    <MiniPlayer model={model} state={state} openRef={miniOpen} onShowAlbum={openAlbum} />
  );
  const searchDestination = { tab: "search", label: "Search", Icon: Magnifier } as const;

  const navigation = controlled ? (
    <TabBar
      aria-label="Music navigation"
      layout="vertical"
      xstyle={[deviceLab.appTabBar, s.tabTint]}
    >
      <TabBar.Group>
        {[...destinations, searchDestination].map(({ tab, label, Icon }) => (
          <TabBar.Link
            key={tab}
            href={`#${tab}`}
            isCurrent={state.tab === tab}
            icon={<Icon {...stylex.props(s.icon)} />}
            onClick={(event) => {
              event.preventDefault();
              navigate(tab);
            }}
          >
            {label}
          </TabBar.Link>
        ))}
      </TabBar.Group>
    </TabBar>
  ) : tablet ? (
    <Glass xstyle={s.sidebar}>
      <nav aria-label="Music navigation" {...stylex.props(s.sidebarNavigation)}>
        <span {...stylex.props(s.sidebarTitle)}>Music</span>
        {[searchDestination, ...destinations].map(({ tab, label, Icon }) => (
          <Link
            key={tab}
            href={`#${tab}`}
            aria-current={state.tab === tab && page?.kind !== "list" ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigate(tab);
            }}
            xstyle={[
              s.sidebarLink,
              state.tab === tab && page?.kind !== "list" && s.sidebarSelected,
            ]}
          >
            <Icon aria-hidden="true" {...stylex.props(s.smallIcon)} />
            {label}
          </Link>
        ))}
        <span {...stylex.props(s.sidebarSection)}>Library</span>
        {libraryLists.map(({ id, label, Icon }) => {
          const selected = page?.kind === "list" && page.id === id;
          return (
            <Link
              key={id}
              href={`#${id}`}
              aria-current={selected ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                saveScroll();
                model.set("tab", "library");
                model.set("pages", [{ kind: "list", id }]);
              }}
              xstyle={[s.sidebarLink, selected && s.sidebarSelected]}
            >
              <Icon aria-hidden="true" {...stylex.props(s.smallIcon)} />
              {label}
            </Link>
          );
        })}
      </nav>
    </Glass>
  ) : (
    <TabBar aria-label="Music navigation" layout="phone" xstyle={s.tabTint}>
      <TabBar.Group>
        {destinations.map(({ tab, label, Icon }) => (
          <TabBar.Link
            key={tab}
            href={`#${tab}`}
            isCurrent={state.tab === tab}
            icon={<Icon />}
            onClick={(event) => {
              event.preventDefault();
              navigate(tab);
            }}
          >
            {label}
          </TabBar.Link>
        ))}
      </TabBar.Group>
      <TabBar.Group separate>
        <TabBar.Link
          href="#search"
          iconOnly
          isCurrent={state.tab === "search"}
          icon={<Magnifier />}
          onClick={(event) => {
            event.preventDefault();
            navigate("search");
          }}
        >
          Search
        </TabBar.Link>
      </TabBar.Group>
    </TabBar>
  );

  return (
    <ThemeScope
      theme={duoAlbum || state.dark ? "dark" : "light"}
      xstyle={[
        s.root,
        state.dark && s.dark,
        model.surface === "cover" && s.duoCover,
        controlled && album && s.duoAlbumPalette(album.artworkColor),
      ]}
      inert={!interactive}
    >
      {controlled && <DuoMusicStatus onDarkBackdrop={duoAlbum || state.nowPlaying} />}
      <main
        ref={main}
        key={viewKey}
        id="main-content"
        data-music-demo=""
        data-music-revision={controlled ? revision : undefined}
        inert={!interactive || state.nowPlaying}
        onScroll={saveScroll}
        {...stylex.props(
          s.main,
          controlled ? s.mainWithDuoRail : tablet && s.mainWithSidebar,
          tablet && page && page.kind !== "list" && s.mainCollection,
          (coverAlbum || duoSongs) && s.mainAboveDuoPlayer,
        )}
      >
        {content}
        <p {...stylex.props(s.credit)}>
          Fictional catalog · Original synthesized previews · Artwork from{" "}
          <Link href="https://unsplash.com">Unsplash</Link>
        </p>
      </main>
      <div inert={!interactive || state.nowPlaying}>
        <ThemeScope glassTint={duoAlbum ? 0.5 : 0.875}>
          {controlled ? (
            <>
              {navigation}
              <div {...stylex.props(s.duoPlayer)}>{miniPlayer}</div>
            </>
          ) : tablet ? (
            <>
              {navigation}
              <div {...stylex.props(s.tabletPlayer)}>{miniPlayer}</div>
            </>
          ) : (
            <div {...stylex.props(s.navigation)}>
              {miniPlayer}
              {navigation}
            </div>
          )}
        </ThemeScope>
      </div>
      <NowPlaying
        model={model}
        state={state}
        interactive={interactive}
        returnFocus={miniOpen}
        onShowAlbum={(id) => {
          model.set("nowPlaying", false);
          openAlbum(id);
        }}
      />
    </ThemeScope>
  );
}
