package expo.modules.appblocker.services

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import android.util.Log
import expo.modules.kotlin.AppContext
// import android.content.Context
import android.content.SharedPreferences
// import nethical.digipaws.utils.SavedPreferencesLoader
import expo.modules.appblocker.utils.SavedPreferencesLoader

open class BaseBlockingService : AccessibilityService() {
    val savedPreferencesLoader: SavedPreferencesLoader by lazy {
        SavedPreferencesLoader(this)
    }

    var lastBackPressTimeStamp: Long =
        SystemClock.uptimeMillis() // prevents repetitive global actions

    override fun onServiceConnected() {
        super.onServiceConnected();
        val something = "whatever";
        Log.d("BaseBlockingService", "connected $something")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        Log.d("BaseBlockingService", "onAccessibilityEvent: $event");

        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {                    
            val blocked = savedPreferencesLoader.getBlocked()
            Log.d("BaseBlockingService", "blocked: $blocked")
            if (blocked) {
                val blockedPackages = savedPreferencesLoader.loadBlockedApps()
                Log.d("BaseBlockingService", "blockedPackages: $blockedPackages")
                if (blockedPackages.contains(event?.packageName)) {
                    Log.d("BaseBlockingService", "blocked package: $event?.packageName");
                    pressHome();
                }
            }
        }
    }

    override fun onInterrupt() {
        val something = "whatever";
        Log.d("BaseBlockingService", "interrupted $something")
    }

    private fun isDelayOver(): Boolean {
        return isDelayOver(1000)
    }

    fun isDelayOver(delay: Int): Boolean {
        val currentTime = SystemClock.uptimeMillis().toFloat()
        return currentTime - lastBackPressTimeStamp > delay
    }

    fun isDelayOver(lastTimestamp: Long, delay: Int): Boolean {
        val currentTime = SystemClock.uptimeMillis().toFloat()
        return currentTime - lastTimestamp > delay
    }

    fun pressHome() {
        if (isDelayOver()) {
            performGlobalAction(GLOBAL_ACTION_HOME)
            lastBackPressTimeStamp = SystemClock.uptimeMillis()
        }
    }

    fun pressBack() {
        if (isDelayOver()) {
            performGlobalAction(GLOBAL_ACTION_BACK)
            lastBackPressTimeStamp = SystemClock.uptimeMillis()
        }
    }

}