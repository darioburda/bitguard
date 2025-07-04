
// import vue from '@vitejs/plugin-vue';
// import tailwind from '@tailwindcss/vite';


// export default {

//     plugins: [vue(), tailwind()],
// }

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})


