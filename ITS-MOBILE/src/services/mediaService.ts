import { Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';

// Safe conditional import for react-native-compressor (requires native Nitro TurboModules)
let ImageCompressor: any = null;
let VideoCompressor: any = null;
try {
  const { TurboModuleRegistry } = require('react-native');
  if (TurboModuleRegistry && TurboModuleRegistry.get && TurboModuleRegistry.get('NitroModules')) {
    const compressor = require('react-native-compressor');
    ImageCompressor = compressor?.Image;
    VideoCompressor = compressor?.Video;
  }
} catch {
  // Fallback when running in environment without Nitro native binary (e.g. Web)
}

export interface MediaFile {
  id: string;
  uri: string;
  name: string;
  type: 'image' | 'video' | 'file';
  size?: number;
  compressedSize?: number;
  progress: number; // 0 - 100
  status: 'idle' | 'compressing' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  uploadedUrl?: string;
  fileObj?: File | Blob; // For web platform
}

/**
 * Nén ảnh theo tiêu chuẩn kỹ thuật ITS Mobile VEC: < 500KB, JPEG 0.7 - 0.8
 */
export async function compressImageFile(uri: string): Promise<{ uri: string; size?: number }> {
  if (Platform.OS === 'web' || !ImageCompressor) {
    return { uri };
  }

  try {
    const compressedUri = await ImageCompressor.compress(uri, {
      compressionMethod: 'auto',
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.75,
      returnableOutputType: 'uri',
    });
    return { uri: compressedUri };
  } catch (error) {
    console.warn('Image compression fallback to original:', error);
    return { uri };
  }
}

/**
 * Nén video theo tiêu chuẩn kỹ thuật ITS Mobile VEC: tối đa 720p (1280x720)
 */
export async function compressVideoFile(
  uri: string,
  onProgress?: (progress: number) => void
): Promise<{ uri: string; size?: number }> {
  if (Platform.OS === 'web' || !VideoCompressor) {
    return { uri };
  }

  try {
    const compressedUri = await VideoCompressor.compress(
      uri,
      {
        compressionMethod: 'auto',
        maxSize: 1280, // 720p
        bitrate: 1500000,
      },
      (progress: number) => {
        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }
      }
    );
    return { uri: compressedUri };
  } catch (error) {
    console.warn('Video compression fallback to original:', error);
    return { uri };
  }
}

/**
 * Chụp ảnh hiện trường từ Camera
 */
export async function capturePhoto(): Promise<MediaFile | null> {
  if (Platform.OS === 'web') {
    return pickWebFile('image/*');
  }

  const options: CameraOptions = {
    mediaType: 'photo',
    cameraType: 'back',
    saveToPhotos: true,
    quality: 0.8,
  };

  const result = await launchCamera(options);
  if (result.didCancel || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return convertAssetToMediaFile(asset, 'image');
}

/**
 * Quay video hiện trường từ Camera
 */
export async function recordVideo(): Promise<MediaFile | null> {
  if (Platform.OS === 'web') {
    return pickWebFile('video/*');
  }

  const options: CameraOptions = {
    mediaType: 'video',
    cameraType: 'back',
    videoQuality: 'high',
    durationLimit: 120, // Tối đa 2 phút
  };

  const result = await launchCamera(options);
  if (result.didCancel || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return convertAssetToMediaFile(asset, 'video');
}

/**
 * Chọn ảnh hoặc video từ Thư viện / Đính kèm tệp
 */
export async function pickMediaFromLibrary(): Promise<MediaFile | null> {
  if (Platform.OS === 'web') {
    return pickWebFile('*/*');
  }

  const options: ImageLibraryOptions = {
    mediaType: 'mixed',
    selectionLimit: 1,
    quality: 0.8,
  };

  const result = await launchImageLibrary(options);
  if (result.didCancel || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const isVideo = asset.type?.startsWith('video') || asset.fileName?.endsWith('.mp4');
  return convertAssetToMediaFile(asset, isVideo ? 'video' : 'image');
}

function convertAssetToMediaFile(asset: Asset, defaultType: 'image' | 'video'): MediaFile {
  const uri = asset.uri || '';
  const name = asset.fileName || `media_${Date.now()}.${defaultType === 'image' ? 'jpg' : 'mp4'}`;
  const isVideo = defaultType === 'video' || asset.type?.startsWith('video');

  return {
    id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    uri,
    name,
    type: isVideo ? 'video' : 'image',
    size: asset.fileSize,
    progress: 0,
    status: 'idle',
  };
}

/**
 * Xử lý chọn tệp trên nền tảng Web cho môi trường kiểm thử/preview
 */
function pickWebFile(accept: string): Promise<MediaFile | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isImg = file.type.startsWith('image');

      resolve({
        id: `web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        uri: url,
        name: file.name,
        type: isVideo ? 'video' : isImg ? 'image' : 'file',
        size: file.size,
        progress: 0,
        status: 'idle',
        fileObj: file,
      });
      document.body.removeChild(input);
    };

    input.oncancel = () => {
      resolve(null);
      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };

    document.body.appendChild(input);
    input.click();
  });
}
