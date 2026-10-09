# aadaharma.com

Aada Härmä's craft site: a showcase of the
[Karelian Embroidery Designer](https://aadaharma.com/karelianembroiderymaker/)
and, later, a knitting pattern generator. The site is in English and Finnish.

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
  one partial per page (`home.hbs`, `embroidery.hbs`, `knitting.hbs`, `notfound.hbs`).
- `src/i18n/en.json` and `fi.json` hold all the text. To edit copy, change it in both.
- `src/styles/` holds the CSS: `tokens.css` has the colours and fonts.
- `public/` is copied as is (images, fonts, favicon, `CNAME`).

To add a page, add its name to `PAGES` in `vite/i18n-pages.js`, create
`<page>/index.html` and `fi/<page>/index.html` (copy any existing shell), add
`partials/<page>.hbs`, and add its strings to both JSON files.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/` to GitHub Pages. In the repo settings, *Pages → Build and deployment
→ Source* must be set to **GitHub Actions**.
