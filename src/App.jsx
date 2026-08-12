import { useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDarkMode } from './hooks/useDarkMode'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ImageCompressor from './tools/image/ImageCompressor'
import JsonFormatter from './tools/developer/JsonFormatter'
import QrGenerator from './tools/generators/QrGenerator'
import './App.css'

function Layout({ children, dark, onToggleDark, onStartClick }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-[#0f172a] dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <Header onStartClick={onStartClick} dark={dark} onToggleDark={onToggleDark} />
        {children}
      </div>
    </div>
  )
}

function HomeWrapper({ dark, onToggleDark }) {
  const fileInputRef = useRef(null)
  return (
    <Layout dark={dark} onToggleDark={onToggleDark} onStartClick={() => fileInputRef.current?.click()}>
      <HomePage fileInputRef={fileInputRef} />
    </Layout>
  )
}

export default function App() {
  const { dark, toggle: toggleDark } = useDarkMode()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeWrapper dark={dark} onToggleDark={toggleDark} />} />
        <Route path="/tools" element={<HomeWrapper dark={dark} onToggleDark={toggleDark} />} />

        <Route
          path="/tools/image/compress"
          element={
            <Layout dark={dark} onToggleDark={toggleDark}>
              <ImageCompressor />
            </Layout>
          }
        />
        <Route
          path="/tools/developer/json"
          element={
            <Layout dark={dark} onToggleDark={toggleDark}>
              <JsonFormatter />
            </Layout>
          }
        />
        <Route
          path="/tools/generator/qr"
          element={
            <Layout dark={dark} onToggleDark={toggleDark}>
              <QrGenerator />
            </Layout>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<HomeWrapper dark={dark} onToggleDark={toggleDark} />} />
      </Routes>
    </BrowserRouter>
  )
}
