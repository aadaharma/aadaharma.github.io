import { defineConfig } from 'vite'
import { sitePages } from './vite/i18n-pages.js'

const root = import.meta.dirname

export default defineConfig(({ command }) => ({
  appType: 'mpa',
  // Draft patterns show in `npm run dev`, and in a build only with SHOW_DRAFTS=1
  plugins: [sitePages({ root, drafts: command === 'serve' || !!process.env.SHOW_DRAFTS })],
}))
