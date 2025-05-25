
// import vue from '@vitejs/plugin-vue';
// import tailwind from '@tailwindcss/vite';


// export default {

//     plugins: [vue(), tailwind()],
// }


import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
  plugins: [
    vue(),
    tailwind(),
    svgLoader()
  ]
});
