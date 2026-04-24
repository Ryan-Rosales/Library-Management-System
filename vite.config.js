import process from 'node:process';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig,
    loadEnv,
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const appUrl = env.APP_URL || 'http://localhost:8000';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                ssr: 'resources/js/ssr.jsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
            {
                name: 'redirect-vite-root-to-app',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (req.url === '/' || req.url?.startsWith('/?')) {
                            res.statusCode = 302;
                            res.setHeader('Location', appUrl);
                            res.end();
                            return;
                        }

                        next();
                    });
                },
            },
        ],
        esbuild: {
            jsx: 'automatic',
        },
    };
});