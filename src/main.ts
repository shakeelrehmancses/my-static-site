import './style.css'

const app: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('The application container was not found.')
}

const contentSection: HTMLElement | null = app.querySelector<HTMLElement>('#content')
const header: HTMLElement | null = app.querySelector<HTMLElement>('.site-header')

if (!contentSection || !header) {
  throw new Error('The required page structure was not found.')
}

contentSection.innerHTML = `
  <div class="welcome-content">
    <h1 id="welcome-title">A thoughtful place to begin.</h1>
    <p>Welcome to your new static site. A small, clear foundation for building something useful on the web.</p>
  </div>
`

const themeButton: HTMLButtonElement = document.createElement('button')
themeButton.type = 'button'
themeButton.textContent = 'Toggle dark mode'
themeButton.setAttribute('aria-pressed', 'false')
header.append(themeButton)

themeButton.addEventListener('click', (): void => {
  const isDarkMode: boolean = document.body.classList.toggle('dark-mode')
  themeButton.setAttribute('aria-pressed', String(isDarkMode))
})
