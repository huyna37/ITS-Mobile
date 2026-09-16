export interface AppConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  sosHotline: string;
  highwayTitle: string;
  highwaySubtitle: string;
}

export const APP_CONFIG: AppConfig = {
  apiBaseUrl: 'http://10.0.229.55:32281',
  apiTimeoutMs: 15000,
  sosHotline: '113',
  highwayTitle: 'VẬN HÀNH CAO TỐC NỘI BÀI - LÀO CAI',
  highwaySubtitle: 'Hệ thống điều hành tác nghiệp ITS',
};
