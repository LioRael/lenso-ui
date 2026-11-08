"use client";

import { Avatar, AvatarGroup } from "@lenso/ui";
const users = [
  {
    id: 1,
    image: "/assets/demo/avatars/blue.svg",
    name: "张明",
  },
  {
    id: 2,
    image: "/assets/demo/avatars/green.svg",
    name: "李华",
  },
  {
    id: 3,
    image: "/assets/demo/avatars/purple.svg",
    name: "王芳",
  },
  {
    id: 4,
    image: "/assets/demo/avatars/orange.svg",
    name: "刘洋",
  },
  {
    id: 5,
    image: "/assets/demo/avatars/red.svg",
    name: "陈静",
  },
];
function initialsFromName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return parts.map((n) => n[0]).join("");
  }
  return name.slice(0, 2);
}
export function Max() {
  return (
    <AvatarGroup max={3}>
      {users.map((user) => (
        <Avatar key={user.id}>
          <Avatar.Image alt={`${user.name} 的头像`} src={user.image} />
          <Avatar.Fallback>{initialsFromName(user.name)}</Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
