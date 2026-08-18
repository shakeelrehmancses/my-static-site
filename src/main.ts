import './style.css'

const app: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('The application container was not found.')
}

type Filter = 'all' | 'active' | 'completed'

interface Todo {
  id: number
  title: string
  completed: boolean
}

const STORAGE_KEY = 'my-static-site-todos'
const initialTodos: Todo[] = [
  { id: 1, title: 'Make a plan for the week', completed: false },
  { id: 2, title: 'Celebrate a small win', completed: true },
]

const readTodos = (): Todo[] => {
  const savedTodos: string | null = localStorage.getItem(STORAGE_KEY)

  if (!savedTodos) {
    return initialTodos
  }

  try {
    const parsedTodos: unknown = JSON.parse(savedTodos)
    return Array.isArray(parsedTodos) ? parsedTodos as Todo[] : initialTodos
  } catch {
    return initialTodos
  }
}

let todos: Todo[] = readTodos()
let activeFilter: Filter = 'all'

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="/">Daylist</a>
    <button class="theme-button" type="button" aria-label="Toggle dark mode" aria-pressed="false">◐</button>
  </header>
  <main>
    <section class="todo-section" aria-labelledby="todo-title">
      <div class="intro">
        <p class="eyebrow">Your daily focus</p>
        <h1 id="todo-title">A little less<br><em>to do.</em></h1>
        <p class="subtitle">Keep the important things close, and let the rest wait.</p>
      </div>
      <form class="todo-form" id="todo-form">
        <label class="sr-only" for="todo-input">Add a task</label>
        <input id="todo-input" name="todo" type="text" maxlength="120" placeholder="What needs doing?" autocomplete="off" required>
        <button type="submit">Add task <span aria-hidden="true">+</span></button>
      </form>
      <div class="todo-toolbar">
        <span id="task-count" aria-live="polite"></span>
        <div class="filters" role="group" aria-label="Filter tasks">
          <button class="filter-button" type="button" data-filter="all">All</button>
          <button class="filter-button" type="button" data-filter="active">Open</button>
          <button class="filter-button" type="button" data-filter="completed">Done</button>
        </div>
      </div>
      <ul class="todo-list" id="todo-list" aria-live="polite"></ul>
    </section>
  </main>
`

const form = app.querySelector<HTMLFormElement>('#todo-form')
const input = app.querySelector<HTMLInputElement>('#todo-input')
const list = app.querySelector<HTMLUListElement>('#todo-list')
const count = app.querySelector<HTMLSpanElement>('#task-count')
const themeButton = app.querySelector<HTMLButtonElement>('.theme-button')

if (!form || !input || !list || !count || !themeButton) {
  throw new Error('The required to-do app elements were not found.')
}

const saveTodos = (): void => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character: string): string => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}[character] ?? character))

const render = (): void => {
  const visibleTodos: Todo[] = todos.filter((todo: Todo): boolean => {
    if (activeFilter === 'active') return !todo.completed
    if (activeFilter === 'completed') return todo.completed
    return true
  })
  const openCount: number = todos.filter((todo: Todo): boolean => !todo.completed).length

  count.textContent = `${openCount} ${openCount === 1 ? 'task' : 'tasks'} left`
  list.innerHTML = visibleTodos.length === 0
    ? '<li class="empty-state">Nothing here yet.</li>'
    : visibleTodos.map((todo: Todo): string => `
      <li class="todo-item ${todo.completed ? 'is-complete' : ''}" data-id="${todo.id}">
        <button class="check-button" type="button" aria-label="Mark ${escapeHtml(todo.title)} as ${todo.completed ? 'open' : 'complete'}" aria-pressed="${todo.completed}">${todo.completed ? '✓' : ''}</button>
        <span>${escapeHtml(todo.title)}</span>
        <button class="delete-button" type="button" aria-label="Delete ${escapeHtml(todo.title)}">×</button>
      </li>
    `).join('')

  app.querySelectorAll<HTMLButtonElement>('.filter-button').forEach((button: HTMLButtonElement): void => {
    const isSelected: boolean = button.dataset.filter === activeFilter
    button.classList.toggle('is-selected', isSelected)
    button.setAttribute('aria-pressed', String(isSelected))
  })
}

form.addEventListener('submit', (event: SubmitEvent): void => {
  event.preventDefault()
  const title: string = input.value.trim()
  if (!title) return

  todos = [{ id: Date.now(), title, completed: false }, ...todos]
  saveTodos()
  input.value = ''
  render()
  input.focus()
})

list.addEventListener('click', (event: MouseEvent): void => {
  const target: HTMLElement = event.target as HTMLElement
  const item: HTMLElement | null = target.closest<HTMLElement>('.todo-item')
  if (!item) return
  const id: number = Number(item.dataset.id)

  if (target.closest('.check-button')) {
    todos = todos.map((todo: Todo): Todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
  } else if (target.closest('.delete-button')) {
    todos = todos.filter((todo: Todo): boolean => todo.id !== id)
  }

  saveTodos()
  render()
})

app.querySelectorAll<HTMLButtonElement>('.filter-button').forEach((button: HTMLButtonElement): void => {
  button.addEventListener('click', (): void => {
    activeFilter = button.dataset.filter as Filter
    render()
  })
})

themeButton.addEventListener('click', (): void => {
  const isDarkMode: boolean = document.body.classList.toggle('dark-mode')
  themeButton.setAttribute('aria-pressed', String(isDarkMode))
})

render()
