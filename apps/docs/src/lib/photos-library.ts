const samples = [
  [12, "Portrait in red", "People", 1200, 1800],
  [17, "Rain on the avenue", "City", 1200, 1501],
  [0, "Quiet hills", "Landscape", 1600, 1067],
  [13, "By the window", "People", 1200, 1800],
  [2, "By the lake", "Mountains", 1600, 1067],
  [21, "At the table", "Food", 1200, 800],
  [14, "Afternoon portrait", "People", 1200, 1800],
  [1, "Mountain light", "Mountains", 1600, 1067],
  [22, "A quiet room", "Interiors", 1200, 900],
  [3, "Into the forest", "Forest", 1600, 1066],
  [18, "City after dark", "City", 1200, 728],
  [15, "In the shade", "People", 1200, 1800],
  [20, "Market greens", "Food", 1200, 800],
  [5, "Ocean blue", "Coast", 1600, 1067],
  [16, "Garden portrait", "People", 1200, 1800],
  [6, "An afternoon outside", "Mountains", 1600, 1067],
  [19, "Above the city", "City", 1200, 738],
  [7, "Forest walk", "Forest", 1600, 1104],
  [23, "The corner shop", "Interiors", 1200, 801],
  [8, "The long way home", "Landscape", 1600, 1063],
  [10, "At the beach", "Coast", 1600, 1064],
  [4, "Morning mist", "Landscape", 1600, 953],
  [9, "Green canopy", "Forest", 1600, 1067],
  [11, "Under the stars", "Mountains", 1600, 1068],
] as const;

export type DemoPhoto = {
  id: number;
  title: (typeof samples)[number][1];
  collection: (typeof samples)[number][2];
  width: number;
  height: number;
  src: string;
  thumb: string;
};
export const library: DemoPhoto[] = samples.map(([file, title, collection, width, height], id) => ({
  id,
  title,
  collection,
  width,
  height,
  src: `/assets/demo/photos/${file}.jpg`,
  thumb: `/assets/demo/photos/${file}.jpg`,
}));
export const albumNames = [
  "People",
  "City",
  "Food",
  "Interiors",
  "Mountains",
  "Coast",
  "Forest",
  "Landscape",
] as const;
