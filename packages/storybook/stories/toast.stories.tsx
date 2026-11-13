import type { Meta } from "@storybook/react-vite";
import { Button, Modal, Toast, createToaster } from "@lenso/ui";
import { useState } from "react";
import { Default as DefaultExample } from "../../../apps/docs/src/demos/en/toast/default";
import { Placements as PlacementsExample } from "../../../apps/docs/src/demos/en/toast/placements";
import { Expanded as ExpandedExample } from "../../../apps/docs/src/demos/en/toast/expanded";
import { Simple } from "../../../apps/docs/src/demos/en/toast/simple";
import { PromiseDemo as PromiseExample } from "../../../apps/docs/src/demos/en/toast/promise";
import { CustomIndicator as IndicatorExample } from "../../../apps/docs/src/demos/en/toast/custom-indicator";
import { Callbacks } from "../../../apps/docs/src/demos/en/toast/callbacks";
import { CustomToast as CustomExample } from "../../../apps/docs/src/demos/en/toast/custom-toast";
import { CustomQueue as QueueExample } from "../../../apps/docs/src/demos/en/toast/custom-queue";
export default {
  title: "Components/Feedback/Toast",
  parameters: { layout: "centered" },
} satisfies Meta;
export const Default = { render: () => <DefaultExample /> };
export const Placements = { render: () => <PlacementsExample /> };
export const Expanded = { render: () => <ExpandedExample /> };
export const SimpleToast = { render: () => <Simple /> };
export const PromiseToast = { render: () => <PromiseExample /> };
export const CustomIndicator = { render: () => <IndicatorExample /> };
export const WithCallbacks = { render: () => <Callbacks /> };
export const CustomToast = { render: () => <CustomExample /> };
export const CustomQueue = { render: () => <QueueExample /> };
function LoadingExample() {
  const [toaster] = useState(createToaster);
  return (
    <>
      <Button
        onClick={() => {
          const id = toaster.loading("Saving changes");
          setTimeout(
            () => toaster.update(id, { title: "Changes saved", type: "success", duration: 4000 }),
            1000,
          );
        }}
      >
        Save changes
      </Button>
      <Toast.Region toaster={toaster} />
    </>
  );
}
export const LoadingState = { render: () => <LoadingExample /> };
function ModalExample() {
  const [toaster] = useState(createToaster);
  return (
    <>
      <Modal>
        <Modal.Trigger>Open task</Modal.Trigger>
        <Modal.Backdrop />
        <Modal.Content>
          <Modal.Title>Save task</Modal.Title>
          <Button onClick={() => toaster.success("Task saved")}>Save task</Button>
          <Modal.Close>Done</Modal.Close>
        </Modal.Content>
      </Modal>
      <Toast.Region toaster={toaster} />
    </>
  );
}
export const ToastInModal = { render: () => <ModalExample /> };
