// Renders every HTML page through Handlebars before Vite processes it.
// The page and language come from the file's location:
//   index.html                  -> en / home
//   fi/embroidery/index.html    -> fi / embroidery
//   patterns/<slug>/index.html  -> en / pattern (generated, no file on disk)
// Strings live in src/i18n/<lang>.json, shared markup in partials/*.hbs,
// patterns in content/patterns/ (see vite/patterns.js).
import Handlebars from 'handlebars'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, basename, resolve, sep } from 'node:path'
import { loadPatterns, patternFiles, CONTENT_DIR } from './patterns.js'
import { knitMockup, libraryMockup, starPair } from './knit-art.js'

const SITE_URL = 'https://aadaharma.com'
const LANGS = ['en', 'fi']
const PAGES = ['home', 'embroidery', 'knitting', 'patterns']

const pageUrl = (lang, page) =>
  (lang === 'en' ? '' : `/${lang}`) + (page === 'home' ? '/' : `/${page}/`)

const PAGE_FILES = [
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
  if (parts[0] === 'patterns' && parts[1]) return { lang, page: 'pattern', slug: parts[1] }
  return { lang, page: parts[0] ?? 'home' }
}

const readStrings = (root, lang) =>
  JSON.parse(readFileSync(join(root, 'src', 'i18n', `${lang}.json`), 'utf8'))

export function sitePages({ root, drafts }) {
  const partialsDir = join(root, 'partials')
  const i18nDir = join(root, 'src', 'i18n')
  const contentDir = join(root, CONTENT_DIR)

  const patterns = () =>
    loadPatterns(root, {
      drafts,
      pageUrl,
      langs: LANGS,
      chartLabels: Object.fromEntries(LANGS.map((l) => [l, readStrings(root, l).pattern.chartLabel])),
    })

  // Pattern pages have no file on disk; they are rendered from the same shell as every page
  const shell = () => readFileSync(join(root, 'index.html'), 'utf8')
  const patternFile = (p) => resolve(root, p.url.slice(1) + 'index.html')

  function render(html, filename) {
    const hb = Handlebars.create()
    hb.registerHelper('eq', (a, b) => a === b)
    hb.registerHelper('ne', (a, b) => a !== b)
    for (const file of readdirSync(partialsDir)) {
      if (file.endsWith('.hbs')) {
        hb.registerPartial(basename(file, '.hbs'), readFileSync(join(partialsDir, file), 'utf8'))
      }
    }

    const { lang, page, slug } = pageInfo(root, filename)
    const t = readStrings(root, lang)
    const otherLang = lang === 'en' ? 'fi' : 'en'
    const urls = Object.fromEntries(PAGES.map((p) => [p, pageUrl(lang, p)]))
    const all = page === 'patterns' || page === 'pattern' ? patterns() : []
    const pattern = page === 'pattern' ? all.find((p) => p.slug === slug && p.lang === lang) : null
    if (page === 'pattern' && !pattern) throw new Error(`No pattern for ${filename}`)

    // Pattern pages exist in one language only, so they have no alternate
    const hasAlternate = page !== 'notfound' && page !== 'pattern'
    const meta = pattern
      ? { metaTitle: `${pattern.title} — ${t.siteName}`, description: pattern.summary ?? '' }
      : t[page]

    return hb.compile(html)({
      lang,
      page,
      t,
      meta,
      urls,
      pattern,
      patterns: all,
      facets: facets(all, t),
      art: {
        knit: knitMockup(t.home.knittingCard.mockupAlt),
        library: libraryMockup(t.home.patternsCard.mockupAlt),
        stars: starPair(),
      },
      siteUrl: SITE_URL,
      canonical: page === 'notfound' ? null : SITE_URL + (pattern ? pattern.url : pageUrl(lang, page)),
      alternates: hasAlternate
        ? LANGS.map((l) => ({ lang: l, href: SITE_URL + pageUrl(l, page) }))
        : [],
      switchUrl: hasAlternate
        ? pageUrl(otherLang, page)
        : pageUrl(otherLang, page === 'pattern' ? 'patterns' : 'home'),
      year: new Date().getFullYear(),
    })
  }

  return {
    name: 'site-pages',
    enforce: 'pre',

    config(config) {
      const inputs = [...PAGE_FILES.map((f) => resolve(root, f)), ...patterns().map(patternFile)]
      config.build ??= {}
      config.build.rollupOptions ??= {}
      config.build.rollupOptions.input = Object.fromEntries(
        inputs.map((file) => [relative(root, file), file]),
      )
    },

    // Build: serve the shell for generated pattern pages
    resolveId(id) {
      if (patterns().some((p) => patternFile(p) === id)) return id
    },
    load(id) {
      if (patterns().some((p) => patternFile(p) === id)) return shell()
    },

    // Build: copy PDFs and other non-image pattern files
    generateBundle() {
      for (const file of patternFiles(root, patterns())) {
        this.emitFile({ type: 'asset', fileName: file.fileName, source: readFileSync(file.path) })
      }
    },

    // Dev: serve generated pattern pages
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url.split('?')[0]
        const p = patterns().find((p) => p.url === path || p.url === path + '/')
        if (!p) return next()
        if (p.url !== path) {
          res.writeHead(301, { Location: p.url }).end()
          return
        }
        const html = await server.transformIndexHtml(p.url + 'index.html', shell(), req.originalUrl)
        res.setHeader('Content-Type', 'text/html').end(html)
      })
    },

    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => render(html, ctx.filename),
    },

    handleHotUpdate({ file, server }) {
      if (file.endsWith('.hbs') || file.startsWith(i18nDir) || file.startsWith(contentDir)) {
        server.ws.send({ type: 'full-reload' })
        return []
      }
    },
  }
}

// Filter groups for the library page: every value used by at least one pattern
function facets(patterns, t) {
  return ['craft', 'difficulty', 'yarnWeight']
    .map((key) => ({
      key,
      label: t.patterns.filters[key],
      values: [...new Set(patterns.map((p) => p[key]).filter(Boolean))],
    }))
    .filter((f) => f.values.length > 1)
}
