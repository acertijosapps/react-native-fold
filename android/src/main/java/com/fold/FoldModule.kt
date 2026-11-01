package com.fold

import androidx.core.content.ContextCompat
import androidx.core.util.Consumer
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.Executor

class FoldModule(reactContext: ReactApplicationContext) :
  NativeFoldSpec(reactContext), LifecycleEventListener {

  private data class FoldData(
    val isPresent: Boolean,
    val isSeparating: Boolean,
    val isHalfOpened: Boolean,
    val orientation: String,
    val x: Double,
    val y: Double,
    val width: Double,
    val height: Double
  )

  private val windowInfoTracker = WindowInfoTracker.getOrCreate(reactContext)

  private val tracker = WindowInfoTrackerCallbackAdapter(windowInfoTracker)

  private val executor: Executor = ContextCompat.getMainExecutor(reactContext)

  @Volatile private var lastData = FoldData(false, false, false, "horizontal", 0.0, 0.0, 0.0, 0.0)

  @Volatile private var hasLayoutInfo = false

  private val consumer = Consumer<WindowLayoutInfo> { layoutInfo ->
    hasLayoutInfo = true
    lastData = buildData(layoutInfo)
    emitOnFoldChange(toWritableMap(lastData))
  }

  init {
    reactContext.addLifecycleEventListener(this)
  }

  override fun getFoldState(): WritableMap {
    if (!hasLayoutInfo) {
      readCurrentLayoutInfo()?.let { lastData = buildData(it) }
    }
    return toWritableMap(lastData)
  }

  private fun readCurrentLayoutInfo(): WindowLayoutInfo? {
    val activity = reactApplicationContext.currentActivity ?: return null
    return runCatching { windowInfoTracker.getCurrentWindowLayoutInfo(activity) }.getOrNull()
  }

  override fun onHostResume() {
    val activity = reactApplicationContext.currentActivity ?: return
    tracker.removeWindowLayoutInfoListener(consumer)
    tracker.addWindowLayoutInfoListener(activity, executor, consumer)
  }

  override fun onHostPause() {}

  override fun onHostDestroy() {
    tracker.removeWindowLayoutInfoListener(consumer)
  }

  override fun invalidate() {
    tracker.removeWindowLayoutInfoListener(consumer)
    reactApplicationContext.removeLifecycleEventListener(this)
    super.invalidate()
  }

  private fun buildData(layoutInfo: WindowLayoutInfo): FoldData {
    val feature =
      layoutInfo.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
        ?: return FoldData(false, false, false, "horizontal", 0.0, 0.0, 0.0, 0.0)

    val density = reactApplicationContext.resources.displayMetrics.density
    val bounds = feature.bounds
    val orientation =
      if (feature.orientation == FoldingFeature.Orientation.VERTICAL) "vertical"
      else "horizontal"

    return FoldData(
      isPresent = true,
      isSeparating = feature.isSeparating,
      isHalfOpened = feature.state == FoldingFeature.State.HALF_OPENED,
      orientation = orientation,
      x = (bounds.left / density).toDouble(),
      y = (bounds.top / density).toDouble(),
      width = (bounds.width() / density).toDouble(),
      height = (bounds.height() / density).toDouble()
    )
  }

  private fun toWritableMap(data: FoldData): WritableMap {
    val map = Arguments.createMap()
    map.putBoolean("isPresent", data.isPresent)
    map.putBoolean("isSeparating", data.isSeparating)
    map.putBoolean("isHalfOpened", data.isHalfOpened)
    map.putString("orientation", data.orientation)
    map.putDouble("x", data.x)
    map.putDouble("y", data.y)
    map.putDouble("width", data.width)
    map.putDouble("height", data.height)
    return map
  }

  companion object {
    const val NAME = NativeFoldSpec.NAME
  }
}
