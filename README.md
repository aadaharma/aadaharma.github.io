# aadaharma.com

Aada Härmä's craft site: a showcase of the
[Karelian Embroidery Designer](https://aadaharma.com/karelianembroiderymaker/),
a library of knitting patterns, and later a knitting pattern generator.
The site is in English and Finnish.

Built with [Vite](https://vite.dev/), vanilla JS and plain CSS.

## Development

Requires Node.js 20.19+ (22 recommended).

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs dist/
npm run preview   # serves dist/ locally
```

## How the pages work

Every page file (`index.html`, `embroidery/index.html`, `fi/knitting/index.html`, …)
is the same small shell. A small Vite plugin (`vite/i18n-pages.js`) renders it with
[Handlebars](https://handlebarsjs.com/) and works out the language and page from
the file's location:

- `partials/` holds the shared markup: `head`, `header`, `footer`, decorations, and
  one partial per page (`home.hbs`, `embroidery.hbs`, `knitting.hbs`, `patterns.hbs`,
  `pattern.hbs`, `notfound.hbs`). `app-frame.hbs` draws the browser window around app UI.
- `src/i18n/en.json` and `fi.json` hold all the text. To edit copy, change it in both.
- `src/styles/` holds the CSS: `tokens.css` has the colours (light and dark) and fonts,
  `print.css` the print layout for patterns.
- `vite/knit-art.js` draws the knitting charts and app mockups as inline SVG.
- `public/` is copied as is (images, fonts, favicon, `CNAME`).

To add a page, add its name to `PAGES` in `vite/i18n-pages.js`, create
`<page>/index.html` and `fi/<page>/index.html` (copy any existing shell), add
`partials/<page>.hbs`, and add its strings to both JSON files.

## Adding a knitting pattern

Patterns live in `content/patterns/`. Each one is a Markdown file, and the file name
becomes the address: `my-socks.md` → `aadaharma.com/patterns/my-socks/`
(or `/fi/patterns/my-socks/` when `language: fi`).

1. Copy `content/patterns/_template.md` and fill in the details at the top.
2. Put photos and an optional PDF in a folder with the same name,
   e.g. `content/patterns/my-socks/cover.jpg`.
3. Colourwork charts can be typed as text in a ```` ```chart ```` block
   (`X` = main colour, `.` = contrast colour); they're drawn as numbered charts.
4. Remove `draft: true` when it's ready, and commit.

This works from the GitHub website too: open `content/patterns/`, choose
*Add file → Upload files*, and drag the files in.

Drafts show in `npm run dev` but aren't published. To include them in a build,
run `SHOW_DRAFTS=1 npm run build`. The library's filter buttons are made from the
`craft`, `difficulty` and `yarnWeight` values, so keep those spelled consistently.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/` to GitHub Pages. In the repo settings, *Pages → Build and deployment
→ Source* must be set to **GitHub Actions**.
