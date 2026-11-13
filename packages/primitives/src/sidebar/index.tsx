"use client";
import { createParts, type Parts } from "@ui-sdk/react/primitive";
import { sidebar } from "./sidebar.js";

const tags = {
  root: "div",
  trigger: "button",
  rail: "button",
  panel: "aside",
  item: "a",
  header: "div",
  content: "div",
  footer: "div",
  menu: "ul",
  "menu-item": "li",
  submenu: "ul",
  inset: "main",
} as const;
type SidebarParts = Parts<typeof sidebar, typeof tags>;
export const Sidebar: SidebarParts = createParts(sidebar, tags);
export const SidebarRoot: SidebarParts["Root"] = Sidebar.Root;
export const SidebarTrigger: SidebarParts["Trigger"] = Sidebar.Trigger;
export const SidebarRail: SidebarParts["Rail"] = Sidebar.Rail;
export const SidebarPanel: SidebarParts["Panel"] = Sidebar.Panel;
export const SidebarItem: SidebarParts["Item"] = Sidebar.Item;
export const SidebarHeader: SidebarParts["Header"] = Sidebar.Header;
export const SidebarContent: SidebarParts["Content"] = Sidebar.Content;
export const SidebarFooter: SidebarParts["Footer"] = Sidebar.Footer;
export const SidebarMenu: SidebarParts["Menu"] = Sidebar.Menu;
export const SidebarMenuItem: SidebarParts["MenuItem"] = Sidebar.MenuItem;
export const SidebarSubmenu: SidebarParts["Submenu"] = Sidebar.Submenu;
export const SidebarInset: SidebarParts["Inset"] = Sidebar.Inset;
export { sidebar, createSidebarController } from "./sidebar.js";
export type {
  SidebarOptions,
  SidebarController,
  SidebarChangeReason,
  SidebarSide,
  SidebarState,
  SidebarItemState,
} from "./sidebar.js";
