package com.fold

import com.facebook.react.bridge.ReactApplicationContext

class FoldModule(reactContext: ReactApplicationContext) :
  NativeFoldSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeFoldSpec.NAME
  }
}
