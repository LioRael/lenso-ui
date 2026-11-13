import { useState } from "react";
import { createRoot } from "react-dom/client";
import * as Drawer from "@ui-sdk/react/drawer";
const snaps = [0.25, 0.525, 1];
function Probe() {
  const [point, setPoint] = useState<Drawer.SnapPoint>(0.25);
  const [controlled, setControlled] = useState(true);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={controlled}
          onChange={(e) => setControlled(e.target.checked)}
        />
        Controlled snap points
      </label>
      <Drawer.Drawer
        key={String(controlled)}
        snapPoints={snaps}
        {...(controlled ? { snapPoint: point } : { defaultSnapPoint: 0.25 })}
        onSnapPointChange={setPoint}
      >
        <Drawer.DrawerTrigger>Native controlled sheet</Drawer.DrawerTrigger>
        <Drawer.DrawerBackdrop style={{ background: "rgb(0 0 0 / .2)" }} />
        <Drawer.DrawerContent
          style={{ height: "calc(100dvh - 62px)", width: "100%", background: "white" }}
        >
          <Drawer.DrawerHandle aria-label="Native resize" style={{ height: 40, width: "100%" }}>
            Drag here
          </Drawer.DrawerHandle>
          <Drawer.DrawerTitle>Native controlled sheet</Drawer.DrawerTitle>
          <output>Snap: {point}</output>
          <Drawer.DrawerClose>Close native sheet</Drawer.DrawerClose>
        </Drawer.DrawerContent>
      </Drawer.Drawer>
    </>
  );
}
createRoot(document.getElementById("fixture")!).render(<Probe />);
