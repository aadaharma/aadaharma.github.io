// Renders every HTML page through Handlebars before Vite processes it.
// The page and language come from the file's location:
//   index.html               -> en / home
//   fi/embroidery/index.html -> fi / embroidery
// Strings live in src/i18n/<lang>.json, shared markup in partials/*.hbs.
import Handlebars from 'handlebars'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, basename, sep } from 'node:path'

const SITE_URL = 'https://aadaharma.com'
const LANGS = ['en', 'fi']
const PAGES = ['home', 'embroidery', 'knitting']

const pageUrl = (lang, page) =>
  (lang === 'en' ? '' : `/${lang}`) + (page === 'home' ? '/' : `/${page}/`)

export const PAGE_FILES = [
  ...LANGS.flatMap((lang) =>
    PAGES.map((page) => pageUrl(lang, page).slice(1) + 'index.html'),
  ),
  '404.html',
]

function pageInfo(root, filename) {
  const rel = relative(root, filename).split(sep).join('/')
  if (rel === '404.html') return { lang: 'en', page: 'notfound' }
  const parts = rel.replace(/index\.html$/, '').split('/').filter(Boolean)
  const lang = LANGS.includes(parts[0]) ? parts.shift() : 'en'
  return { lang, page: parts[0] ?? 'home' }
}

export function i18nPages({ root }) {
  const partialsDir = join(root, 'partials')
  const i18nDir = join(root, 'src', 'i18n')

  function render(html, filename) {
    const hb = Handlebars.create()
    hb.registerHelper('eq', (a, b) => a === b)
    for (const file of readdirSync(partialsDir)) {
      if (file.endsWith('.hbs')) {
        hb.registerPartial(basename(file, '.hbs'), readFileSync(join(partialsDir, file), 'utf8'))
      }
    }

    const { lang, page } = pageInfo(root, filename)
    const t = JSON.parse(readFileSync(join(i18nDir, `${lang}.json`), 'utf8'))
    const otherLang = lang === 'en' ? 'fi' : 'en'
    const urls = Object.fromEntries(PAGES.map((p) => [p, pageUrl(lang, p)]))
    const hasAlternate = page !== 'notfound'

    return hb.compile(html)({
      lang,
      page,
      t,
      urls,
      siteUrl: SITE_URL,
      canonical: hasAlternate ? SITE_URL + pageUrl(lang, page) : null,
      alternates: hasAlternate
        ? LANGS.map((l) => ({ lang: l, href: SITE_URL + pageUrl(l, page) }))
        : [],
      switchUrl: hasAlternate ? pageUrl(otherLang, page) : pageUrl(otherLang, 'home'),
      year: new Date().getFullYear(),
    })
  }

  return {
    name: 'i18n-pages',
    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => render(html, ctx.filename),
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.hbs') || file.startsWith(i18nDir)) {
        server.ws.send({ type: 'full-reload' })
        return []
      }
    },
  }
}
