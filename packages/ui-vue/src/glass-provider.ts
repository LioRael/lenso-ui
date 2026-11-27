import { materialStyles } from "@lenso/tokens/materials";
import { defineComponent, h, inject, provide, shallowRef, type InjectionKey } from "vue";
import { ThemeScope } from "./providers.js";
import type { ComponentProps } from "./parts.js";

const Preferences: InjectionKey<{ readonly tint: number; setTint: (value: number) => void }> =
  Symbol("GlassPreferences");

function normalize(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5;
}

export const GlassProvider = defineComponent({
  name: "LensoGlassProvider",
  props: { tint: Number, defaultTint: { type: Number, default: 0.5 } },
  emits: {
    "update:tint": (_value: number) => true,
    tintChange: (_value: number) => true,
  },
  setup(props, { slots, emit }) {
    const local = shallowRef(normalize(props.defaultTint));
    const tint = () => normalize(props.tint ?? local.value);
    provide(Preferences, {
      get tint() {
        return tint();
      },
      setTint(value) {
        const next = normalize(value);
        if (props.tint === undefined) local.value = next;
        emit("tintChange", next);
        emit("update:tint", next);
      },
    });
    return () => h(ThemeScope, { glassTint: tint(), xstyle: materialStyles.provider }, slots);
  },
});
export type GlassProviderProps = ComponentProps<typeof GlassProvider>;

export function useGlassPreferences() {
  const value = inject(Preferences, undefined);
  if (!value) throw new Error("useGlassPreferences requires GlassProvider");
  return value;
}
