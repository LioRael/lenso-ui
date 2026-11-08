"use client";

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
  Heart,
  HeartFill,
  LayoutCellsLarge,
  Xmark,
  Magnifier,
  Sliders,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { albumNames, library, type DemoPhoto } from "../lib/photos-library";
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

type Destination = "library" | "collections" | "search";

const tabletQuery = "(min-width: 768px)";
function subscribeTablet(onChange: () => void) {
  const query = matchMedia(tabletQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isTabletViewport = () => matchMedia(tabletQuery).matches;
const isServerTablet = () => false;

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

export function PhotosDemo() {
  const tablet = useSyncExternalStore(subscribeTablet, isTabletViewport, isServerTablet);
  const [destination, setDestination] = useState<Destination>("library");
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const { fieldRef: searchFieldRef, capture: captureSearch } = usePhotosSearchTransition(
    destination === "search",
    searchTrigger,
  );
  const focusSearch = useCallback((input: HTMLInputElement | null) => input?.focus(), []);
  const searchOrigin = useRef({
    destination: "library" as Destination,
    collection: null as string | null,
    top: 0,
    minimized: false,
  });
  const searchRestore = useRef<typeof searchOrigin.current | null>(null);
  const [collection, setCollection] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(new Set([2, 8, 14]));
  const [deleted, setDeleted] = useState(new Set<number>());
  const [sources, setSources] = useState(library);
  const nextPhotoId = useRef(library.length);
  const [hiddenPhotos, setHiddenPhotos] = useState(new Set<number>());
  const [lastHidden, setLastHidden] = useState<number | null>(null);
  const [lastDeleted, setLastDeleted] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [viewerPhotos, setViewerPhotos] = useState(library);
  const [libraryView, setLibraryView] = useState<LibraryView>("all");
  const [navigationMinimized, setNavigationMinimized] = useState(false);
  const restoreLibraryPosition = useRef(true);
  const [dense, setDense] = useState(true);
  const [dark, setDark] = useState(false);
  const [selecting, setSelectingState] = useState(false);
  const { headerRef: selectionHeaderRef, capture: captureSelection } =
    usePhotosSelectionTransition(selecting);
  function setSelecting(value: boolean, animate = false) {
    captureSelection(animate);
    setSelectingState(value);
  }
  const [selection, setSelection] = useState(new Set<number>());
  const [edits, setEdits] = useState(new Map<number, PhotoEdit>());
  const [captions, setCaptions] = useState(new Map<number, string>());
  const [filter, setFilter] = useState<PhotoFilter>("all");
  const [cropped, setCropped] = useState(true);
  const [albums, setAlbums] = useState(new Map<string, Set<number>>());
  const [notice, setNotice] = useState("");
  const selectionAnchor = useRef<number | null>(null);
  const selectButton = useRef<HTMLButtonElement>(null);
  const editUrls = useRef(new Map<number, string>());
  useEffect(() => {
    const urls = editUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  const main = useRef<HTMLElement>(null);
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
  const finishClose = useCallback(() => setSelected(null), []);
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
    active: selecting,
    ids: visible.map((photo) => photo.id),
    selected: selection,
    onChange: setSelection,
    viewport: main,
  });
  function saveEdit(id: number, edit: PhotoEdit | undefined) {
    const previous = editUrls.current.get(id);
    if (previous) URL.revokeObjectURL(previous);
    if (edit) editUrls.current.set(id, edit.src);
    else editUrls.current.delete(id);
    setEdits((previous) => {
      const next = new Map(previous);
      if (edit) next.set(id, edit);
      else next.delete(id);
      return next;
    });
  }
  function openCollection(name: string | null) {
    setSelecting(false);
    setSelection(new Set());
    selectionAnchor.current = null;
    setNavigationMinimized(false);
    main.current?.scrollTo({ top: 0, behavior: "instant" });
    setCollection(name);
  }
  function changeLibraryView(next: LibraryView) {
    if (next === libraryView) {
      const element = main.current;
      if (element) element.scrollTop = next === "all" ? element.scrollHeight : 0;
    } else restoreLibraryPosition.current = true;
    setLibraryView(next);
    setNavigationMinimized(true);
  }
  function navigate(next: Destination) {
    restoreLibraryPosition.current = next === "library";
    setNavigationMinimized(false);
    main.current?.scrollTo({ top: 0, behavior: "instant" });
    if (next === "library" && main.current) main.current.scrollTop = main.current.scrollHeight;
    selectionAnchor.current = null;
    setDestination(next);
    setCollection(null);
    setSelecting(false);
    setSelection(new Set());
  }
  function openSearch(animate = false) {
    captureSearch(true, animate);
    searchOrigin.current = {
      destination,
      collection,
      top: main.current?.scrollTop ?? 0,
      minimized: navigationMinimized,
    };
    setQuery("");
    navigate("search");
  }
  function closeSearch(animate = false) {
    captureSearch(false, animate);
    const origin = searchOrigin.current;
    restoreLibraryPosition.current = false;
    setDestination(origin.destination);
    setCollection(origin.collection);
    setNavigationMinimized(origin.minimized);
    setQuery("");
    searchRestore.current = origin;
  }
  useLayoutEffect(() => {
    const origin = searchRestore.current;
    if (destination === "search" || !origin) return;
    searchRestore.current = null;
    if (main.current) main.current.scrollTop = origin.top;
    searchTrigger.current?.focus({ preventScroll: true });
  }, [destination]);

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
  async function duplicatePhoto(id: number) {
    const source = sources.find((photo) => photo.id === id);
    if (!source) return;
    const copyId = nextPhotoId.current++;
    const edit = edits.get(id);
    try {
      const copyEdit = edit
        ? { ...edit, src: URL.createObjectURL(await (await fetch(edit.src)).blob()) }
        : undefined;
      const copy = { ...source, id: copyId };
      setSources((previous) => [...previous, copy]);
      setViewerPhotos((previous) => [...previous, copy]);
      if (copyEdit) saveEdit(copyId, copyEdit);
      if (favorites.has(id)) setFavorites((previous) => new Set(previous).add(copyId));
      if (captions.has(id))
        setCaptions((previous) => new Map(previous).set(copyId, captions.get(id)!));
      setNotice("Photo duplicated in this sample library");
    } catch {
      setNotice("Couldn't duplicate this photo. Try again.");
    }
  }
  function exitSelection(animate = false) {
    setSelecting(false, animate);
    setSelection(new Set());
    selectionAnchor.current = null;
    requestAnimationFrame(() => {
      const target =
        selectButton.current && !selectButton.current.disabled
          ? selectButton.current
          : main.current?.querySelector<HTMLButtonElement>('[aria-label="Sort and filter"]');
      target?.focus({ preventScroll: true });
    });
  }
  function toggleSelection(id: number, range = false) {
    const start = visible.findIndex((p) => p.id === selectionAnchor.current);
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
    selectionAnchor.current = id;
  }
  function changeFilter(value: PhotoFilter) {
    setNotice("");
    setFilter(value);
    setSelection(new Set());
    selectionAnchor.current = null;
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
  return (
    <ThemeScope theme={dark ? "dark" : "light"} xstyle={s.root}>
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
              isLibrary && libraryView === "all" && visible.length > 0 && s.libraryHeader,
            )}
          >
            {isLibrary && libraryView === "all" && visible.length > 0 && (
              <ScrollEdge variant="soft" edge="top" xstyle={s.headerEdge} />
            )}
            <div {...stylex.props(s.headingRow)}>
              <div>
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
                xstyle={[s.actions, destination === "search" && s.hidden]}
              >
                <Toolbar aria-label={selecting ? "Selection options" : "Library options"}>
                  <Toolbar.Group
                    data-selection-morph="filter"
                    xstyle={[s.headerFilterGroup, selecting && s.headerFilterExpanded]}
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
                      {...stylex.props(s.headerMore, selecting && s.headerMoreVisible)}
                    >
                      <PhotosSelectionMenu
                        active={selecting}
                        count={selection.size}
                        allFavorites={allFavorites}
                        onFavorite={favoriteSelection}
                        onAddTo={addToAlbum}
                        onClear={() => {
                          setSelection(new Set());
                          selectionAnchor.current = null;
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
                      s.selectionSwitch,
                      selecting && s.selectionSwitchActive,
                    ]}
                    onClick={(event) => {
                      if (selecting) {
                        exitSelection(event.detail > 0);
                        return;
                      }
                      setSelecting(true, event.detail > 0);
                      setSelection(new Set());
                      setNavigationMinimized(false);
                      selectionAnchor.current = null;
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
                        Select
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
                {tablet && destination !== "search" && !selecting && (
                  <GlassButton
                    ref={searchTrigger}
                    isIconOnly
                    aria-label="Search"
                    xstyle={s.headerIconButton}
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
          <Tabs.Panel value={libraryView} xstyle={s.viewPanel}>
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
          <div
            {...stylex.props(
              s.navigation,
              tablet && !selecting && destination !== "search" && s.tabletNavigationHost,
              destination === "search" && s.searchNavigation,
            )}
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
              <TabBar
                aria-label="Photos navigation"
                layout={tablet ? "tablet" : "phone"}
                xstyle={tablet && s.tabletNavigation}
                autoMinimize={!tablet && isLibrary && libraryView === "all" ? "up" : false}
                scrollTarget={main}
                minimized={!tablet && navigationMinimized}
                onMinimizedChange={setNavigationMinimized}
              >
                <TabBar.Group xstyle={!tablet && !navigationMinimized && s.compactDestinations}>
                  <TabBar.Link
                    href="#library"
                    isCurrent={destination === "library"}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate("library");
                    }}
                    icon={<CopyPicture />}
                  >
                    Library
                  </TabBar.Link>
                  <TabBar.Link
                    href="#collections"
                    isCurrent={destination === "collections"}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate("collections");
                    }}
                    icon={<LayoutCellsLarge />}
                  >
                    Collections
                  </TabBar.Link>
                </TabBar.Group>
                {!tablet && (
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
              </TabBar>
            )}
            {!selecting && isLibrary && (tablet || navigationMinimized) && (
              <div {...stylex.props(s.timelineControls, tablet && s.tabletTimelineControls)}>
                <Tabs.ListContainer xstyle={s.timelineContainer}>
                  <Tabs.List
                    aria-label="Library view"
                    xstyle={[s.timelineList, tablet && s.tabletTimelineList]}
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
                    <Tabs.Indicator />
                  </Tabs.List>
                </Tabs.ListContainer>
              </div>
            )}
          </div>
          <PhotosViewer
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
