import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const extensions = [
  '.web.tsx',
  '.web.ts',
  '.web.jsx',
  '.web.js',
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'API_', 'SOS_', 'HIGHWAY_'],
    resolve: {
      alias: {
        '@react-native/assets-registry/registry': path.resolve(__dirname, './src/shims/assetsRegistry.ts'),
        '@react-native/assets-registry': path.resolve(__dirname, './src/shims/assetsRegistry.ts'),
        'react-native/Libraries/Utilities/codegenNativeComponent': 'react-native-web',
        'react-native/Libraries/ReactNative/AppContainer': 'react-native-web',
        'react-native-compressor': path.resolve(__dirname, './src/shims/nativeMedia.ts'),
        'react-native-image-picker': path.resolve(__dirname, './src/shims/nativeMedia.ts'),
        'react-native': 'react-native-web',
        '@': path.resolve(__dirname, './src'),
      },
      extensions,
    },
    optimizeDeps: {
      esbuildOptions: {
        resolveExtensions: extensions,
        loader: { '.js': 'jsx' },
      },
    },
    define: {
      global: 'window',
      __DEV__: JSON.stringify(mode !== 'production'),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || env.VITE_API_BASE_URL || ''),
      'process.env.API_TIMEOUT_MS': JSON.stringify(env.API_TIMEOUT_MS || '8000'),
      'process.env.SOS_HOTLINE': JSON.stringify(env.SOS_HOTLINE || '113'),
      'process.env.HIGHWAY_TITLE': JSON.stringify(env.HIGHWAY_TITLE || 'VẬN HÀNH CAO TỐC NỘI BÀI - LÀO CAI'),
      'process.env.HIGHWAY_SUBTITLE': JSON.stringify(env.HIGHWAY_SUBTITLE || 'Hệ thống điều hành ITS'),
    },
    server: {
      port: 5173,
      open: false,
    },
  };
});


