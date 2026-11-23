// Fictional catalog: artists, albums and track titles are invented sample labels.
// Artwork reuses the Unsplash sample photographs documented beside the Photos demo.
// Page colors are sampled from the square artwork crops, so they are ready before images decode.
const albumSamples = [
  [
    "Low Tide Letters",
    "Marina Vale",
    "Indie Pop",
    2026,
    10,
    "#2f7f9a",
    "#bcaaa4",
    [
      ["Postcards from the Shore", 214],
      ["Salt in the Seams", 198],
      ["Undertow", 241],
      ["Glass Bottle Summer", 187],
      ["Harbor Lights", 226],
      ["Low Tide Letters", 259],
    ],
  ],
  [
    "Cobalt Ridge",
    "Altitude Club",
    "Electronic",
    2026,
    1,
    "#3d5a8c",
    "#69839c",
    [
      ["Switchback", 232],
      ["Thin Air", 205],
      ["Summit Pulse", 248],
      ["Cold Front", 219],
      ["Basecamp", 191],
      ["Long Exposure", 274],
      ["Descent", 236],
    ],
  ],
  [
    "Night Transit",
    "Kei Moreno",
    "R&B",
    2025,
    18,
    "#5b3f8f",
    "#82a4c5",
    [
      ["Last Train Home", 221],
      ["Neon Platform", 203],
      ["Overpass", 238],
      ["Window Seat", 195],
      ["Midnight Loop", 247],
    ],
  ],
  [
    "Under Canopy",
    "Fern & Folly",
    "Folk",
    2025,
    9,
    "#3f6f3a",
    "#383c25",
    [
      ["Moss and Mortar", 184],
      ["Lantern Trail", 207],
      ["Green Hour", 229],
      ["River Stones", 176],
      ["Sapling", 212],
      ["Under Canopy", 251],
    ],
  ],
  [
    "Stargazer Suite",
    "Ilse Okafor",
    "Ambient",
    2026,
    11,
    "#273a6b",
    "#56729c",
    [
      ["Prelude to Dusk", 268],
      ["Constellation I", 312],
      ["Constellation II", 295],
      ["Satellite Drift", 287],
      ["Aurora Hum", 334],
    ],
  ],
  [
    "Wet Pavement",
    "Juno Park",
    "Lo-fi",
    2025,
    17,
    "#5f6e7f",
    "#5b7588",
    [
      ["Umbrella Weather", 152],
      ["Corner Café", 167],
      ["Puddle Reflections", 143],
      ["Streetcar", 171],
      ["Fogged Glass", 158],
      ["Afterglow Avenue", 176],
    ],
  ],
  [
    "Red Room Sessions",
    "Ada Quist",
    "Soul",
    2026,
    12,
    "#9d2f2f",
    "#8d3d3f",
    [
      ["Velvet Hours", 233],
      ["Call It Even", 209],
      ["Gold Teeth Smile", 224],
      ["Slow Burn", 262],
      ["Keep the Porch Light On", 245],
    ],
  ],
  [
    "Open Water",
    "Tidewalkers",
    "Rock",
    2024,
    5,
    "#1f5d84",
    "#5c818d",
    [
      ["Riptide", 201],
      ["Hull and Anchor", 228],
      ["Mainsail", 214],
      ["Swell", 197],
      ["Lighthouse Keeper", 253],
      ["Open Water", 279],
    ],
  ],
  [
    "Market Day",
    "Los Verdes Collective",
    "Latin",
    2026,
    20,
    "#4f7f2a",
    "#7c8543",
    [
      ["Mercado al Sol", 206],
      ["Limón y Sal", 188],
      ["Domingo", 231],
      ["Cumbia del Puesto", 215],
      ["Canasta", 199],
    ],
  ],
  [
    "Morning Mist",
    "Halden Quartet",
    "Classical",
    2024,
    4,
    "#6f7d6a",
    "#666d6f",
    [
      ["I. Daybreak", 318],
      ["II. Valley Fog", 284],
      ["III. Allegretto", 247],
      ["IV. Clearing", 356],
    ],
  ],
] as const;

