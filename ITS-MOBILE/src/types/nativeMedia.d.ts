declare module 'react-native-image-picker' {
  export interface Asset {
    base64?: string;
    uri?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    type?: string;
    fileName?: string;
    duration?: number;
    bitrate?: number;
    timestamp?: string;
    id?: string;
  }

  export interface ImagePickerResponse {
    didCancel?: boolean;
    errorCode?: string;
    errorMessage?: string;
    assets?: Asset[];
  }

  export interface CameraOptions {
    mediaType: 'photo' | 'video' | 'mixed';
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    videoQuality?: 'low' | 'high';
    durationLimit?: number;
    saveToPhotos?: boolean;
    cameraType?: 'back' | 'front';
    includeBase64?: boolean;
    includeExtra?: boolean;
    formatAsMp4?: boolean;
  }

  export interface ImageLibraryOptions {
    selectionLimit?: number;
    mediaType: 'photo' | 'video' | 'mixed';
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    videoQuality?: 'low' | 'high';
    includeBase64?: boolean;
    includeExtra?: boolean;
  }

  export function launchCamera(
    options: CameraOptions,
    callback?: (response: ImagePickerResponse) => void
  ): Promise<ImagePickerResponse>;

  export function launchImageLibrary(
    options: ImageLibraryOptions,
    callback?: (response: ImagePickerResponse) => void
  ): Promise<ImagePickerResponse>;
}

declare module 'react-native-compressor' {
  export const Image: {
    compress: (uri: string, options?: any) => Promise<string>;
  };
  export const Video: {
    compress: (uri: string, options?: any, onProgress?: (progress: number) => void) => Promise<string>;
  };
}
