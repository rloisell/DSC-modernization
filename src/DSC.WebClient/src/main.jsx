import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@bcgov/bc-sans/css/BC_Sans.css'
import '@bcgov/design-tokens/css/variables.css'
import App from './App'
import './styles.css'

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
