// Transform mapping adapted from onlymoein/liquidglass a2d26488 (MIT).
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
package expo.modules.lensoglass

import android.graphics.Matrix
import android.view.View
import java.util.WeakHashMap

internal object Backdrops {
  private val sources = WeakHashMap<BackdropView, Unit>()
  private val toScreen = Matrix()
  private val backdropToScreen = Matrix()

  fun register(source: BackdropView) {
    if (source.sourceID.isEmpty()) return
    check(sources.keys.none {
      it !== source && it.rootView === source.rootView && it.sourceID == source.sourceID
    }) { "Lenso Backdrop sourceID must be unique within a native root: ${source.sourceID}" }
    sources[source] = Unit
  }

  fun unregister(source: BackdropView) { sources.remove(source) }

  fun behind(view: View, sourceID: String): BackdropView? {
    if (sourceID.isEmpty()) return null
    return sources.keys.firstOrNull { source ->
      source.sourceID == sourceID && source.rootView === view.rootView &&
        source.isAttachedToWindow && source.visibility == View.VISIBLE &&
        source.width > 0 && source.height > 0 && !contains(source, view)
    }
  }

  private fun contains(source: View, view: View): Boolean {
    var current: android.view.ViewParent? = view.parent
    while (current != null) {
      if (current === source) return true
      current = current.parent
    }
    return source === view
  }

  fun mapping(backdrop: View, view: View, out: Matrix): Boolean {
    toScreen.reset()
    view.transformMatrixToGlobal(toScreen)
    backdropToScreen.reset()
    backdrop.transformMatrixToGlobal(backdropToScreen)
    if (!toScreen.invert(out)) return false
    out.preConcat(backdropToScreen)
    return true
  }
}
