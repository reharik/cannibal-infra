import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    root: __dirname,
    cacheDir: '../node_modules/.vite/media-worker',
    plugins: [tsconfigPaths()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      ssr: true,
      target: 'node22',
      format: 'esm',
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: {
        input: {
          main: join(__dirname, 'src/main.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          format: 'es',
          manualChunks: undefined,
        },
        external: (id) => {
          if (!id) return false;
          if (id.startsWith('node:')) return true;
          if (!id.startsWith('.') && !id.startsWith('/')) {
            return true;
          }
          return false;
        },
      },
    },
    ssr: {
      noExternal: [],
    },
  };
});
