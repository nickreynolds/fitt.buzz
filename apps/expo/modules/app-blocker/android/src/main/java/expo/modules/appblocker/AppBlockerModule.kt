package expo.modules.appblocker

import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.AppContext

import android.content.Context
import android.content.SharedPreferences
import expo.modules.appblocker.utils.SavedPreferencesLoader

class AppBlockerModule : Module() {
  private val blockedPackages = mutableSetOf<String>()

  
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AppBlocker')` in JavaScript.
    Name("AppBlocker")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("getBlockedPackages") {
      getSharedPreferences().loadBlockedApps()
      // getPreferences().getStringSet("blockedPackages", mutableSetOf())?.toList() ?: emptyList<String>()
    }

    Function("setBlockedPackages") { packages: List<String> ->
      // getPreferences().edit().putStringSet("blockedPackages", packages.toSet()).apply()
      getSharedPreferences().saveBlockedApps(packages.toSet())
    }

    Function("block") {
      // getPreferences().edit().putBoolean("blocked", true).apply()
      getSharedPreferences().setBlocked(true)
    }

    Function("unblock") {
      // getPreferences().edit().putBoolean("blocked", false).apply()
      getSharedPreferences().setBlocked(false)
    }
      

    Function("getInstalledPackages") {
      val packageManager = appContext.reactContext?.packageManager
      packageManager?.getInstalledPackages(PackageManager.GET_META_DATA)?.map { it.packageName }?.toList() ?: emptyList<String>()
    }

    Function("hello") {
      val packageManager = appContext.reactContext?.packageManager
      val installedPackages = packageManager?.getInstalledPackages(PackageManager.GET_META_DATA)
        ?.map { it.packageName }
        ?.joinToString("\n")
        ?: "No packages found"
      
      installedPackages
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(AppBlockerView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: AppBlockerView, prop: String ->
        println(prop)
      }
    }
  }

  private val context
  get() = requireNotNull(appContext.reactContext)

  private fun getSharedPreferences(): SavedPreferencesLoader {
    return SavedPreferencesLoader(context)
  }
}
