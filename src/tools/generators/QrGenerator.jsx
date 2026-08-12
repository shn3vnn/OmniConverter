import { useState, useRef, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import ToolLayout from '../../components/ToolLayout'

export default function QrGenerator() {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)
  const canvasRef = useRef(null)

  const generate = useCallback(async () => {
    if (!text.trim()) { setError('Masukkan teks atau URL terlebih dahulu.'); return }
    setError('')
    try {
      await QRCode.toCanvas(canvasRef.current, text.trim(), {
        width: 300,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
      setGenerated(true)
    } catch {
      setError('Gagal membuat QR Code. Coba lagi.')
    }
  }, [text])

  // Auto-generate saat text berubah (debounced)
  useEffect(() => {
    if (!text.trim()) { setGenerated(false); return }
    const timer = setTimeout(generate, 400)
    return () => clearTimeout(timer)
  }, [text, generate])

  const download = () => {
    if (!canvasRef.current || !generated) return
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const clear = () => {
    setText('')
    setGenerated(false)
    setError('')
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, 300, 300)
  }

  return (
    <ToolLayout breadcrumb={[
      { label: 'Home', href: '/' },
      { label: 'Generators' },
      { label: 'QR Generator' },
    ]}>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-5">
        {/* Hero */}
        <div className="rounded-[30px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4f46e5]">Generators</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
            QR Code Generator
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Buat QR Code dari URL atau teks apapun. Langsung di browser, tanpa upload ke server.
          </p>
        </div>

        {/* Input */}
        <div className="rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              URL atau Teks
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com atau teks apapun..."
              rows={4}
              className="w-full resize-none rounded-[14px] border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-[#4f46e5] transition"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={generate}
              className="flex-1 rounded-[14px] bg-[#4f46e5] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
            >
              Generate QR
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-[14px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Sidebar — QR Preview */}
      <aside className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Preview QR Code</p>
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className={`rounded-[16px] border border-slate-100 dark:border-slate-700 bg-white p-4 transition ${!generated ? 'opacity-30' : ''}`}>
              <canvas ref={canvasRef} width={300} height={300} />
            </div>
            {!generated && (
              <p className="text-sm text-slate-400 dark:text-slate-500">QR Code akan muncul di sini</p>
            )}
            {generated && (
              <button
                type="button"
                onClick={download}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PNG
              </button>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Contoh Penggunaan</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• Link website atau landing page</li>
            <li>• Nomor WhatsApp: wa.me/628xxx</li>
            <li>• Teks atau pesan singkat</li>
            <li>• Email: mailto:email@example.com</li>
          </ul>
        </div>
      </aside>
    </div>
    </ToolLayout>
  )
}
