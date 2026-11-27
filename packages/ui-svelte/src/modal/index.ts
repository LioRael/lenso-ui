import ModalTrigger from "./modal-trigger.svelte";
import ModalBackdrop from "./modal-backdrop.svelte";
import ModalContent from "./modal-content.svelte";
import ModalTitle from "./modal-title.svelte";
import ModalDescription from "./modal-description.svelte";
import ModalClose from "./modal-close.svelte";
import ModalHeader from "./modal-header.svelte";
import ModalBody from "./modal-body.svelte";
import ModalFooter from "./modal-footer.svelte";
import ModalIcon from "./modal-icon.svelte";
import ModalRoot from "./modal-root.svelte";

export {
  ModalTrigger,
  ModalBackdrop,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalIcon,
  ModalRoot,
};
export const Modal: typeof ModalRoot & {
  Root: typeof ModalRoot;
  Trigger: typeof ModalTrigger;
  Backdrop: typeof ModalBackdrop;
  Content: typeof ModalContent;
  Title: typeof ModalTitle;
  Description: typeof ModalDescription;
  Close: typeof ModalClose;
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  Icon: typeof ModalIcon;
} = Object.assign(ModalRoot, {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Backdrop: ModalBackdrop,
  Content: ModalContent,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Icon: ModalIcon,
});
