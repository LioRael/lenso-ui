/**
 * Data from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 */
export interface SelectionItem {
  id: string;
  name: string;
  email?: string;
  country?: string;
  avatarUrl?: string;
  fallback?: string;
  group?: string;
  description?: string;
  shortcut?: string;
  danger?: boolean;
}
const entries = (values: readonly (readonly [string, string])[]): SelectionItem[] =>
  values.map(([id, name]) => ({ id, name }));
export const states = entries([
  ["florida", "Florida"],
  ["delaware", "Delaware"],
  ["california", "California"],
  ["texas", "Texas"],
  ["new-york", "New York"],
  ["washington", "Washington"],
]);
export const controlledStates = entries([
  ["california", "California"],
  ["texas", "Texas"],
  ["florida", "Florida"],
  ["new-york", "New York"],
  ["illinois", "Illinois"],
  ["pennsylvania", "Pennsylvania"],
]);
export const countries = entries([
  ["argentina", "Argentina"],
  ["venezuela", "Venezuela"],
  ["japan", "Japan"],
  ["france", "France"],
  ["italy", "Italy"],
  ["spain", "Spain"],
  ["thailand", "Thailand"],
  ["new-zealand", "New Zealand"],
  ["iceland", "Iceland"],
]);
export const groupedCountries: SelectionItem[] = [
  ...entries([
    ["usa", "United States"],
    ["canada", "Canada"],
    ["mexico", "Mexico"],
  ]).map((item) => ({ ...item, group: "North America" })),
  ...entries([
    ["uk", "United Kingdom"],
    ["france", "France"],
    ["germany", "Germany"],
    ["spain", "Spain"],
    ["italy", "Italy"],
  ]).map((item) => ({ ...item, group: "Europe" })),
  ...entries([
    ["japan", "Japan"],
    ["china", "China"],
    ["india", "India"],
    ["south-korea", "South Korea"],
  ]).map((item) => ({ ...item, group: "Asia" })),
];
export const requiredCountries = groupedCountries.slice(0, 6).map(({ id, name }) => ({ id, name }));
export const animals = entries([
  ["aardvark", "Aardvark"],
  ["cat", "Cat"],
  ["dog", "Dog"],
  ["kangaroo", "Kangaroo"],
  ["panda", "Panda"],
  ["snake", "Snake"],
]);
export const autocompleteAnimals = entries([
  ["cat", "Cat"],
  ["dog", "Dog"],
  ["elephant", "Elephant"],
  ["lion", "Lion"],
  ["tiger", "Tiger"],
  ["giraffe", "Giraffe"],
]);
export const disabledAnimals = entries([
  ["dog", "Dog"],
  ["cat", "Cat"],
  ["bird", "Bird"],
  ["kangaroo", "Kangaroo"],
  ["elephant", "Elephant"],
  ["tiger", "Tiger"],
]);
export const controlledAnimals = entries([
  ["cat", "Cat"],
  ["dog", "Dog"],
  ["bird", "Bird"],
  ["fish", "Fish"],
  ["hamster", "Hamster"],
]);
export const options = entries([
  ["option1", "Option 1"],
  ["option2", "Option 2"],
  ["option3", "Option 3"],
  ["option4", "Option 4"],
]);
export const users: SelectionItem[] = [
  {
    id: "1",
    name: "Bob",
    email: "bob@heroui.com",
    fallback: "B",
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
  },
  {
    id: "2",
    name: "Fred",
    email: "fred@heroui.com",
    fallback: "F",
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg",
  },
  {
    id: "3",
    name: "Martha",
    email: "martha@heroui.com",
    fallback: "M",
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
  },
  {
    id: "4",
    name: "John",
    email: "john@heroui.com",
    fallback: "J",
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
  },
  {
    id: "5",
    name: "Jane",
    email: "jane@heroui.com",
    fallback: "J",
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
  },
];
export const cities: SelectionItem[] = [
  ["New York", "USA"],
  ["Los Angeles", "USA"],
  ["Chicago", "USA"],
  ["London", "UK"],
  ["Paris", "France"],
  ["Tokyo", "Japan"],
  ["Sydney", "Australia"],
  ["Toronto", "Canada"],
  ["Berlin", "Germany"],
  ["Madrid", "Spain"],
].map(([name, country]) => ({ id: name!, name: name!, country }));
export const tags = entries([
  ["react", "React"],
  ["typescript", "TypeScript"],
  ["javascript", "JavaScript"],
  ["nodejs", "Node.js"],
  ["python", "Python"],
  ["vue", "Vue"],
  ["angular", "Angular"],
  ["nextjs", "Next.js"],
]);
export const recipients: SelectionItem[] = [
  { id: "alice@example.com", name: "Alice Johnson", email: "alice@example.com" },
  { id: "bob@example.com", name: "Bob Smith", email: "bob@example.com" },
  { id: "charlie@example.com", name: "Charlie Brown", email: "charlie@example.com" },
  { id: "diana@example.com", name: "Diana Prince", email: "diana@example.com" },
  { id: "eve@example.com", name: "Eve Wilson", email: "eve@example.com" },
];
export const fileActions: SelectionItem[] = [
  {
    id: "new-file",
    name: "New file",
    description: "Create a new file",
    shortcut: "N",
    group: "Actions",
  },
  {
    id: "edit-file",
    name: "Edit file",
    description: "Make changes",
    shortcut: "E",
    group: "Actions",
  },
  {
    id: "delete-file",
    name: "Delete file",
    description: "Move to trash",
    shortcut: "D",
    group: "Danger zone",
    danger: true,
  },
];
export function generateUsers(n: number): SelectionItem[] {
  const firstNames = [
    "Emma",
    "Liam",
    "Olivia",
    "Noah",
    "Ava",
    "James",
    "Sophia",
    "Oliver",
    "Isabella",
    "Lucas",
    "Mia",
    "Ethan",
    "Charlotte",
    "Mason",
    "Amelia",
    "Logan",
    "Harper",
    "Alexander",
    "Ella",
    "Benjamin",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Clark",
    "Lewis",
    "Robinson",
    "Walker",
  ];
  return Array.from({ length: n }, (_, i) => {
    const firstName = firstNames[i % firstNames.length]!;
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]!;
    return {
      id: String(i + 1),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme.com`,
    };
  });
}
