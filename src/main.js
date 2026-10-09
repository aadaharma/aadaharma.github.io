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
