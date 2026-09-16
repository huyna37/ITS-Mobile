import { APP_CONFIG } from '../config';

/**
 * Trích xuất thông điệp lỗi chi tiết từ Axios và phản hồi Backend
 */
export function parseApiError(err: any): string {
  if (!err) {
    return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  }

  // 1. Lỗi chi tiết từ Backend trả về trong body ({ error: "...", detail: "..." })
  const responseData = err.response?.data;
  if (responseData) {
    if (typeof responseData.error === 'string' && responseData.error.trim()) {
      if (typeof responseData.detail === 'string' && responseData.detail.trim()) {
        return `${responseData.error}: ${responseData.detail}`;
      }
      return responseData.error;
    }
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
  }

  // 2. Mã trạng thái HTTP
  const status = err.response?.status;
  if (status === 401) {
    return 'Sai tài khoản, mật khẩu hoặc số máy lẻ không hợp lệ.';
  }
  if (status === 403) {
    return 'Tài khoản không có quyền truy cập hệ thống.';
  }
  if (status === 404) {
    return 'Không tìm thấy tài nguyên trên máy chủ (404).';
  }
  if (status >= 500) {
    return 'Máy chủ Backend hoặc Cơ sở dữ liệu đang gặp sự cố (HTTP 500).';
  }

  // 3. Lỗi mạng / timeout / không gọi được host
  if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
    return 'Kết nối máy chủ quá thời gian chờ (Timeout). Vui lòng kiểm tra lại đường truyền mạng.';
  }
  if (err.message === 'Network Error' || !err.response) {
    return `Không thể kết nối đến máy chủ Backend (${APP_CONFIG.apiBaseUrl}). Vui lòng kiểm tra máy chủ đã bật chưa hoặc kết nối mạng.`;
  }

  return err.message || 'Đăng nhập không thành công. Vui lòng thử lại.';
}
