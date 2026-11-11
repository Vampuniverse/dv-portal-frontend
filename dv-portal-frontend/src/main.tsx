import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import StaffPortal from './StaffPortal.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main public application route */}
        <Route path="/" element={<App />} />
        
        {/* Secret/Private Staff Portal sublink */}
        <Route path="/staff" element={<StaffPortal />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)