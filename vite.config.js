import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),        // React JSX 변환 + Fast Refresh (저장 시 즉시 반영)
        tailwindcss(),  // Tailwind CSS v4 — config 파일 없이 바로 동작합니다.
    ],

    server: {
        port: 3000,
        open: true,
    },

    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
