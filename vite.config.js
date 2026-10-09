import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { i18nPages, PAGE_FILES } from './vite/i18n-pages.js'

const root = import.meta.dirname

export default defineConfig({
  appType: 'mpa',
  plugins: [i18nPages({ root })],
  build: {
    rollupOptions: {
      input: Object.fromEntries(PAGE_FILES.map((file) => [file, resolve(root, file)])),
    },
  },
})
