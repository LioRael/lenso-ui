import SwitchRoot from "./switch-root.svelte";
import SwitchContent from "./switch-content.svelte";
import SwitchControl from "./switch-control.svelte";
import SwitchTrack from "./switch-track.svelte";
import SwitchThumb from "./switch-thumb.svelte";
import SwitchIcon from "./switch-icon.svelte";

export { SwitchRoot, SwitchContent, SwitchControl, SwitchTrack, SwitchThumb, SwitchIcon };
export const Switch: typeof SwitchRoot & {
  Root: typeof SwitchRoot;
  Content: typeof SwitchContent;
  Control: typeof SwitchControl;
  Track: typeof SwitchTrack;
  Thumb: typeof SwitchThumb;
  Icon: typeof SwitchIcon;
} = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  Content: SwitchContent,
  Control: SwitchControl,
  Track: SwitchTrack,
  Thumb: SwitchThumb,
  Icon: SwitchIcon,
});
