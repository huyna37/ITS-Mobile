import { Platform, NativeModules, Alert } from 'react-native';

export interface PickedMedia {
  uri: string;
  name: string;
  size: number;
  type: 'image' | 'video' | 'document';
  mimeType?: string;
}

const { MediaPickerModule } = NativeModules;

/**
 * Chụp ảnh hiện trường từ Camera
 */
export async function capturePhoto(): Promise<PickedMedia | null> {
  // 1. Môi trường Web (Trình duyệt máy tính / điện thoại)
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.setAttribute('capture', 'environment'); // Mở trực tiếp Camera sau trên di động
        input.style.display = 'none';

        input.onchange = (event: any) => {
          const files = event.target?.files;
          if (!files || files.length === 0) {
            resolve(null);
            return;
          }
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve({
              uri: dataUrl,
              name: file.name || `photo_${Date.now()}.jpg`,
              size: file.size,
              type: 'image',
              mimeType: file.type || 'image/jpeg',
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        };

        input.oncancel = () => resolve(null);
        document.body.appendChild(input);
        input.click();
        setTimeout(() => {
          document.body.removeChild(input);
        }, 1000);
      } catch (err) {
        console.error('Web capturePhoto error:', err);
        resolve(null);
      }
    });
  }

  // 2. Môi trường Android Native
  if (MediaPickerModule && typeof MediaPickerModule.capturePhoto === 'function') {
    try {
      const res = await MediaPickerModule.capturePhoto();
      return {
        uri: res.uri,
        name: res.name,
        size: res.size || 0,
        type: 'image',
        mimeType: res.type || 'image/jpeg',
      };
    } catch (err: any) {
      if (err?.code === 'CANCELED') {
        return null;
      }
      console.error('Android capturePhoto error:', err);
      Alert.alert('Lỗi máy ảnh', err?.message || 'Không thể khởi động máy ảnh trên thiết bị');
      return null;
    }
  }

  // 3. Trường hợp đang dùng bản APK cũ chưa có NativeModule Camera
  Alert.alert(
    'Cập nhật ứng dụng',
    'Chức năng máy ảnh yêu cầu bản cài đặt APK v1.0.4 có quyền Camera. Vui lòng tải bản APK mới nhất từ TMC VEC.'
  );
  return null;
}

/**
 * Quay video hiện trường từ Camera
 */
export async function captureVideo(): Promise<PickedMedia | null> {
  // 1. Môi trường Web
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.setAttribute('capture', 'environment'); // Mở trực tiếp quay video
        input.style.display = 'none';

        input.onchange = (event: any) => {
          const files = event.target?.files;
          if (!files || files.length === 0) {
            resolve(null);
            return;
          }
          const file = files[0];
          const objectUrl = URL.createObjectURL(file);
          resolve({
            uri: objectUrl,
            name: file.name || `video_${Date.now()}.mp4`,
            size: file.size,
            type: 'video',
            mimeType: file.type || 'video/mp4',
          });
        };

        input.oncancel = () => resolve(null);
        document.body.appendChild(input);
        input.click();
        setTimeout(() => {
          document.body.removeChild(input);
        }, 1000);
      } catch (err) {
        console.error('Web captureVideo error:', err);
        resolve(null);
      }
    });
  }

  // 2. Môi trường Android Native
  if (MediaPickerModule && typeof MediaPickerModule.captureVideo === 'function') {
    try {
      const res = await MediaPickerModule.captureVideo();
      return {
        uri: res.uri,
        name: res.name,
        size: res.size || 0,
        type: 'video',
        mimeType: res.type || 'video/mp4',
      };
    } catch (err: any) {
      if (err?.code === 'CANCELED') {
        return null;
      }
      console.error('Android captureVideo error:', err);
      Alert.alert('Lỗi quay video', err?.message || 'Không thể khởi động quay video trên thiết bị');
      return null;
    }
  }

  Alert.alert(
    'Cập nhật ứng dụng',
    'Chức năng quay video yêu cầu bản cài đặt APK v1.0.4 có quyền Camera. Vui lòng tải bản APK mới nhất.'
  );
  return null;
}

/**
 * Chọn ảnh / video hoặc tài liệu từ thư viện máy
 */
export async function pickDocument(mediaType: 'image' | 'video' | 'all' = 'all'): Promise<PickedMedia | null> {
  // 1. Môi trường Web
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        if (mediaType === 'image') input.accept = 'image/*';
        else if (mediaType === 'video') input.accept = 'video/*';
        else input.accept = 'image/*,video/*,application/pdf,.doc,.docx';
        input.style.display = 'none';

        input.onchange = (event: any) => {
          const files = event.target?.files;
          if (!files || files.length === 0) {
            resolve(null);
            return;
          }
          const file = files[0];
          const isImg = file.type.startsWith('image/');
          const isVid = file.type.startsWith('video/');

          if (isImg) {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                uri: e.target?.result as string,
                name: file.name,
                size: file.size,
                type: 'image',
                mimeType: file.type,
              });
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          } else {
            const objectUrl = URL.createObjectURL(file);
            resolve({
              uri: objectUrl,
              name: file.name,
              size: file.size,
              type: isVid ? 'video' : 'document',
              mimeType: file.type,
            });
          }
        };

        input.oncancel = () => resolve(null);
        document.body.appendChild(input);
        input.click();
        setTimeout(() => {
          document.body.removeChild(input);
        }, 1000);
      } catch (err) {
        console.error('Web pickDocument error:', err);
        resolve(null);
      }
    });
  }

  // 2. Môi trường Android Native
  if (MediaPickerModule && typeof MediaPickerModule.pickMedia === 'function') {
    try {
      const res = await MediaPickerModule.pickMedia(mediaType);
      return {
        uri: res.uri,
        name: res.name,
        size: res.size || 0,
        type: res.type as 'image' | 'video' | 'document',
        mimeType: res.mimeType,
      };
    } catch (err: any) {
      if (err?.code === 'CANCELED') {
        return null;
      }
      console.error('Android pickMedia error:', err);
      Alert.alert('Lỗi chọn tệp', err?.message || 'Không thể truy cập thư viện tệp');
      return null;
    }
  }

  Alert.alert(
    'Cập nhật ứng dụng',
    'Chức năng đính kèm tệp yêu cầu bản cài đặt APK v1.0.4. Vui lòng tải bản APK mới nhất.'
  );
  return null;
}
