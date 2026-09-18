import { Platform } from 'react-native';
import { apiClient } from '../api/client';
import { MediaFile, compressImageFile, compressVideoFile } from './mediaService';

export interface UploadCallbacks {
  onProgress?: (progress: number) => void;
  onStatusChange?: (status: MediaFile['status'], error?: string) => void;
}

export interface UploadOptions {
  incidentId?: string;
  taskId?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * Service upload tệp Multipart/form-data kèm progress bar và cơ chế tự động Retry
 */
export async function uploadMediaWithRetry(
  mediaFile: MediaFile,
  options: UploadOptions = {},
  callbacks: UploadCallbacks = {}
): Promise<{ url: string; id: string }> {
  const maxRetries = options.maxRetries ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 1500;

  // 1. Giai đoạn nén (Compression Stage)
  callbacks.onStatusChange?.('compressing');
  let uploadUri = mediaFile.uri;

  try {
    if (mediaFile.type === 'image') {
      const compResult = await compressImageFile(mediaFile.uri);
      uploadUri = compResult.uri;
    } else if (mediaFile.type === 'video') {
      const compResult = await compressVideoFile(mediaFile.uri, (prog) => {
        // Compression progress (0-50% overall)
        callbacks.onProgress?.(Math.round(prog * 0.4));
      });
      uploadUri = compResult.uri;
    }
  } catch (compErr) {
    console.warn('Bỏ qua nén do lỗi, tiếp tục upload file gốc:', compErr);
    uploadUri = mediaFile.uri;
  }

  // 2. Giai đoạn Upload Multipart với Retry
  callbacks.onStatusChange?.('uploading');

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        if (mediaFile.fileObj) {
          formData.append('file', mediaFile.fileObj, mediaFile.name);
        } else {
          // Fetch blob from URI
          const response = await fetch(uploadUri);
          const blob = await response.blob();
          formData.append('file', blob, mediaFile.name);
        }
      } else {
        // React Native Android/iOS FormData format
        const fileData: any = {
          uri: uploadUri,
          name: mediaFile.name,
          type: mediaFile.type === 'image' ? 'image/jpeg' : mediaFile.type === 'video' ? 'video/mp4' : 'application/octet-stream',
        };
        formData.append('file', fileData);
      }

      if (options.incidentId) {
        formData.append('incidentId', options.incidentId);
      }
      if (options.taskId) {
        formData.append('taskId', options.taskId);
      }

      const res = await apiClient.post<{ url?: string; id?: string }>('/api/files/upload', formData, {
        headers: Platform.OS === 'web' ? {} : { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            callbacks.onProgress?.(percentCompleted);
          }
        },
      });

      const fileUrl = res.data.url || `/api/files/${res.data.id}/download`;
      callbacks.onStatusChange?.('success');
      callbacks.onProgress?.(100);
      return { url: fileUrl, id: res.data.id ? String(res.data.id) : '' };
    } catch (err: any) {
      lastError = err;
      console.warn(`Lần upload ${attempt}/${maxRetries} thất bại:`, err?.message);

      if (attempt < maxRetries) {
        // Chờ trước khi retry
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
      }
    }
  }

  const errorMessage = lastError?.response?.data?.error || lastError?.message || 'Lỗi tải tệp lên máy chủ';
  callbacks.onStatusChange?.('error', errorMessage);
  throw new Error(errorMessage);
}
