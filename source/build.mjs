import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
await build({
    entryPoints: { app: 'src/main.tsx' },
    bundle: true,
    minify: true,
    outdir: 'dist',
    target: 'es2020',
    define: { 'process.env.NODE_ENV': '"production"' },
});
cpSync('public-index.html', 'dist/index.html');
for (const file of ['manifest.webmanifest', 'sw.js']) cpSync(file, `dist/${file}`);
for (const size of [180, 192, 512]) cpSync(`icons/icon-${size}.png`, `dist/icon-${size}.png`);
