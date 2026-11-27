import SheetTrigger from "./sheet-trigger.svelte";
import SheetBackdrop from "./sheet-backdrop.svelte";
import SheetContent from "./sheet-content.svelte";
import SheetTitle from "./sheet-title.svelte";
import SheetDescription from "./sheet-description.svelte";
import SheetClose from "./sheet-close.svelte";
import SheetHeader from "./sheet-header.svelte";
import SheetBody from "./sheet-body.svelte";
import SheetFooter from "./sheet-footer.svelte";
import SheetHandle from "./sheet-handle.svelte";
import SheetSurface from "./sheet-surface.svelte";
import SheetRoot from "./sheet-root.svelte";

export {
  SheetTrigger,
  SheetBackdrop,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetHandle,
  SheetSurface,
  SheetRoot,
};
export const Sheet: typeof SheetRoot & {
  Root: typeof SheetRoot;
  Trigger: typeof SheetTrigger;
  Backdrop: typeof SheetBackdrop;
  Content: typeof SheetContent;
  Title: typeof SheetTitle;
  Description: typeof SheetDescription;
  Close: typeof SheetClose;
  Header: typeof SheetHeader;
  Body: typeof SheetBody;
  Footer: typeof SheetFooter;
  Handle: typeof SheetHandle;
  Surface: typeof SheetSurface;
} = Object.assign(SheetRoot, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Backdrop: SheetBackdrop,
  Content: SheetContent,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
  Header: SheetHeader,
  Body: SheetBody,
  Footer: SheetFooter,
  Handle: SheetHandle,
  Surface: SheetSurface,
});
