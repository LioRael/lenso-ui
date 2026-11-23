"use client";

import { isComposing } from "@ui-sdk/core";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Button,
  Drawer,
  GlassButton,
  GlassContainer,
  Link,
  SearchField,
  TabBar,
  Tabs,
  ThemeScope,
  Toolbar,
} from "@lenso/ui";
import {
  Check,
  ChevronLeft,
  CopyPicture,
  Folder,
  Heart,
  HeartFill,
  LayoutCellsLarge,
  LayoutSideContentLeft,
  Person,
  Xmark,
  Magnifier,
  Sliders,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { albumNames, type DemoPhoto } from "../lib/photos-library";
import { photos as s } from "../styles/photos-demo.stylex";
import { PhotoImage } from "./photos-image";
import { ScrollEdge } from "../../../../packages/ui/src/utils/materials/render.tsx";
import { usePhotosSearchTransition } from "./photos-search-transition";
import { PhotosViewer } from "./photos-viewer";
import type { PhotoEdit } from "../lib/photos-adjustments";

import { usePhotosDragSelection } from "./photos-drag-selection";
import { usePhotosSelectionTransition } from "./photos-selection-transition";
import { PhotosLibraryMenu, photoFilters, type PhotoFilter } from "./photos-library-menu";
import { PhotosSelectionActions, PhotosSelectionMenu } from "./photos-selection-actions";
import { PhotosLibraryOverview, type LibraryView } from "./photos-library-overview";
import { createPhotosSession, usePhotosField, type PhotosModel } from "../lib/photos-model";

type Destination = "library" | "collections" | "search";

const tabletQuery = "(min-width: 768px)";
function subscribeTablet(onChange: () => void) {
  const query = matchMedia(tabletQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isTabletViewport = () => matchMedia(tabletQuery).matches;
const isServerTablet = () => false;

const landscapeQuery = "(orientation: landscape)";
function subscribeLandscape(onChange: () => void) {
  const query = matchMedia(landscapeQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isLandscapeViewport = () => matchMedia(landscapeQuery).matches;

const pinnedCollections = [
  { name: "Favorites", icon: Heart },
  { name: "People", icon: Person },
  { name: "Edited", icon: Sliders },
] as const;

function Collections({
  photos,
  favorites,
  onOpen,
  edited,
  albums,
}: {
  photos: DemoPhoto[];
  favorites: Set<number>;
  onOpen: (name: string) => void;
  edited: Map<number, PhotoEdit>;
  albums: Map<string, Set<number>>;
}) {
  function album(name: string, pinned: boolean) {
    const items = photos.filter((photo) =>
      name === "Favorites"
        ? favorites.has(photo.id)
        : name === "Edited"
          ? edited.has(photo.id)
          : photo.collection === name || Boolean(albums.get(name)?.has(photo.id)),
    );
    return (
      <Button key={name} variant="borderless" onClick={() => onOpen(name)} xstyle={s.collection}>
        <span {...stylex.props(s.collectionCover, pinned && s.pinnedCover)}>
          {items[0] ? (
            <PhotoImage photo={items[0]} />
          ) : name === "Edited" ? (
            <Sliders {...stylex.props(s.emptyIcon)} />
          ) : (
            <Heart {...stylex.props(s.emptyIcon)} />
          )}
        </span>
        <span {...stylex.props(s.collectionCaption)}>
          <span {...stylex.props(s.collectionName, pinned && s.pinnedName)}>{name}</span>
          <span {...stylex.props(s.secondary)}>{items.length}</span>
        </span>
      </Button>
    );
  }
  return (
    <div {...stylex.props(s.collectionsPage)}>
      <section aria-labelledby="pinned-heading">
        <h2 id="pinned-heading" {...stylex.props(s.collectionHeading)}>
          Pinned Collections
        </h2>
        <div {...stylex.props(s.pinnedGrid)}>
          {["Favorites", "People", "Edited"].map((name) => album(name, true))}
        </div>
      </section>
      <section aria-labelledby="albums-heading">
        <h2 id="albums-heading" {...stylex.props(s.collectionHeading)}>
          Albums
        </h2>
        <div {...stylex.props(s.collections)}>{albumNames.map((name) => album(name, false))}</div>
      </section>
    </div>
  );
}

function DuoStatus({ cover, overPhotos }: { cover: boolean; overPhotos: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <aside
      aria-label="Device status"
      {...stylex.props(
        s.deviceStatus,
        overPhotos && s.headingOverPhotos,
        overPhotos && cover && s.coverStatusOverPhotos,
      )}
    >
      <time>
        {now.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hourCycle: "h23",
        })}
      </time>
      {cover && (
        // Status glyph geometry adapted from Doan Labs' Duo (MIT).
        <svg
          aria-hidden="true"
          viewBox="0 0 40 44"
          width="40"
          height="44"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
        >
          <path d="M6.4 30.8a15.8 15.8 0 1 1 27.2 0" strokeWidth="2.6" />
          <path d="M13 21a10.2 10.2 0 0 1 14 0m-11 3.1a6 6 0 0 1 8 0" strokeWidth="2.3" />
          <path
            d="M18.2 26.3q1.8-1.45 3.6 0a.5.5 0 0 1 0 .7l-1.4 1.4a.6.6 0 0 1-.8 0L18.2 27a.5.5 0 0 1 0-.7Z"
            fill="currentColor"
            stroke="none"
          />
          <g fill="currentColor" stroke="none" opacity=".28">
            <circle cx="12" cy="36" r="1.65" />
            <circle cx="17.4" cy="38" r="1.65" />
            <circle cx="22.6" cy="38" r="1.65" />
            <circle cx="28" cy="36" r="1.65" />
          </g>
        </svg>
      )}
    </aside>
  );
}

export function PhotosDemo({ model: controlled }: { model?: PhotosModel } = {}) {
  const [local] = useState(() => (controlled ? null : createPhotosSession()));
  const model = controlled ?? local!.screen("standalone");
  const snapshot = useSyncExternalStore(model.subscribe, model.getSnapshot, model.getSnapshot);
  const { interactive, revision } = snapshot;
  const tablet = useSyncExternalStore(subscribeTablet, isTabletViewport, isServerTablet);
  const landscape = useSyncExternalStore(subscribeLandscape, isLandscapeViewport, isServerTablet);
  const dockSidebar = tablet && landscape;
  const cover = model.surface === "cover";
  const verticalControls = cover || (model.surface !== "standalone" && landscape);
  const Navigation = verticalControls ? Toolbar : TabBar;
  const NavigationGroup = verticalControls ? Toolbar.Group : TabBar.Group;
  const [destination, setDestination] = usePhotosField(model, "destination");
  const [query, setQuery] = usePhotosField(model, "query");
  const [recentSearches, setRecentSearches] = usePhotosField(model, "recentSearches");
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const { fieldRef: searchFieldRef, capture: captureSearch } = usePhotosSearchTransition(
    destination === "search",
    searchTrigger,
    verticalControls,
  );
  const searchRequested = useRef(false);
  const focusSearch = useCallback(
    (input: HTMLInputElement | null) => {
      if (!input) return;
      const cleanup = model.registerTextInput("search", input);
      if (model.getSnapshot().interactive && (!controlled || searchRequested.current)) {
        input.focus();
        searchRequested.current = false;
      }
      return cleanup;
    },
    [controlled, model],
  );
  const [searchOrigin, setSearchOrigin] = usePhotosField(model, "searchOrigin");
  const [selectionAnchor, setSelectionAnchor] = usePhotosField(model, "selectionAnchor");
  const searchRestore = useRef<typeof searchOrigin | null>(null);
  const [collection, setCollection] = usePhotosField(model, "collection");
  const [favorites, setFavorites] = usePhotosField(model, "favorites");
  const [deleted, setDeleted] = usePhotosField(model, "deleted");
  const [sources] = usePhotosField(model, "sources");
  const [hiddenPhotos, setHiddenPhotos] = usePhotosField(model, "hiddenPhotos");
  const [lastHidden, setLastHidden] = usePhotosField(model, "lastHidden");
  const [lastDeleted, setLastDeleted] = usePhotosField(model, "lastDeleted");
  const [selected, setSelected] = usePhotosField(model, "selected");
  const [viewerPhotos, setViewerPhotos] = usePhotosField(model, "viewerPhotos");
  const [libraryView, setLibraryView] = usePhotosField(model, "libraryView");
  const [navigationMinimized, setNavigationMinimized] = usePhotosField(
    model,
    "navigationMinimized",
  );
  const restoreLibraryPosition = useRef(true);
  const [dense, setDense] = usePhotosField(model, "dense");
  const [dark, setDark] = usePhotosField(model, "dark");
  const [selecting, setSelectingState] = usePhotosField(model, "selecting");
  const { headerRef: selectionHeaderRef, capture: captureSelection } = usePhotosSelectionTransition(
    selecting,
    verticalControls,
  );
  function setSelecting(value: boolean, animate = false) {
    captureSelection(animate);
    setSelectingState(value);
  }
  const [selection, setSelection] = usePhotosField(model, "selection");
  const [edits] = usePhotosField(model, "edits");
  const [captions, setCaptions] = usePhotosField(model, "captions");
  const [filter, setFilter] = usePhotosField(model, "filter");
  const [cropped, setCropped] = usePhotosField(model, "cropped");
  const [albums, setAlbums] = usePhotosField(model, "albums");
  const [notice, setNotice] = usePhotosField(model, "notice");
  const [scrollAnchor, setScrollAnchor] = usePhotosField(model, "scrollAnchor");
  const selectButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    return () => local?.dispose();
  }, [local]);
  const main = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useLayoutEffect(() => {
    if (destination !== "library" || collection || !restoreLibraryPosition.current) return;
    const element = main.current;
    if (!element) return;
    const position = () => {
      element.scrollTop = libraryView === "all" ? element.scrollHeight : 0;
    };
    position();
    const frame = requestAnimationFrame(position);
    restoreLibraryPosition.current = false;
    return () => cancelAnimationFrame(frame);
  }, [destination, collection, libraryView]);
  const tiles = useRef(new Map<number, HTMLElement>());
  const pointerOpened = useRef(false);
  const finishClose = useCallback(() => setSelected(null), [setSelected]);
  const displayLibrary = sources.map((photo) => {
    const edit = edits.get(photo.id);
    return edit
      ? {
          ...photo,
          src: edit.src,
          thumb: edit.src,
          width: edit.width ?? photo.width,
          height: edit.height ?? photo.height,
        }
      : photo;
  });
  const activeLibrary = displayLibrary.filter(
    (photo) => !deleted.has(photo.id) && !hiddenPhotos.has(photo.id),
  );
  const isLibrary = destination === "library" && !collection;
  const visible = activeLibrary.filter(
    (photo) =>
      (collection === "Favorites"
        ? favorites.has(photo.id)
        : collection === "Edited"
          ? edits.has(photo.id)
          : !collection ||
            photo.collection === collection ||
            Boolean(albums.get(collection)?.has(photo.id))) &&
      (!isLibrary ||
        filter === "all" ||
        (filter === "favorites"
          ? favorites.has(photo.id)
          : filter === "edited"
            ? edits.has(photo.id)
            : filter === "photos")) &&
      (destination !== "search" ||
        `${photo.title} ${photo.collection} ${captions.get(photo.id) ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())),
  );
  const selectionGrid = usePhotosDragSelection({
    active: selecting && interactive,
    ids: visible.map((photo) => photo.id),
    selected: selection,
    onChange: setSelection,
    viewport: main,
  });
  const wasInteractive = useRef(interactive);
  const restoringScroll = useRef(false);
  useLayoutEffect(() => {
    if (
      controlled &&
      (!interactive || !wasInteractive.current || searchRestore.current) &&
      scrollAnchor &&
      main.current
    ) {
      const tile = tiles.current.get(scrollAnchor.id);
      if (tile) {
        const bounds = tile.getBoundingClientRect();
        const offset = bounds.top - main.current.getBoundingClientRect().top;
        const delta = offset - scrollAnchor.offset * bounds.height;
        if (Math.abs(delta) > 0.5) {
          restoringScroll.current = true;
          main.current.scrollTop += delta;
        }
      }
    }
    wasInteractive.current = interactive;
  }, [controlled, interactive, scrollAnchor, revision]);
  useEffect(() => {
    if (controlled) model.ready(snapshot);
  }, [controlled, model, snapshot]);
  const { saveEdit, duplicatePhoto } = model;
  function openCollection(name: string | null) {
    setScrollAnchor(null);
    setSelecting(false);
    setSelection(new Set());
    setSelectionAnchor(null);
    setNavigationMinimized(false);
    main.current?.scrollTo({ top: 0, behavior: "instant" });
    setCollection(name);
  }
  function openSidebarCollection(name: string) {
    setDestination("collections");
    openCollection(name);
  }
  function changeLibraryView(next: LibraryView) {
    setScrollAnchor(null);
    if (next === libraryView) {
      const element = main.current;
      if (element) element.scrollTop = next === "all" ? element.scrollHeight : 0;
    } else restoreLibraryPosition.current = true;
    setLibraryView(next);
    setNavigationMinimized(true);
  }
  function navigate(next: Destination) {
    setScrollAnchor(null);
    restoreLibraryPosition.current = next === "library";
    setNavigationMinimized(false);
    main.current?.scrollTo({ top: 0, behavior: "instant" });
    if (next === "library" && main.current) main.current.scrollTop = main.current.scrollHeight;
    setSelectionAnchor(null);
    setDestination(next);
    setCollection(null);
    setSelecting(false);
    setSelection(new Set());
  }
  function openSearch(animate = false) {
    searchRequested.current = true;
    captureSearch(true, animate);
    setSearchOrigin({
      destination,
      collection,
      top: main.current?.scrollTop ?? 0,
      minimized: navigationMinimized,
      anchor: scrollAnchor,
    });
    setQuery("");
    navigate("search");
  }
  function closeSearch(animate = false) {
    captureSearch(false, animate);
    const origin = searchOrigin;
    restoreLibraryPosition.current = false;
    setDestination(origin.destination);
    setCollection(origin.collection);
    setNavigationMinimized(origin.minimized);
    setScrollAnchor(origin.anchor);
    setQuery("");
    searchRestore.current = origin;
  }
  useLayoutEffect(() => {
    const origin = searchRestore.current;
    if (destination === "search" || !origin) return;
    searchRestore.current = null;
    if (main.current && !controlled) main.current.scrollTop = origin.top;
    searchTrigger.current?.focus({ preventScroll: true });
  }, [destination, controlled]);

  useEffect(() => {
    if (destination !== "search") return;
    const viewport = window.visualViewport;
    const host = main.current;
    const update = () =>
      host?.style.setProperty(
        "--photos-keyboard-inset",
        `${Math.max(0, window.innerHeight - (viewport?.height ?? window.innerHeight) - (viewport?.offsetTop ?? 0))}px`,
      );
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      host?.style.removeProperty("--photos-keyboard-inset");
    };
  }, [destination]);
  function toggleFavorite(id: number) {
    setFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function removePhoto(id: number) {
    setNotice("");
    const index = viewerPhotos.findIndex((photo) => photo.id === id);
    const remaining = viewerPhotos.filter((photo) => photo.id !== id);
    setDeleted((previous) => new Set([...previous, id]));
    setLastDeleted([id]);
    setViewerPhotos(remaining);
    setSelected(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
  }
  function hidePhoto(id: number) {
    const remaining = viewerPhotos.filter((photo) => photo.id !== id);
    const index = viewerPhotos.findIndex((photo) => photo.id === id);
    setHiddenPhotos((previous) => new Set(previous).add(id));
    setLastHidden(id);
    setViewerPhotos(remaining);
    setSelected(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
  }
  function exitSelection(animate = false) {
    setSelecting(false, animate);
    setSelection(new Set());
    setSelectionAnchor(null);
    requestAnimationFrame(() => {
      const target =
        selectButton.current && !selectButton.current.disabled
          ? selectButton.current
          : main.current?.querySelector<HTMLButtonElement>('[aria-label="Sort and filter"]');
      target?.focus({ preventScroll: true });
    });
  }
  function toggleSelection(id: number, range = false) {
    const start = visible.findIndex((p) => p.id === selectionAnchor);
    const end = visible.findIndex((p) => p.id === id);
    setSelection((previous) => {
      const next = new Set(previous);
      if (range && start >= 0)
        visible
          .slice(Math.min(start, end), Math.max(start, end) + 1)
          .forEach((p) => next.add(p.id));
      else if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectionAnchor(id);
  }
  function changeFilter(value: PhotoFilter) {
    setScrollAnchor(null);
    setNotice("");
    setFilter(value);
    setSelection(new Set());
    setSelectionAnchor(null);
  }
  const selectedPhotos = activeLibrary.filter((p) => selection.has(p.id));
  const allFavorites =
    selectedPhotos.length > 0 && selectedPhotos.every((p) => favorites.has(p.id));
  function favoriteSelection() {
    setFavorites((previous) => {
      const next = new Set(previous);
      selectedPhotos.forEach((p) => {
        if (allFavorites) next.delete(p.id);
        else next.add(p.id);
      });
      return next;
    });
    setNotice(allFavorites ? "Removed from Favorites" : "Added to Favorites");
  }
  function addToAlbum(name: DemoPhoto["collection"]) {
    const additions = selectedPhotos.filter(
      (photo) => photo.collection !== name && !albums.get(name)?.has(photo.id),
    );
    if (!additions.length) {
      setNotice(`Selected photos are already in ${name}`);
      return;
    }
    setAlbums((previous) =>
      new Map(previous).set(
        name,
        new Set([...(previous.get(name) ?? []), ...additions.map((photo) => photo.id)]),
      ),
    );
    setNotice(
      `Added ${additions.length} ${additions.length === 1 ? "photo" : "photos"} to ${name}`,
    );
  }
  function deleteSelection() {
    setNotice("");
    const ids = [...selection];
    setDeleted((previous) => new Set([...previous, ...ids]));
    setLastDeleted(ids);
    exitSelection();
  }
  function aspectLayout(index: number) {
    const columns = dense ? 3 : 2;
    const row = visible.slice(
      Math.floor(index / columns) * columns,
      (Math.floor(index / columns) + 1) * columns,
    );
    const ratio = visible[index]!.width / visible[index]!.height;
    return s.aspectTile(
      ratio,
      ratio / row.reduce((sum, photo) => sum + photo.width / photo.height, 0),
      row.length - 1,
    );
  }
  const shownCount =
    destination === "collections" && !collection ? activeLibrary.length : visible.length;
  const title =
    collection ??
    (destination === "library" ? "Library" : destination === "search" ? "Search" : "Collections");
  const stickyLibraryHeader = isLibrary && libraryView === "all" && visible.length > 0;
  const headingOverPhotos = stickyLibraryHeader && (verticalControls || scrolled);
  const fullBleedLibrary = verticalControls && stickyLibraryHeader;
  const railSearch = verticalControls && destination === "search";
  return (
    <ThemeScope
      theme={dark ? "dark" : "light"}
      xstyle={[
        s.root,
        dockSidebar && s.dockSidebar,
        verticalControls && s.verticalControls,
        verticalControls && !fullBleedLibrary && s.reserveRail,
        cover && s.coverControls,
      ]}
      inert={!interactive}
    >
      {verticalControls && <DuoStatus cover={cover} overPhotos={fullBleedLibrary} />}
      <Tabs
        value={libraryView}
        onValueChange={(value) => {
          if (value === "years" || value === "months" || value === "all") changeLibraryView(value);
        }}
        glass
        xstyle={s.viewTabs}
      >
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Scoped selection keyboard shortcuts bubble from the photo buttons. */}
        <main
          ref={main}
          id="main-content"
          data-photos-demo=""
          data-photos-revision={controlled ? revision : undefined}
          inert={!interactive}
          onScroll={(event) => {
            if (!verticalControls) {
              const next = event.currentTarget.scrollTop > 0;
              if (next !== scrolled) setScrolled(next);
            }
            if (restoringScroll.current) {
              restoringScroll.current = false;
              return;
            }
            if (!controlled || !interactive || selected !== null || !main.current) return;
            const top = main.current.getBoundingClientRect().top;
            const tile = [...tiles.current.entries()].find(
              ([, node]) => node.getBoundingClientRect().bottom > top,
            );
            if (tile) {
              const bounds = tile[1].getBoundingClientRect();
              const anchor = { id: tile[0], offset: (bounds.top - top) / bounds.height };
              if (
                anchor.id !== scrollAnchor?.id ||
                Math.abs(anchor.offset - scrollAnchor.offset) > 0.001
              )
                setScrollAnchor(anchor);
            }
          }}
          onKeyDown={(event) => {
            if (
              !selecting ||
              event.defaultPrevented ||
              (event.target instanceof HTMLElement &&
                event.target.closest(
                  "input, textarea, [contenteditable=true], [role=dialog], [role=alertdialog], [role=menu]",
                ))
            )
              return;
            if (event.key === "Escape") {
              event.preventDefault();
              exitSelection();
            } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
              event.preventDefault();
              setSelection(new Set(visible.map((p) => p.id)));
            }
          }}
          {...stylex.props(s.main)}
        >
          <header
            {...stylex.props(
              s.header,
              stickyLibraryHeader && s.libraryHeader,
              stickyLibraryHeader && verticalControls && s.railLibraryHeader,
              railSearch && s.railSearchHeader,
            )}
          >
            {headingOverPhotos && <ScrollEdge variant="soft" edge="top" xstyle={s.headerEdge} />}
            <div {...stylex.props(s.headingRow)}>
              <div
                {...stylex.props(
                  headingOverPhotos && s.headingOverPhotos,
                  !dockSidebar && s.sidebarCovered,
                )}
              >
                <h1 {...stylex.props(s.title)}>{title}</h1>
                {isLibrary && (
                  <p {...stylex.props(s.itemCount)}>
                    {`${visible.length} ${visible.length === 1 ? "Item" : "Items"}${filter !== "all" ? ` · ${photoFilters[filter]}` : ""}`}
                  </p>
                )}
              </div>
              <GlassContainer
                ref={selectionHeaderRef}
                spacing={8}
                xstyle={[
                  s.actions,
                  s.libraryGlass,
                  verticalControls && s.railActions,
                  destination === "search" && s.hidden,
                ]}
              >
                <Toolbar
                  orientation={verticalControls ? "vertical" : "horizontal"}
                  aria-label={selecting ? "Selection options" : "Library options"}
                >
                  <Toolbar.Group
                    data-selection-morph="filter"
                    xstyle={[
                      s.headerFilterGroup,
                      verticalControls && s.railFilterGroup,
                      selecting &&
                        (verticalControls ? s.railFilterExpanded : s.headerFilterExpanded),
                    ]}
                  >
                    <PhotosLibraryMenu
                      filter={filter}
                      onFilter={changeFilter}
                      dense={dense}
                      onDense={setDense}
                      cropped={cropped}
                      onCropped={setCropped}
                      dark={dark}
                      onDark={setDark}
                      library={isLibrary}
                      side={verticalControls ? "left" : "bottom"}
                      grid={
                        (destination !== "collections" || Boolean(collection)) &&
                        (!isLibrary || libraryView === "all")
                      }
                      trigger={
                        <Toolbar.Button aria-label="Sort and filter" xstyle={s.headerIconButton} />
                      }
                    />
                    <span
                      inert={!selecting}
                      aria-hidden={!selecting}
                      {...stylex.props(
                        s.headerMore,
                        selecting && s.headerMoreVisible,
                        verticalControls && s.railMore,
                        verticalControls && selecting && s.railMoreVisible,
                      )}
                    >
                      <PhotosSelectionMenu
                        active={selecting}
                        side={verticalControls ? "left" : "bottom"}
                        count={selection.size}
                        allFavorites={allFavorites}
                        onFavorite={favoriteSelection}
                        onAddTo={addToAlbum}
                        onClear={() => {
                          setSelection(new Set());
                          setSelectionAnchor(null);
                        }}
                      />
                    </span>
                  </Toolbar.Group>
                </Toolbar>
                {(((destination !== "collections" || collection) &&
                  (!isLibrary || libraryView === "all")) ||
                  selecting) && (
                  <GlassButton
                    ref={selectButton}
                    data-selection-morph="action"
                    size="md"
                    disabled={!selecting && !visible.length}
                    aria-label={selecting ? "Cancel selection" : "Select"}
                    xstyle={[
                      s.selectControl,
                      s.libraryGlassButton,
                      s.selectionSwitch,
                      (selecting || verticalControls) && s.selectionSwitchActive,
                    ]}
                    onClick={(event) => {
                      if (selecting) {
                        exitSelection(event.detail > 0);
                        return;
                      }
                      setSelecting(true, event.detail > 0);
                      setSelection(new Set());
                      setNavigationMinimized(false);
                      setSelectionAnchor(null);
                      setNotice("");
                    }}
                  >
                    <span
                      aria-hidden="true"
                      data-selection-content=""
                      {...stylex.props(s.selectionSwitchContent)}
                    >
                      <span
                        aria-hidden={selecting}
                        {...stylex.props(s.selectionLabel, selecting && s.selectionLabelHidden)}
                      >
                        {verticalControls ? <Check width={22} height={22} /> : "Select"}
                      </span>
                      <span
                        aria-hidden={!selecting}
                        {...stylex.props(s.selectionCancel, selecting && s.selectionCancelVisible)}
                      >
                        <Xmark width={22} height={22} />
                      </span>
                    </span>
                  </GlassButton>
                )}
                {(tablet || verticalControls) && destination !== "search" && !selecting && (
                  <GlassButton
                    ref={searchTrigger}
                    isIconOnly
                    aria-label="Search"
                    xstyle={[s.headerIconButton, s.libraryGlassButton]}
                    onClick={(event) => openSearch(event.detail > 0)}
                  >
                    <Magnifier width={22} height={22} />
                  </GlassButton>
                )}
              </GlassContainer>
            </div>
            {collection && (
              <Button variant="borderless" onClick={() => openCollection(null)}>
                <ChevronLeft /> All collections
              </Button>
            )}
          </header>
          <Tabs.Panel
            value={libraryView}
            xstyle={[s.viewPanel, stickyLibraryHeader && !verticalControls && s.libraryGridPanel]}
          >
            {destination === "search" && !query.trim() ? (
              <section {...stylex.props(s.searchSuggestions)} aria-label="Search suggestions">
                <h2 {...stylex.props(s.sectionTitle)}>
                  {recentSearches.length ? "Recent searches" : "Search your library"}
                </h2>
                <div {...stylex.props(s.searchSuggestionsRow)}>
                  {(recentSearches.length ? recentSearches : ["City", "Forest", "Portrait"]).map(
                    (term) => (
                      <Button key={term} onClick={() => setQuery(term)}>
                        {term}
                      </Button>
                    ),
                  )}
                </div>
              </section>
            ) : destination === "collections" && !collection ? (
              <Collections
                photos={activeLibrary}
                favorites={favorites}
                edited={edits}
                albums={albums}
                onOpen={openCollection}
              />
            ) : (
              <>
                <div {...stylex.props(s.sectionHeading, isLibrary && s.visuallyHidden)}>
                  <h2 {...stylex.props(s.sectionTitle)}>
                    {destination === "search"
                      ? query
                        ? "Search results"
                        : "All Photos"
                      : (collection ??
                        (isLibrary && libraryView !== "all"
                          ? libraryView === "years"
                            ? "Years"
                            : "Months"
                          : "All Photos"))}
                  </h2>
                  <span {...stylex.props(s.secondary)}>
                    {visible.length} {visible.length === 1 ? "photo" : "photos"}
                  </span>
                </div>
                {isLibrary && libraryView !== "all" && !selecting && visible.length ? (
                  <PhotosLibraryOverview
                    view={libraryView}
                    photos={visible}
                    onViewChange={changeLibraryView}
                  />
                ) : visible.length ? (
                  <section
                    aria-label="Photo library"
                    ref={selectionGrid}
                    {...stylex.props(s.grid, !dense && s.largeGrid, !cropped && s.aspectGrid)}
                  >
                    {visible.map((photo, index) => (
                      <Button
                        key={photo.id}
                        data-selection-id={photo.id}
                        variant="borderless"
                        aria-label={
                          selecting
                            ? `${selection.has(photo.id) ? "Deselect" : "Select"} ${photo.title}`
                            : `Open ${photo.title}`
                        }
                        aria-pressed={selecting ? selection.has(photo.id) : undefined}
                        ref={(node) => {
                          if (node) tiles.current.set(photo.id, node);
                          else tiles.current.delete(photo.id);
                        }}
                        xstyle={[s.tile, !cropped && aspectLayout(index)]}
                        onClick={(event) => {
                          if (selecting) {
                            toggleSelection(photo.id, event.shiftKey);
                            return;
                          }
                          pointerOpened.current = event.detail > 0;
                          setViewerPhotos(visible);
                          setSelected(photo.id);
                        }}
                      >
                        <PhotoImage photo={photo} />
                        {favorites.has(photo.id) && (
                          <HeartFill aria-label="Favorite" {...stylex.props(s.favoriteMark)} />
                        )}
                        {selecting && selection.has(photo.id) && (
                          <span
                            {...stylex.props(
                              s.selectionMark,
                              selection.has(photo.id) && s.selectionChecked,
                            )}
                          >
                            {selection.has(photo.id) && <Check />}
                          </span>
                        )}
                      </Button>
                    ))}
                  </section>
                ) : (
                  <output {...stylex.props(s.empty)}>
                    <Magnifier {...stylex.props(s.emptyIcon)} />
                    <h2>
                      {collection === "Favorites" || (isLibrary && filter === "favorites")
                        ? "No favorites yet"
                        : collection === "Edited" || (isLibrary && filter === "edited")
                          ? "No edited photos"
                          : isLibrary && filter === "videos"
                            ? "No videos"
                            : isLibrary && filter === "screenshots"
                              ? "No screenshots"
                              : isLibrary && filter === "shared"
                                ? "Nothing shared with you"
                                : isLibrary && filter === "mine"
                                  ? "No photos taken by you"
                                  : isLibrary && filter === "unfiled"
                                    ? "All photos are in albums"
                                    : "No photos found"}
                    </h2>
                    <p>
                      {collection === "Favorites" || (isLibrary && filter === "favorites")
                        ? "Open a photo and tap the heart to keep it here."
                        : collection === "Edited" || (isLibrary && filter === "edited")
                          ? "Open a photo and choose Edit to make an adjustment."
                          : isLibrary && filter !== "all"
                            ? "There are no matching items in this sample library."
                            : collection
                              ? "This album has no photos."
                              : destination === "search"
                                ? "Try searching for people, city or coast."
                                : "This sample library is empty. Use Undo to restore removed photos."}
                    </p>
                    {isLibrary && filter !== "all" && (
                      <Button variant="borderless" onClick={() => changeFilter("all")}>
                        Remove Filters
                      </Button>
                    )}
                  </output>
                )}
              </>
            )}
          </Tabs.Panel>
          <div {...stylex.props(s.notifications)}>
            {lastHidden !== null && (
              <output {...stylex.props(s.undoNotice)}>
                Photo hidden from this sample library.
                <Button
                  variant="borderless"
                  onClick={() => {
                    setHiddenPhotos((previous) => {
                      const next = new Set(previous);
                      next.delete(lastHidden);
                      return next;
                    });
                    setLastHidden(null);
                  }}
                >
                  Undo Hide
                </Button>
              </output>
            )}
            {lastDeleted.length > 0 && (
              <output {...stylex.props(s.undoNotice)}>
                {lastDeleted.length === 1
                  ? "Photo removed"
                  : `${lastDeleted.length} photos removed`}{" "}
                from this sample library.
                <Button
                  variant="borderless"
                  onClick={() => {
                    setDeleted((previous) => {
                      const next = new Set(previous);
                      lastDeleted.forEach((id) => next.delete(id));
                      return next;
                    });
                    setLastDeleted([]);
                  }}
                >
                  Undo
                </Button>
              </output>
            )}
            {notice && (
              <output {...stylex.props(s.undoNotice)}>
                {notice}
                <Button
                  variant="borderless"
                  aria-label="Dismiss notification"
                  onClick={() => setNotice("")}
                >
                  Dismiss
                </Button>
              </output>
            )}
          </div>
          <footer {...stylex.props(s.footer, destination === "search" && s.hidden)}>
            <p {...stylex.props(s.libraryCount)}>
              {shownCount} {shownCount === 1 ? "Photo" : "Photos"}
            </p>
            <span>
              Sample library · Photography from <Link href="https://unsplash.com">Unsplash</Link>
            </span>
          </footer>
          <ThemeScope
            glassTint={0.875}
            xstyle={[
              s.navigation,
              (tablet || verticalControls) &&
                !selecting &&
                destination !== "search" &&
                s.tabletNavigationHost,
              verticalControls && s.railBottomContent,
              destination === "search" && s.searchNavigation,
              railSearch && s.railSearchDock,
            ]}
          >
            {destination === "search" ? (
              <div {...stylex.props(s.searchDock)}>
                <SearchField
                  fullWidth
                  ref={searchFieldRef}
                  name="photos-search"
                  aria-label="Search photos"
                  xstyle={s.searchField}
                >
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input
                      ref={focusSearch}
                      aria-label="Search photos"
                      placeholder="Search your library…"
                      value={query}
                      onValueChange={setQuery}
                      onKeyDownCapture={(event) => {
                        if (isComposing(event)) event.stopPropagation();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          closeSearch();
                        }
                        if (event.key === "Enter" && query.trim())
                          setRecentSearches((previous) =>
                            [
                              query.trim(),
                              ...previous.filter((term) => term !== query.trim()),
                            ].slice(0, 6),
                          );
                      }}
                    />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <GlassButton
                  data-search-close=""
                  isIconOnly
                  aria-label="Close search"
                  xstyle={railSearch && s.headerIconButton}
                  onClick={(event) => closeSearch(event.detail > 0)}
                >
                  <Xmark width={22} height={22} />
                </GlassButton>
              </div>
            ) : selecting ? (
              <PhotosSelectionActions
                photos={selectedPhotos}
                onDeselect={(id) => toggleSelection(id)}
                onDelete={deleteSelection}
              />
            ) : (
              <Navigation
                aria-label="Photos navigation"
                xstyle={
                  verticalControls
                    ? s.railNavigation
                    : [tablet && s.tabletNavigation, tablet && s.sidebarCovered]
                }
                {...(verticalControls
                  ? { orientation: "vertical" as const }
                  : {
                      layout: tablet ? ("tablet" as const) : ("phone" as const),
                      autoMinimize:
                        !tablet && isLibrary && libraryView === "all"
                          ? ("up" as const)
                          : (false as const),
                      scrollTarget: main,
                      minimized: !tablet && navigationMinimized,
                      onMinimizedChange: setNavigationMinimized,
                    })}
              >
                <NavigationGroup
                  xstyle={[
                    cover && s.coverNavigationGroup,
                    !verticalControls && !tablet && !navigationMinimized && s.compactDestinations,
                  ]}
                >
                  {tablet && (
                    <Drawer side="start" modal={!dockSidebar} preventEdgeSwipe>
                      <Drawer.Trigger
                        aria-label="Show sidebar"
                        data-photos-sidebar-trigger=""
                        render={
                          verticalControls ? (
                            <Toolbar.Button
                              isIconOnly
                              xstyle={[s.headerIconButton, s.sidebarCoveredControl]}
                            >
                              <LayoutSideContentLeft />
                            </Toolbar.Button>
                          ) : (
                            <TabBar.Button
                              iconOnly
                              icon={<LayoutSideContentLeft />}
                              xstyle={dockSidebar && s.sidebarCoveredControl}
                            />
                          )
                        }
                      />
                      {!dockSidebar && <Drawer.Backdrop xstyle={s.sidebarBackdrop} />}
                      <Drawer.Content xstyle={s.sidebar}>
                        <div {...stylex.props(s.sidebarHeader)}>
                          <Drawer.Title xstyle={s.sidebarTitle}>Photos</Drawer.Title>
                          <Drawer.Close
                            aria-label="Hide sidebar"
                            render={<GlassButton size="md" isIconOnly />}
                          >
                            <LayoutSideContentLeft />
                          </Drawer.Close>
                        </div>
                        <nav aria-label="Photos sidebar" {...stylex.props(s.sidebarNavigation)}>
                          <Drawer.Close
                            render={<Button variant="borderless" xstyle={s.sidebarRow} />}
                            aria-current={isLibrary || undefined}
                            onClick={() => navigate("library")}
                          >
                            <CopyPicture aria-hidden="true" {...stylex.props(s.sidebarIcon)} />
                            Library
                          </Drawer.Close>
                          <Drawer.Close
                            render={<Button variant="borderless" xstyle={s.sidebarRow} />}
                            aria-current={
                              (destination === "collections" && !collection) || undefined
                            }
                            onClick={() => navigate("collections")}
                          >
                            <LayoutCellsLarge aria-hidden="true" {...stylex.props(s.sidebarIcon)} />
                            Collections
                          </Drawer.Close>
                          <h3 {...stylex.props(s.sidebarSectionTitle)}>Pinned</h3>
                          {pinnedCollections.map(({ name, icon: Icon }) => (
                            <Drawer.Close
                              key={name}
                              render={<Button variant="borderless" xstyle={s.sidebarRow} />}
                              aria-current={collection === name || undefined}
                              onClick={() => openSidebarCollection(name)}
                            >
                              <Icon aria-hidden="true" {...stylex.props(s.sidebarIcon)} />
                              {name}
                            </Drawer.Close>
                          ))}
                          <details {...stylex.props(s.sidebarAlbums)}>
                            <summary {...stylex.props(s.sidebarSummary)}>Albums</summary>
                            {[...new Set([...albumNames, ...albums.keys()])]
                              .filter(
                                (name) => !pinnedCollections.some((item) => item.name === name),
                              )
                              .map((name) => (
                                <Drawer.Close
                                  key={name}
                                  render={<Button variant="borderless" xstyle={s.sidebarRow} />}
                                  aria-current={collection === name || undefined}
                                  onClick={() => openSidebarCollection(name)}
                                >
                                  <Folder aria-hidden="true" {...stylex.props(s.sidebarIcon)} />
                                  {name}
                                </Drawer.Close>
                              ))}
                          </details>
                        </nav>
                      </Drawer.Content>
                    </Drawer>
                  )}
                  {(
                    [
                      ["library", "Library", CopyPicture],
                      ["collections", "Collections", LayoutCellsLarge],
                    ] as const
                  ).map(([value, label, Icon]) => {
                    const props = {
                      href: `#${value}`,
                      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
                        event.preventDefault();
                        navigate(value);
                      },
                    };
                    return verticalControls ? (
                      <Toolbar.Link
                        key={value}
                        {...props}
                        aria-label={label}
                        aria-current={destination === value ? "page" : undefined}
                        xstyle={[s.railLink, cover && s.coverRailLink]}
                      >
                        <Icon width={22} height={22} aria-hidden="true" />
                      </Toolbar.Link>
                    ) : (
                      <TabBar.Link
                        key={value}
                        {...props}
                        xstyle={dockSidebar && s.sidebarCoveredControl}
                        isCurrent={destination === value}
                        icon={<Icon />}
                      >
                        {label}
                      </TabBar.Link>
                    );
                  })}
                </NavigationGroup>
                {!tablet && !verticalControls && (
                  <TabBar.Group separate>
                    <TabBar.Button
                      ref={searchTrigger}
                      onClick={(event) => openSearch(event.detail > 0)}
                      icon={<Magnifier />}
                    >
                      Search
                    </TabBar.Button>
                  </TabBar.Group>
                )}
              </Navigation>
            )}
            {!selecting && isLibrary && (tablet || verticalControls || navigationMinimized) && (
              <div
                {...stylex.props(
                  s.timelineControls,
                  (tablet || verticalControls) && s.tabletTimelineControls,
                  verticalControls && s.railTimeline,
                )}
              >
                <Tabs.ListContainer xstyle={s.timelineContainer}>
                  <Tabs.List
                    aria-label="Library view"
                    xstyle={[s.timelineList, !dark && s.timelineLightSelection]}
                  >
                    {(
                      [
                        ["years", "Years"],
                        ["months", "Months"],
                        ["all", "All"],
                      ] as const
                    ).map(([value, label]) => (
                      <Tabs.Tab
                        key={value}
                        value={value}
                        onClick={() => {
                          if (libraryView === value) changeLibraryView(value);
                        }}
                      >
                        {label}
                      </Tabs.Tab>
                    ))}
                    <Tabs.Indicator>
                      {!dark && <span aria-hidden="true" {...stylex.props(s.timelineLiftRim)} />}
                    </Tabs.Indicator>
                  </Tabs.List>
                </Tabs.ListContainer>
              </div>
            )}
          </ThemeScope>
          <PhotosViewer
            model={model}
            animateTransitions={!controlled}
            selected={selected}
            photos={viewerPhotos.map((photo) =>
              displayLibrary.find((item) => item.id === photo.id)!,
            )}
            originals={sources}
            tiles={tiles}
            pointerOpened={pointerOpened}
            favorites={favorites}
            onClose={finishClose}
            onChange={setSelected}
            onFavorite={toggleFavorite}
            onDelete={removePhoto}
            onHide={hidePhoto}
            onDuplicate={duplicatePhoto}
            onAlbum={(id, name) => {
              setAlbums((previous) =>
                new Map(previous).set(name, new Set([...(previous.get(name) ?? []), id])),
              );
              setNotice(`Added photo to ${name}`);
            }}
            edits={edits}
            onEdit={saveEdit}
            captions={captions}
            onCaption={(id, value) => setCaptions((previous) => new Map(previous).set(id, value))}
          />
        </main>
      </Tabs>
    </ThemeScope>
  );
}
