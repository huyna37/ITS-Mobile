package vn.etc.its.mobile.media

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import android.provider.OpenableColumns
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream

class MediaPickerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val MODULE_NAME = "MediaPickerModule"
        private const val REQUEST_CAPTURE_PHOTO = 5101
        private const val REQUEST_CAPTURE_VIDEO = 5102
        private const val REQUEST_PICK_MEDIA = 5103
    }

    private var activePromise: Promise? = null
    private var pendingPhotoFile: File? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun capturePhoto(promise: Promise) {
        val currentActivity = reactContext.currentActivity
        if (currentActivity == null) {
            promise.reject("ERR_NO_ACTIVITY", "Activity is not available")
            return
        }

        try {
            val photoDir = File(reactContext.cacheDir, "camera_photos").apply { mkdirs() }
            val photoFile = File(photoDir, "IMG_${System.currentTimeMillis()}.jpg")
            pendingPhotoFile = photoFile

            val authority = "${reactContext.packageName}.provider"
            val photoUri: Uri = FileProvider.getUriForFile(reactContext, authority, photoFile)

            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            }

            activePromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_CAPTURE_PHOTO)
        } catch (e: Exception) {
            pendingPhotoFile = null
            activePromise = null
            promise.reject("ERR_CAMERA", e.message, e)
        }
    }

    @ReactMethod
    fun captureVideo(promise: Promise) {
        val currentActivity = reactContext.currentActivity
        if (currentActivity == null) {
            promise.reject("ERR_NO_ACTIVITY", "Activity is not available")
            return
        }

        try {
            val intent = Intent(MediaStore.ACTION_VIDEO_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_VIDEO_QUALITY, 1)
            }
            activePromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_CAPTURE_VIDEO)
        } catch (e: Exception) {
            activePromise = null
            promise.reject("ERR_VIDEO", e.message, e)
        }
    }

    @ReactMethod
    fun pickMedia(mediaType: String?, promise: Promise) {
        val currentActivity = reactContext.currentActivity
        if (currentActivity == null) {
            promise.reject("ERR_NO_ACTIVITY", "Activity is not available")
            return
        }

        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                when (mediaType) {
                    "video" -> type = "video/*"
                    "image" -> type = "image/*"
                    else -> {
                        type = "*/*"
                        putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "video/*", "application/pdf"))
                    }
                }
                addCategory(Intent.CATEGORY_OPENABLE)
            }
            activePromise = promise
            currentActivity.startActivityForResult(intent, REQUEST_PICK_MEDIA)
        } catch (e: Exception) {
            activePromise = null
            promise.reject("ERR_PICKER", e.message, e)
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        val promise = activePromise ?: return

        if (resultCode != Activity.RESULT_OK) {
            activePromise = null
            pendingPhotoFile = null
            promise.reject("CANCELED", "Người dùng đã hủy thao tác")
            return
        }

        when (requestCode) {
            REQUEST_CAPTURE_PHOTO -> {
                val file = pendingPhotoFile
                activePromise = null
                pendingPhotoFile = null

                if (file != null && file.exists() && file.length() > 0) {
                    val map = Arguments.createMap().apply {
                        putString("uri", Uri.fromFile(file).toString())
                        putString("name", file.name)
                        putDouble("size", file.length().toDouble())
                        putString("type", "image/jpeg")
                    }
                    promise.resolve(map)
                } else {
                    promise.reject("ERR_PHOTO_EMPTY", "Không nhận được dữ liệu ảnh chụp")
                }
            }

            REQUEST_CAPTURE_VIDEO -> {
                activePromise = null
                val videoUri = data?.data
                if (videoUri != null) {
                    try {
                        val copiedFile = copyContentUriToCache(videoUri, "VID_${System.currentTimeMillis()}.mp4")
                        val map = Arguments.createMap().apply {
                            putString("uri", Uri.fromFile(copiedFile).toString())
                            putString("name", copiedFile.name)
                            putDouble("size", copiedFile.length().toDouble())
                            putString("type", "video/mp4")
                        }
                        promise.resolve(map)
                    } catch (e: Exception) {
                        promise.reject("ERR_VIDEO_COPY", e.message, e)
                    }
                } else {
                    promise.reject("ERR_VIDEO_EMPTY", "Không nhận được dữ liệu video")
                }
            }

            REQUEST_PICK_MEDIA -> {
                activePromise = null
                val uri = data?.data
                if (uri != null) {
                    try {
                        val fileName = getFileName(uri) ?: "tệp_${System.currentTimeMillis()}"
                        val copiedFile = copyContentUriToCache(uri, fileName)
                        val mimeType = reactContext.contentResolver.getType(uri) ?: "application/octet-stream"
                        val isVideo = mimeType.startsWith("video")
                        val isImage = mimeType.startsWith("image")

                        val map = Arguments.createMap().apply {
                            putString("uri", Uri.fromFile(copiedFile).toString())
                            putString("name", copiedFile.name)
                            putDouble("size", copiedFile.length().toDouble())
                            putString("type", if (isVideo) "video" else if (isImage) "image" else "document")
                            putString("mimeType", mimeType)
                        }
                        promise.resolve(map)
                    } catch (e: Exception) {
                        promise.reject("ERR_FILE_COPY", e.message, e)
                    }
                } else {
                    promise.reject("ERR_FILE_EMPTY", "Không có tệp nào được chọn")
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {}

    private fun copyContentUriToCache(uri: Uri, targetFileName: String): File {
        val cacheDir = File(reactContext.cacheDir, "media_attachments").apply { mkdirs() }
        val targetFile = File(cacheDir, targetFileName)

        reactContext.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(targetFile).use { output ->
                input.copyTo(output)
            }
        }
        return targetFile
    }

    private fun getFileName(uri: Uri): String? {
        var name: String? = null
        if (uri.scheme == "content") {
            reactContext.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1 && cursor.moveToFirst()) {
                    name = cursor.getString(nameIndex)
                }
            }
        }
        return name ?: uri.lastPathSegment
    }
}
