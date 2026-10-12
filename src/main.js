import './styles/main.css'

// Fade sections in as they scroll into view
const revealables = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  revealables.forEach((el) => observer.observe(el))
} else {
  revealables.forEach((el) => el.classList.add('is-visible'))
}

// Theme toggle: auto (follow the system) -> light -> dark.
// The saved choice is applied early by the inline script in partials/head.hbs.
const themeToggle = document.querySelector('[data-theme-toggle]')
if (themeToggle) {
  const order = ['auto', 'light', 'dark']
  let theme = document.documentElement.dataset.theme ?? 'auto'
  const showTheme = () => {
    const name = themeToggle.dataset[theme]
    themeToggle.querySelector('[data-theme-name]').textContent = name
    themeToggle.setAttribute('aria-label', `${themeToggle.dataset.label}: ${name}`)
  }
  themeToggle.addEventListener('click', () => {
    theme = order[(order.indexOf(theme) + 1) % order.length]
    if (theme === 'auto') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme
    try {
      if (theme === 'auto') localStorage.removeItem('theme')
      else localStorage.setItem('theme', theme)
    } catch {}
    showTheme()
  })
  showTheme()
}

// Pattern library filters: one choice per group, pressing it again clears it
const filters = document.querySelector('[data-filters]')
if (filters) {
  const cards = [...document.querySelectorAll('.pattern-card')]
  const count = filters.querySelector('[data-result-count]')
  const empty = document.querySelector('[data-empty]')
  const active = {}

  const apply = () => {
    let shown = 0
    for (const card of cards) {
      const match = Object.entries(active).every(([key, value]) => card.dataset[key] === value)
      card.hidden = !match
      if (match) shown++
    }
    count.textContent = count.dataset.template
      .replace('{shown}', shown)
      .replace('{total}', cards.length)
    empty.hidden = shown > 0
  }

  filters.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip')
    if (!chip) return
    const { facet, value } = chip.dataset
    if (active[facet] === value) delete active[facet]
    else active[facet] = value
    for (const other of filters.querySelectorAll(`[data-facet="${facet}"]`)) {
      other.setAttribute('aria-pressed', String(active[facet] === other.dataset.value))
    }
    apply()
  })

  document.querySelector('[data-clear-filters]').addEventListener('click', () => {
    for (const key in active) delete active[key]
    for (const chip of filters.querySelectorAll('.chip')) chip.setAttribute('aria-pressed', 'false')
    apply()
  })

  apply()
}

// Print button on pattern pages (hidden until JS can use it)
for (const button of document.querySelectorAll('[data-print]')) {
  button.hidden = false
  button.addEventListener('click', () => window.print())
}
