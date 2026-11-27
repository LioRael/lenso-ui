import { attachGlass } from "@lenso/glass";
import { glassIsOpaque, observeGlassPreferences, type FusionGroup } from "@lenso/glass/fusion";
import { bindPress, bindPressHighlight } from "@lenso/glass/motion";
import { createOptionalContext } from "../context.js";
import { createAttachmentKey, type Attachment } from "svelte/attachments";

export const [getFusion, setFusion] = createOptionalContext<() => FusionGroup | undefined>();
const glassKey = createAttachmentKey();

export function glassAttachment(options: { elastic: () => boolean; profile?: string }) {
  const fusion = getFusion();
  const attach: Attachment<HTMLElement> = (element) => {
    $effect(() => {
      const group = fusion?.();
      const stopGlass = attachGlass(element, { profileKey: options.profile ?? "glass-small" });
      const stopHighlight = bindPressHighlight(element);
      if (!group || element.hasAttribute("popover") || element.tagName === "DIALOG") {
        return () => {
          stopHighlight();
          stopGlass();
        };
      }

      function sync() {
        if (glassIsOpaque(element)) group?.members.delete(element);
        else group?.members.add(element);
        group?.update();
      }

      const stopPreferences = observeGlassPreferences(element, sync);
      sync();
      return () => {
        stopPreferences();
        group.members.delete(element);
        group.update();
        stopHighlight();
        stopGlass();
      };
    });
    $effect(() => {
      if (options.elastic()) return bindPress(element);
    });
  };
  return { [glassKey]: attach };
}
