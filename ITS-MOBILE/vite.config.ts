import { defineConfig } from 'vite';
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

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@react-native/assets-registry/registry': path.resolve(__dirname, './src/shims/assetsRegistry.ts'),
      '@react-native/assets-registry': path.resolve(__dirname, './src/shims/assetsRegistry.ts'),
      'react-native/Libraries/Utilities/codegenNativeComponent': 'react-native-web',
      'react-native/Libraries/ReactNative/AppContainer': 'react-native-web',
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
    __DEV__: JSON.stringify(true),
  },
  server: {
    port: 5173,
    open: false,
  },
});


