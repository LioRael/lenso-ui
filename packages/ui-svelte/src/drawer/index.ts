import DrawerLayout from "./drawer-layout.svelte";
export { DrawerLayout };
import DrawerTrigger from "./drawer-trigger.svelte";
import DrawerBackdrop from "./drawer-backdrop.svelte";
import DrawerContent from "./drawer-content.svelte";
import DrawerTitle from "./drawer-title.svelte";
import DrawerDescription from "./drawer-description.svelte";
import DrawerClose from "./drawer-close.svelte";
import DrawerHeader from "./drawer-header.svelte";
import DrawerBody from "./drawer-body.svelte";
import DrawerFooter from "./drawer-footer.svelte";
import DrawerHandle from "./drawer-handle.svelte";
import DrawerRoot from "./drawer-root.svelte";

export {
  DrawerTrigger,
  DrawerBackdrop,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerHandle,
  DrawerRoot,
};
export const Drawer: typeof DrawerRoot & {
  Layout: typeof DrawerLayout;
  Root: typeof DrawerRoot;
  Trigger: typeof DrawerTrigger;
  Backdrop: typeof DrawerBackdrop;
  Content: typeof DrawerContent;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
  Close: typeof DrawerClose;
  Header: typeof DrawerHeader;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
  Handle: typeof DrawerHandle;
} = Object.assign(DrawerRoot, {
  Layout: DrawerLayout,
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Backdrop: DrawerBackdrop,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Handle: DrawerHandle,
});
