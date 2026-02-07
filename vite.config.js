import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': '/src',
            '@components': '/src/components',
            '@pages': '/src/pages',
            '@hooks': '/src/hooks',
            '@services': '/src/services',
            '@utils': '/src/utils',
            '@constants': '/src/constants',
            '@types': '/src/types',
            '@stores': '/src/stores',
            '@assets': '/src/assets',
            '@styles': '/src/styles',
            '@routes': '/src/routes',
            '@base': '/src/base',
            '@features': '/src/features',
            '@contexts': '/src/contexts',
        },
    },
});
