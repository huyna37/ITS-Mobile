package vn.etc.its.mobile.ota

import android.content.Context
import android.os.Handler
import android.os.Looper
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.BufferedInputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipInputStream

class OtaUpdateModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "OtaUpdateModule"
    }

    private val prefs = reactContext.getSharedPreferences("its_ota_prefs", Context.MODE_PRIVATE)

    @ReactMethod
    fun getBundleInfo(promise: Promise) {
        try {
            val otaBundle = File(reactContext.filesDir, "ota/index.android.bundle")
            val hasOta = otaBundle.exists()
            val version = prefs.getString("bundle_version", "1.0.0-base") ?: "1.0.0-base"
            val lastUpdated = prefs.getLong("bundle_updated_at", 0L)

            val map = Arguments.createMap().apply {
                putBoolean("isOtaActive", hasOta)
                putString("bundleVersion", version)
                putDouble("lastUpdatedAt", lastUpdated.toDouble())
                if (hasOta) {
                    putDouble("bundleSize", otaBundle.length().toDouble())
                } else {
                    putDouble("bundleSize", 0.0)
                }
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERR_OTA_INFO", e.message, e)
        }
    }

    @ReactMethod
    fun downloadAndApplyBundle(downloadUrl: String, targetVersion: String, promise: Promise) {
        Thread {
            try {
                val otaDir = File(reactContext.filesDir, "ota")
                if (!otaDir.exists()) {
                    otaDir.mkdirs()
                }

                val tempFile = File(reactContext.cacheDir, "temp_ota_bundle.download")
                if (tempFile.exists()) {
                    tempFile.delete()
                }

                val url = URL(downloadUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 15000
                connection.readTimeout = 30000
                connection.connect()

                if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                    promise.reject(
                        "ERR_DOWNLOAD_FAILED",
                        "Server returned HTTP ${connection.responseCode} ${connection.responseMessage}"
                    )
                    return@Thread
                }

                val totalBytes = connection.contentLength
                var downloadedBytes = 0

                val input = BufferedInputStream(connection.inputStream)
                val output = FileOutputStream(tempFile)
                val data = ByteArray(4096)
                var count: Int
                var lastReportedPercent = -1

                while (input.read(data).also { count = it } != -1) {
                    downloadedBytes += count
                    output.write(data, 0, count)

                    if (totalBytes > 0) {
                        val percent = ((downloadedBytes.toDouble() / totalBytes.toDouble()) * 100).toInt()
                        if (percent != lastReportedPercent) {
                            lastReportedPercent = percent
                            sendDownloadProgress(percent, downloadedBytes, totalBytes)
                        }
                    }
                }

                output.flush()
                output.close()
                input.close()
                connection.disconnect()

                // Check if zip archive or raw bundle
                val isZip = isZipFile(tempFile)
                val targetBundleFile = File(otaDir, "index.android.bundle")

                if (isZip) {
                    unzipToDir(tempFile, otaDir)
                } else {
                    tempFile.copyTo(targetBundleFile, overwrite = true)
                }

                tempFile.delete()

                // Save metadata to prefs
                prefs.edit().apply {
                    putString("bundle_version", targetVersion)
                    putLong("bundle_updated_at", System.currentTimeMillis())
                    apply()
                }

                val result = Arguments.createMap().apply {
                    putBoolean("success", true)
                    putString("version", targetVersion)
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("ERR_OTA_DOWNLOAD", e.message, e)
            }
        }.start()
    }

    @ReactMethod
    fun reloadApp(promise: Promise) {
        Handler(Looper.getMainLooper()).post {
            try {
                val app = reactContext.currentActivity?.application as? ReactApplication
                    ?: reactContext.applicationContext as? ReactApplication

                val reactHost = app?.reactHost
                if (reactHost != null) {
                    reactHost.reload("OTA Update Activated")
                    promise.resolve(true)
                } else {
                    promise.reject("ERR_NO_REACT_HOST", "ReactHost is not available to reload.")
                }
            } catch (e: Exception) {
                promise.reject("ERR_RELOAD_FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun resetToFactory(promise: Promise) {
        try {
            val otaDir = File(reactContext.filesDir, "ota")
            if (otaDir.exists()) {
                otaDir.deleteRecursively()
            }
            prefs.edit().clear().apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_RESET", e.message, e)
        }
    }

    private fun sendDownloadProgress(percent: Int, downloaded: Int, total: Int) {
        val params = Arguments.createMap().apply {
            putInt("percent", percent)
            putInt("downloadedBytes", downloaded)
            putInt("totalBytes", total)
        }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("OtaDownloadProgress", params)
    }

    private fun isZipFile(file: File): Boolean {
        if (!file.exists() || file.length() < 4) return false
        val bytes = ByteArray(4)
        FileInputStream(file).use { it.read(bytes) }
        // PK.. magic header: 0x50 0x4B 0x03 0x04
        return bytes[0] == 0x50.toByte() && bytes[1] == 0x4B.toByte()
    }

    private fun unzipToDir(zipFile: File, destDir: File) {
        ZipInputStream(FileInputStream(zipFile)).use { zis ->
            var entry = zis.nextEntry
            while (entry != null) {
                val newFile = File(destDir, entry.name)
                // Security check to avoid Zip Path Traversal
                if (!newFile.canonicalPath.startsWith(destDir.canonicalPath)) {
                    entry = zis.nextEntry
                    continue
                }

                if (entry.isDirectory) {
                    newFile.mkdirs()
                } else {
                    newFile.parentFile?.mkdirs()
                    FileOutputStream(newFile).use { fos ->
                        zis.copyTo(fos)
                    }
                }
                zis.closeEntry()
                entry = zis.nextEntry
            }
        }
    }
}
