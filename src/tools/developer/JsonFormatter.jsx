import { useState, useCallback } from 'react'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [validMsg, setValidMsg] = useState('')

  const clearMessages = () => { setError(''); setValidMsg('') }

  const format = useCallback(() => {
    clearMessages()
    if (!input.trim()) { setError('Input kosong. Masukkan JSON terlebih dahulu.'); return }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch (e) {
      setError(`JSON tidak valid: ${e.message}`)
      setOutput('')
    }
  }, [input])

  const minify = useCallback(() => {
    clearMessages()
    if (!input.trim()) { setError('Input kosong. Masukkan JSON terlebih dahulu.'); return }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
    } catch (e) {
      setError(`JSON tidak valid: ${e.message}`)
      setOutput('')
    }
  }, [input])

  const validate = useCallback(() => {
    clearMessages()
    if (!input.trim()) { setError('Input kosong. Masukkan JSON terlebih dahulu.'); return }
    try {
      JSON.parse(input)
      setValidMsg('JSON valid.')
    } catch (e) {
      setError(`JSON tidak valid: ${e.message}`)
    }
  }, [input])

  const copy = useCallback(async () => {
    const text = output || input
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Gagal menyalin ke clipboard.')
    }
  }, [output, input])

  const clear = () => {
    setInput('')
    setOutput('')
    clearMessages()
  }

  const charCount = input.length

  return (
    <div className="mt-5 space-y-5">
      {/* Hero */}
      <div className="rounded-[30px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4f46e5]">Developer Tools</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          JSON Formatter & Validator
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
          Format, minify, dan validasi JSON langsung di browser. Tidak ada data yang dikirim ke server.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Format', action: format, style: 'bg-[#4f46e5] text-white hover:bg-[#4338ca]' },
          { label: 'Minify', action: minify, style: 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700' },
          { label: 'Validate', action: validate, style: 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700' },
          { label: copied ? 'Tersalin!' : 'Copy', action: copy, style: `border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 ${copied ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}` },
          { label: 'Clear', action: clear, style: 'border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950' },
        ].map(({ label, action, style }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${style}`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-slate-400">{charCount.toLocaleString()} karakter</span>
      </div>

      {/* Editor area */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Input</p>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); clearMessages() }}
            placeholder={'{\n  "name": "Evan",\n  "age": 18\n}'}
            spellCheck={false}
            className="h-80 w-full resize-none rounded-[18px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 font-mono text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-[#4f46e5] transition"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Output</p>
          <textarea
            value={output}
            readOnly
            placeholder="Hasil akan muncul di sini..."
            spellCheck={false}
            className="h-80 w-full resize-none rounded-[18px] border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-4 font-mono text-sm text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-[18px] border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {validMsg && (
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 p-4 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 flex-shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {validMsg}
        </div>
      )}
    </div>
  )
}
