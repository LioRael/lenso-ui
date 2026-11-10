package expo.modules.lensoglass

import android.os.Build
import android.graphics.Color
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.types.ColorCompat

class LensoGlassModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LensoGlass")
    Constants(
      "systemGlass" to false,
      "refractiveGlass" to (Build.VERSION.SDK_INT >= 33),
      "blurredGlass" to (Build.VERSION.SDK_INT >= 31),
      "maxFusionMembers" to (if (Build.VERSION.SDK_INT >= 33) 8 else 0)
    )
    View(BackdropView::class) {
      Prop("sourceID") { view: BackdropView, value: String -> view.sourceID = value }
    }
    View(GlassGroupView::class) {
      Prop("sourceID") { view: GlassGroupView, value: String -> view.sourceID = value }
      Prop("spacing") { view: GlassGroupView, value: Float -> view.spacing = value.coerceAtLeast(0f) }
    }
    View(GlassView::class) {
      Prop("sourceID") { view: GlassView, value: String -> view.sourceID = value }
      Prop("cornerRadius") { view: GlassView, value: Float -> view.cornerRadius = value.coerceAtLeast(0f) }
      Prop("clear") { view: GlassView, value: Boolean -> view.clear = value }
      Prop("dark") { view: GlassView, value: Boolean -> view.dark = value }
      Prop("tint") { view: GlassView, value: Color? -> view.tint = value?.let { ColorCompat.toArgb(it) } }
      Prop("held") { view: GlassView, value: Boolean -> view.held = value }
      Prop("prominent") { view: GlassView, value: Boolean -> view.prominent = value }
      Prop("lens") { view: GlassView, value: Boolean -> view.lens = value }
      Prop("zoom") { view: GlassView, value: Float -> view.zoom = value.coerceAtLeast(1f) }
      Prop("split") { view: GlassView, value: Float -> view.split = value.coerceIn(0f, 1f) }
    }
  }
}
