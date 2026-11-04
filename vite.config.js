import {defineConfig} from 'vite';
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
export default defineConfig({
  base: repository ? `/${repository}/` : '/',
  build: { outDir:'dist', assetsInlineLimit: 4096, sourcemap:false }
});
