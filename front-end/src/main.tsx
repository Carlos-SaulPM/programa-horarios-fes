import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HorariosProvider } from './context/HorariosContext.tsx'
import { TemaProvider } from './context/TemaContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider>
      <HorariosProvider>
        <App />
      </HorariosProvider>
    </TemaProvider>
  </StrictMode>,
)