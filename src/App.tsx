import { Route, Routes } from 'react-router-dom'

import HomePage from '@/pages/index'
import LoginPage from '@/pages/login'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster richColors position="top-right" expand={true} />
    </>
  )
}

export default App
