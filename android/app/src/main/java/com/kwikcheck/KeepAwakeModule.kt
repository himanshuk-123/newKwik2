package com.kwikcheck

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KeepAwakeModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "KeepAwake"

    @ReactMethod
    fun enable() {
        val activity: Activity = getCurrentActivity() ?: return

        activity.runOnUiThread {
            activity.window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }
    }

    @ReactMethod
    fun disable() {
        val activity: Activity = getCurrentActivity() ?: return

        activity.runOnUiThread {
            activity.window.clearFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }
    }
}