// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
export interface User {
  key: number;
  id: number;
  name: string;
  image_url: string;
  role: string;
  status: "Active" | "Inactive" | "On Leave";
  email: string;
}
const avatarRoot = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/";
export const users: User[] = [
  {
    key: 4586932,
    id: 4586932,
    name: "Kate Moore",
    role: "Chief Executive Officer",
    status: "Active",
    email: "kate@acme.com",
    image_url: avatarRoot + "red.jpg",
  },
  {
    key: 5273849,
    id: 5273849,
    name: "John Smith",
    role: "Chief Technology Officer",
    status: "Active",
    email: "john@acme.com",
    image_url: avatarRoot + "green.jpg",
  },
  {
    key: 7492836,
    id: 7492836,
    name: "Sara Johnson",
    role: "Chief Marketing Officer",
    status: "On Leave",
    email: "sara@acme.com",
    image_url: avatarRoot + "blue.jpg",
  },
  {
    key: 8293746,
    id: 8293746,
    name: "Michael Brown",
    role: "Chief Financial Officer",
    status: "Active",
    email: "michael@acme.com",
    image_url: avatarRoot + "purple.jpg",
  },
  {
    key: 1234567,
    id: 1234567,
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
    email: "emily@acme.com",
    image_url: avatarRoot + "orange.jpg",
  },
  {
    key: 9876543,
    id: 9876543,
    name: "Davis Wilson",
    role: "Lead Designer",
    status: "Active",
    email: "davis@acme.com",
    image_url: avatarRoot + "black.jpg",
  },
  {
    key: 3456789,
    id: 3456789,
    name: "Olivia Martinez",
    role: "Frontend Engineer",
    status: "Active",
    email: "olivia@acme.com",
    image_url: avatarRoot + "red.jpg",
  },
  {
    key: 4567890,
    id: 4567890,
    name: "James Taylor",
    role: "Backend Engineer",
    status: "Active",
    email: "james@acme.com",
    image_url: avatarRoot + "green.jpg",
  },
  {
    key: 5678901,
    id: 5678901,
    name: "Sophia Anderson",
    role: "QA Engineer",
    status: "On Leave",
    email: "sophia@acme.com",
    image_url: avatarRoot + "blue.jpg",
  },
  {
    key: 6789012,
    id: 6789012,
    name: "Liam Thomas",
    role: "DevOps Engineer",
    status: "Active",
    email: "liam@acme.com",
    image_url: avatarRoot + "purple.jpg",
  },
  {
    key: 7890123,
    id: 7890123,
    name: "Ava Jackson",
    role: "Data Analyst",
    status: "Inactive",
    email: "ava@acme.com",
    image_url: avatarRoot + "orange.jpg",
  },
  {
    key: 8901234,
    id: 8901234,
    name: "Noah White",
    role: "Security Engineer",
    status: "Active",
    email: "noah@acme.com",
    image_url: avatarRoot + "black.jpg",
  },
];
export const columns = [
  { key: "name", name: "Name" },
  { key: "role", name: "Role" },
  { key: "status", name: "Status" },
  { key: "email", name: "Email" },
] as const;
export const statusColorMap = {
  Active: "success",
  Inactive: "danger",
  "On Leave": "warning",
} as const;
export function generateUsers(n: number): User[] {
  const roles = [
    "Software Engineer",
    "Senior Engineer",
    "Staff Engineer",
    "Product Manager",
    "Designer",
    "Data Analyst",
    "QA Engineer",
    "DevOps Engineer",
    "Marketing Manager",
    "Sales Representative",
  ];
  const statuses: User["status"][] = ["Active", "Inactive", "On Leave"];
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
    const first = firstNames[i % firstNames.length]!;
    const last = lastNames[Math.floor(i / firstNames.length) % lastNames.length]!;
    return {
      key: i + 1,
      id: i + 1,
      name: `${first} ${last}`,
      image_url: avatarRoot + "red.jpg",
      role: roles[i % roles.length]!,
      status: statuses[i % statuses.length]!,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@acme.com`,
    };
  });
}
export interface FileRow {
  key: string;
  children: FileRow[];
  date: string;
  title: string;
  type: string;
}
export const files: FileRow[] = [
  {
    key: "1",
    title: "Documents",
    type: "Directory",
    date: "10/20/2025",
    children: [
      {
        key: "2",
        title: "Project",
        type: "Directory",
        date: "8/2/2025",
        children: [
          { key: "3", title: "Weekly Report", type: "File", date: "7/10/2025", children: [] },
          { key: "4", title: "Budget", type: "File", date: "8/20/2025", children: [] },
        ],
      },
    ],
  },
  {
    key: "5",
    title: "Photos",
    type: "Directory",
    date: "2/3/2026",
    children: [
      { key: "6", title: "Image 1", type: "File", date: "1/23/2026", children: [] },
      { key: "7", title: "Image 2", type: "File", date: "2/3/2026", children: [] },
    ],
  },
];
export const team = [
  { key: "fred", textValue: "Fred", avatar: avatarRoot + "blue.jpg", fallback: "F" },
  { key: "michael", textValue: "Michael", avatar: avatarRoot + "green.jpg", fallback: "M" },
  { key: "jane", textValue: "Jane", avatar: avatarRoot + "purple.jpg", fallback: "J" },
  { key: "alice", textValue: "Alice", avatar: avatarRoot + "red.jpg", fallback: "A" },
  { key: "bob", textValue: "Bob", avatar: avatarRoot + "orange.jpg", fallback: "B" },
  { key: "charlie", textValue: "Charlie", avatar: avatarRoot + "black.jpg", fallback: "C" },
];
