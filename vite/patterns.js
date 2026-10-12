// Loads the knitting pattern library from content/patterns/.
//   content/patterns/<slug>.md      the pattern: frontmatter + Markdown
//   content/patterns/<slug>/        its photos, chart images and PDF (optional)
// Files starting with _ (like _template.md) are skipped, and so are patterns
// marked `draft: true` unless drafts are switched on.
import { Marked } from 'marked'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { parseChart, chartSvg, swatch } from './knit-art.js'

export const CONTENT_DIR = 'content/patterns'

const isRelative = (href) => href && !/^([a-z]+:|\/|#)/i.test(href)

// Simple `key: value` frontmatter between --- lines
function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: source }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z][\w-]*)\s*:\s*(.*?)\s*$/)
    if (!m) continue
    let value = m[2].replace(/^(['"])(.*)\1$/, '$2')
    if (value === 'true') value = true
    else if (value === 'false') value = false
    data[m[1]] = value
  }
  return { data, body: source.slice(match[0].length) }
}

function markdown(slug, chartLabel) {
  const assetBase = `/${CONTENT_DIR}/${slug}/`
  return new Marked({
    // Relative image and file links point into the pattern's own folder
    walkTokens(token) {
      if ((token.type === 'image' || token.type === 'link') && isRelative(token.href)) {
        token.href = assetBase + token.href
      }
    },
    renderer: {
      // ```chart blocks are drawn as colourwork charts
      code({ text, lang }) {
        if (lang !== 'chart') return false
        return `<figure class="chart-figure"><div class="chart-wrap">${chartSvg(parseChart(text), chartLabel)}</div></figure>`
      },
    },
  })
}

export function loadPatterns(root, { drafts, pageUrl, langs, chartLabels }) {
  const dir = join(root, CONTENT_DIR)
  if (!existsSync(dir)) return []

  const patterns = readdirSync(dir)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
    .map((file) => {
      const slug = basename(file, '.md')
      const { data, body } = parseFrontmatter(readFileSync(join(dir, file), 'utf8'))
      const lang = langs.includes(data.language) ? data.language : langs[0]
      const asset = (name) => (name ? `/${CONTENT_DIR}/${slug}/${name}` : null)
      return {
        ...data,
        slug,
        lang,
        title: data.title || slug,
        url: pageUrl(lang, 'patterns') + slug + '/',
        cover: asset(data.cover),
        pdf: asset(data.pdf),
        html: markdown(slug, chartLabels[lang]).parse(body),
      }
    })
    .filter((p) => drafts || !p.draft)
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')) || a.title.localeCompare(b.title))

  // Cards without a cover photo get a knitted swatch drawing, a different motif per card
  patterns.forEach((p, i) => {
    if (!p.cover) p.swatch = swatch(i % 4)
  })
  return patterns
}

// Non-image files (PDFs) in pattern folders. Images are picked up by Vite from the HTML.
export function patternFiles(root, patterns) {
  const files = []
  for (const p of patterns) {
    const dir = join(root, CONTENT_DIR, p.slug)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir)) {
      if (!/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(file)) {
        files.push({ fileName: `${CONTENT_DIR}/${p.slug}/${file}`, path: join(dir, file) })
      }
    }
  }
  return files
}
