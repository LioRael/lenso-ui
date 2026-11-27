<script lang="ts">
  import { attachGlass } from "@lenso/glass";
  import { glassIsOpaque, observeGlassPreferences } from "@lenso/glass/fusion";
  import { liquidMaterialStyles as liquid, materialStyles } from "@lenso/tokens/materials";
  import { attributes } from "../styled.js";

  let {
    profile = "glass-small",
    liveGeometry = false,
  }: {
    profile?: "glass-small" | "glass-medium";
    liveGeometry?: boolean;
  } = $props();

  function paint(layer: HTMLSpanElement) {
    const surface = layer.parentElement;
    let detach: (() => void) | undefined;
    const sync = () => {
      const opaque = glassIsOpaque(layer);
      surface?.toggleAttribute("data-material-opaque", opaque);
      if (opaque) {
        detach?.();
        detach = undefined;
      } else {
        detach ??= attachGlass(layer, { profileKey: profile, liveGeometry });
      }
    };
    const stop = observeGlassPreferences(layer, sync);
    sync();
    return () => {
      stop();
      detach?.();
      surface?.removeAttribute("data-material-opaque");
    };
  }
</script>

<span
  aria-hidden="true"
  data-material-lens=""
  {...attributes(materialStyles.layer, liquid.small, profile === "glass-medium" && liquid.medium)}
  {@attach paint}
></span>
