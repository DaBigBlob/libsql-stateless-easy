import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/main.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  minifyWhitespace: true,
  outDir: './dist',
  platform: 'neutral',
  treeshake: 'safest',
  cjsInterop: true,
  dts: true,
  shims: true,
  format: ['cjs', 'esm'],
  target: ['deno1', 'node18', 'chrome120', 'edge120', 'firefox120', 'safari16', 'es2022']
})