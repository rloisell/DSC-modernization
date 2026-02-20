import React from 'react'
import axios from 'axios'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@bcgov/bc-sans/css/BC_Sans.css'
import '@bcgov/design-tokens/css/variables.css'
import App from './App'
import './styles.css'

// Global axios interceptor: automatically attach X-User-Id header to every request
// when a user is logged in. This fixes 401 errors on admin API endpoints.
axios.interceptors.request.use(config => {
  try {
    const stored = localStorage.getItem('dsc_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (user && user.id) {
        config.headers = config.headers || {}
        config.headers['X-User-Id'] = user.id
      }
    }
  } catch (e) {
    // ignore parse errors
  }
  return config
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Hide the fallback UI (if present) once React has mounted.
try {
  const fb = document.getElementById('fallback');
  if (fb) fb.style.display = 'none';
} catch (e) {
  // ignore
}
