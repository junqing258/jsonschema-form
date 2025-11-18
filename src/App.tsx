import { Routes, Route } from 'react-router-dom'
// import { Routes } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import HomePage from '@/pages/index'
import FormBuilderPage from '@/pages/form-builder'
import FormBuilderV2Page from '@/pages/form-builder2'
import LoginPage from '@/pages/login'
import FormPage from '@/pages/form-page'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/form-builder" element={<FormBuilderPage />} />
        <Route path="/form-builder2" element={<FormBuilderV2Page />} />
        <Route path="/form-page" element={<FormPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster richColors position="top-right" expand={true} />
    </>
  )
}

export default App
