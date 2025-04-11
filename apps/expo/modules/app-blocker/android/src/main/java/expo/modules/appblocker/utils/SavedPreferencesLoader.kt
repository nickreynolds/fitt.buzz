package expo.modules.appblocker.utils

import android.content.Context
// import com.google.gson.Gson
// import com.google.gson.reflect.TypeToken

class SavedPreferencesLoader(private val context: Context) {

    fun loadBlockedApps(): Set<String> {
        val sharedPreferences =
            context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
        return sharedPreferences.getStringSet("blocked_apps", emptySet()) ?: emptySet()
    }

    fun saveBlockedApps(pinnedApps: Set<String>) {
        val sharedPreferences =
            context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
        sharedPreferences.edit().putStringSet("blocked_apps", pinnedApps).apply()
    }

    fun setBlocked(blocked: Boolean) {
        val sharedPreferences =
            context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
        sharedPreferences.edit().putBoolean("blocked", blocked).apply()
    }

    fun getBlocked(): Boolean {
        val sharedPreferences =
            context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
        return sharedPreferences.getBoolean("blocked", false)
    }
}