export type MusicTrack = {
  id: number;
  albumId: number;
  number: number;
  title: string;
  duration: number;
  audio: string;
};
export type MusicAlbum = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  year: number;
  artwork: string;
  accent: string;
  artworkColor: string;
  tracks: MusicTrack[];
};

export const albums: MusicAlbum[] = albumSamples.map(
  ([title, artist, genre, year, file, accent, artworkColor, tracks], albumId) => ({
    id: albumId,
    title,
    artist,
    genre,
    year,
    artwork: `/assets/demo/photos/${file}.jpg`,
    accent,
    artworkColor,
    tracks: tracks.map(([trackTitle, catalogDuration], index) => ({
      id: albumId * 100 + index,
      albumId,
      number: index + 1,
      title: trackTitle,
      duration: Math.round(24 + catalogDuration / 14),
      audio: `/assets/demo/music/${albumId * 100 + index}.mp3`,
    })),
  }),
);
export const tracks = albums.flatMap((album) => album.tracks);
const trackIndex = new Map(tracks.map((track) => [track.id, track]));
export const trackById = (id: number) => trackIndex.get(id)!;
export const albumOf = (track: MusicTrack) => albums[track.albumId]!;

export type MusicPlaylist = {
  id: string;
  title: string;
  description: string;
  colors: readonly [string, string];
  trackIds: number[];
};
// Mixes interleave albums so each one opens with varied artwork.
export const playlists: MusicPlaylist[] = [
  {
    id: "focus",
    title: "Focus Flow",
    description: "Steady, wordless music for deep work.",
    colors: ["#1d4e89", "#56b4d3"],
    trackIds: [401, 101, 500, 903, 104, 402, 502, 105],
  },
  {
    id: "drive",
    title: "Evening Drive",
    description: "City lights, open roads and a little soul.",
    colors: ["#5b2a86", "#f26b5b"],
    trackIds: [200, 600, 700, 203, 603, 702, 204, 705],
  },
  {
    id: "weekend",
    title: "Weekend Brunch",
    description: "Bright, easygoing songs for a slow morning.",
    colors: ["#e07a1f", "#f7c548"],
    trackIds: [0, 800, 300, 3, 802, 302, 804, 5],
  },
  {
    id: "chill",
    title: "Rainy Day Chill",
    description: "Lo-fi textures and soft acoustic warmth.",
    colors: ["#38615e", "#9fc5a8"],
    trackIds: [500, 305, 503, 301, 501, 304, 505, 403],
  },
];
export const playlistById = (id: string) => playlists.find((item) => item.id === id)!;

export type MusicStation = {
  id: string;
  title: string;
  subtitle: string;
  colors: readonly [string, string];
  albumIds: number[];
};
export const stations: MusicStation[] = [
  {
    id: "harbor",
    title: "Harbor FM",
    subtitle: "Indie and coastal rock",
    colors: ["#0d3b66", "#3fa7d6"],
    albumIds: [0, 7],
  },
  {
    id: "signal",
    title: "Late Signal",
    subtitle: "After-hours R&B and soul",
    colors: ["#3a0ca3", "#f72585"],
    albumIds: [2, 6],
  },
  {
    id: "daybreak",
    title: "Daybreak Radio",
    subtitle: "Calm acoustic and ambient",
    colors: ["#2d6a4f", "#b7e4c7"],
    albumIds: [3, 4, 9],
  },
  {
    id: "pulse",
    title: "Pulse",
    subtitle: "Electronic, lo-fi and beats",
    colors: ["#22223b", "#4ea8de"],
    albumIds: [1, 5],
  },
];
export function stationTracks(station: MusicStation) {
  // Alternate the station's albums for a radio-style rotation.
  const lists = station.albumIds.map((id) => albums[id]!.tracks);
  const length = Math.max(...lists.map((list) => list.length));
  return Array.from({ length }, (_, index) =>
    lists.flatMap((list) => (list[index] ? [list[index].id] : [])),
  ).flat();
}

export function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
