package expo.modules.appblocker

import android.content.Context
import android.content.pm.PackageManager
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import android.util.Log

class AppBlockerView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val recyclerView: RecyclerView
  private val packageManager = context.packageManager
  private val installedPackages = mutableListOf<PackageInfo>()
  private val adapter = PackageListAdapter()

  init {
    // Create a vertical LinearLayout to hold the RecyclerView
    val layout = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    // Create and configure the RecyclerView
    recyclerView = RecyclerView(context).apply {
      layoutManager = LinearLayoutManager(context)
      adapter = this@AppBlockerView.adapter
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    layout.addView(recyclerView)
    addView(layout)

    // Load installed packages
    loadInstalledPackages()
  }

  private fun loadInstalledPackages() {
    val packages = packageManager.getInstalledPackages(PackageManager.GET_META_DATA)

    installedPackages.clear()
    installedPackages.addAll(packages.map { PackageInfo(it.packageName, false) })
    adapter.notifyDataSetChanged()
  }

  private inner class PackageListAdapter : RecyclerView.Adapter<PackageListAdapter.ViewHolder>() {
    inner class ViewHolder(val itemLayout: LinearLayout) : RecyclerView.ViewHolder(itemLayout) {
      val packageName: TextView
      val checkBox: CheckBox

      init {
        // Create the checkbox
        checkBox = CheckBox(itemLayout.context).apply {
          layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
          )
        }

        // Create the text view for package name
        packageName = TextView(itemLayout.context).apply {
          layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
          ).apply {
            marginStart = 16
          }
          textSize = 16f
        }

        // Add views to the layout
        itemLayout.addView(checkBox)
        itemLayout.addView(packageName)
      }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
      val itemLayout = LinearLayout(parent.context).apply {
        orientation = LinearLayout.HORIZONTAL
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.WRAP_CONTENT
        )
        setPadding(16, 16, 16, 16)
      }
      return ViewHolder(itemLayout)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
      val packageInfo = installedPackages[position]
      holder.packageName.text = packageInfo.packageName
      holder.checkBox.isChecked = packageInfo.isBlocked

      holder.checkBox.setOnCheckedChangeListener { _, isChecked ->
        packageInfo.isBlocked = isChecked
        // Here you would implement the actual blocking logic
        // when a package is checked/unchecked
      }
    }

    override fun getItemCount() = installedPackages.size
  }

  private data class PackageInfo(
    val packageName: String,
    var isBlocked: Boolean
  )
}
