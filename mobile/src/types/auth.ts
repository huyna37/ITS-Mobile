export interface User {
  id: string;
  username: string;
  fullName: string;
  extension: string; // 4 chữ số
  role: string;
  department: string;
  avatar?: string;
  phone?: string;
}

export interface LoginCredentials {
  username: string;
  extension: string; // Chuẩn 4 chữ số
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
