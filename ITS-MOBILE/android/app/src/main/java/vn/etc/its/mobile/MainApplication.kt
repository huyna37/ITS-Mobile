package vn.etc.its.mobile

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import java.io.File
import vn.etc.its.mobile.ota.OtaPackage
import vn.etc.its.mobile.media.MediaPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    val otaBundle = File(applicationContext.filesDir, "ota/index.android.bundle")
    val bundlePath = if (otaBundle.exists()) otaBundle.absolutePath else null

    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(OtaPackage())
          add(MediaPackage())
        },
      jsBundleFilePath = bundlePath,
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
