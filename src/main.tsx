import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const root = document.getElementById('root')!

try {
  const { default: App } = await import('./App.tsx')
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  root.innerHTML = `<div style="padding:24px;font-family:monospace;color:#dc2626">
    <h1>Error al cargar la aplicación</h1>
    <pre style="white-space:pre-wrap">${e instanceof Error ? `${e.message}\n${e.stack}` : String(e)}</pre>
  </div>`
}
