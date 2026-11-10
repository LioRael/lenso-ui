import { requireNativeModule } from "expo";

export interface GlassCapabilities {
  systemGlass: boolean;
  refractiveGlass: boolean;
  blurredGlass: boolean;
  /** Fixed limit of the custom Android fusion renderer; zero where unavailable. */
  maxFusionMembers: number;
}
export const glassCapabilities = requireNativeModule<GlassCapabilities>("LensoGlass");
