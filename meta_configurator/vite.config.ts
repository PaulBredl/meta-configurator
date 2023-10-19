import {fileURLToPath, URL} from 'node:url';

import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/meta_configurator/',
  plugins: [vue(), vueJsx()],
  optimizeDeps: {
    exclude: ['ajv-formats'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});