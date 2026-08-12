import { useState, useRef, useCallback } from 'react'
import { formatBytes } from '../../utils/formatBytes'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 20 * 1024 * 1024

function validateFile(file) {
  if (!ACCEPTED.includes(file.type)) return 'File harus berupa JPG, PNG, atau WebP.'
  if (file.size > MAX_SIZE) return 'Ukuran file melebihi batas 20 MB.'
  return null
}

async function compressImage(file, quality, outputFormat, maxWidth) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Hitung dimensi baru berdasarkan maxWidth
        let w = img.width
        let h = img.height
        if (maxWidth < 100 && w > maxWidth) {
          h = Math.round((h * maxWidth) / w)
          w = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        // Background putih untuk JPG (hindari transparansi jadi hitam)
        if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
        }
        ctx.drawImage(img, 0, 0, w, h)

        const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
        const mime = mimeMap[outputFormat] || 'image/jpeg'
        // PNG tidak pakai quality parameter (lossless), tapi resize tetap membantu
        const q = mime === 'image/png' ? undefined : quality / 100
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Gagal memproses gambar.')),
          mime,
          q
        )
      }
      img.onerror = () => reject(new Error('Gagal membaca gambar. Pastikan file tidak rusak.'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.readAsDataURL(file)
  })
}

const SIZE_PRESETS = [
  { label: 'Original', value: 99999 },
  { label: '1920px', value: 1920 },
  { label: '1280px', value: 1280 },
  { label: '800px', value: 800 },
  { label: '480px', value: 480 },
]

export default function ImageCompressor() {
  const [file, setFile] = useState(null)
  const [imgDimensions, setImgDimensions] = useState(null)
  const [preview, setPreview] = useState(null)
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState('jpg')
  const [maxWidth, setMaxWidth] = useState(99999)
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const resultUrlRef = useRef(null)

  const handleFile = useCallback((incoming) => {
    const f = incoming instanceof FileList ? incoming[0] : incoming
    if (!f) return
    const err = validateFile(f)
    if (err) { setError(err); return }
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
    setError('')
    setResult(null)
    setFile(f)
    // Default ke JPG untuk semua input (kompresi terbaik)
    setOutputFormat('jpg')
    setQuality(80)
    setMaxWidth(99999)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      // Baca dimensi asli
      const img = new Image()
      img.onload = () => setImgDimensions({ w: img.width, h: img.height })
      img.src = e.target.result
    }
    reader.readAsDataURL(f)
  }, [])

  const compress = async () => {
    if (!file) return
    setIsProcessing(true)
    setError('')
    setResult(null)
    try {
      const blob = await compressImage(file, quality, outputFormat, maxWidth)
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      const url = URL.createObjectURL(blob)
      resultUrlRef.current = url
      setResult({ blob, url, size: blob.size })
    } catch (err) {
      setError(err.message || 'Gagal mengompresi gambar.')
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
    resultUrlRef.current = null
    setFile(null)
    setPreview(null)
    setResult(null)
    setError('')
    setQuality(80)
    setMaxWidth(99999)
    setImgDimensions(null)
  }

  const savedPercent = result
    ? ((file.size - result.size) / file.size * 100).toFixed(1)
    : null
  const isLarger = result && result.size > file.size
  const outputName = file ? `${file.name.replace(/\.[^.]+$/, '')}_compressed.${outputFormat}` : ''
  const isPng = outputFormat === 'png'

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-5">
        {/* Hero */}
        <div className="rounded-[30px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4f46e5]">Image Tools</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
            Kompres gambar tanpa kehilangan kualitas berarti.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Upload JPG, PNG, atau WebP — atur kualitas dan ukuran, lalu unduh hasilnya. Semua diproses di browser.
          </p>
        </div>

        {/* Drop zone */}
        {!file ? (
          <label
            className={`dropzone ${isDragging ? 'is-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { handleFile(e.target.files); e.target.value = '' }}
            />
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-indigo-950 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 text-[#4f46e5]">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">Seret gambar di sini atau</h2>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click() }}
                className="mt-4 rounded-full bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
              >
                Pilih Gambar
              </button>
              <p className="mt-3 text-sm text-slate-500">JPG, PNG, WebP • Maks 20 MB</p>
            </div>
          </label>
        ) : (
          <div className="rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm space-y-4">
            {/* Preview */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Original</p>
                <div className="overflow-hidden rounded-[16px] border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <img src={preview} alt="Original" className="h-48 w-full object-contain" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(file.size)}</span>
                  {imgDimensions && <span className="ml-2">{imgDimensions.w}×{imgDimensions.h}px</span>}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Compressed</p>
                <div className="overflow-hidden rounded-[16px] border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  {result ? (
                    <img src={result.url} alt="Compressed" className="h-48 w-full object-contain" />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                      Tekan Kompres untuk melihat hasil
                    </div>
                  )}
                </div>
                {result && (
                  <p className={`text-sm font-semibold ${isLarger ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {formatBytes(result.size)} {isLarger ? '(lebih besar)' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Format & Max Width */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Format Output</p>
                  <select
                    value={outputFormat}
                    onChange={(e) => { setOutputFormat(e.target.value); setResult(null) }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="jpg">JPG (terkecil)</option>
                    <option value="webp">WebP (terkecil)</option>
                    <option value="png">PNG (lossless)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Maks Lebar</p>
                  <select
                    value={maxWidth}
                    onChange={(e) => { setMaxWidth(Number(e.target.value)); setResult(null) }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    {SIZE_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quality slider — disable kalau PNG */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-semibold ${isPng ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    Kualitas: {isPng ? 'N/A (PNG lossless)' : `${quality}%`}
                  </label>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  disabled={isPng}
                  onChange={(e) => { setQuality(Number(e.target.value)); setResult(null) }}
                  className="w-full accent-[#4f46e5] disabled:opacity-40"
                />
                {isPng && (
                  <p className="text-xs text-amber-500">
                    PNG adalah format lossless — quality slider tidak berpengaruh. Gunakan JPG atau WebP untuk kompresi lebih besar.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={compress}
                  disabled={isProcessing}
                  className="flex-1 rounded-[14px] bg-[#4f46e5] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Memproses...' : 'Kompres'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-[14px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-[18px] border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </section>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Hasil Kompresi</p>
          <div className="mt-4 rounded-[20px] border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
            {!file ? (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">Upload gambar untuk memulai.</p>
            ) : !result ? (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">Tekan Kompres untuk melihat hasil.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Original</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(file.size)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Compressed</span>
                  <span className={`font-semibold ${isLarger ? 'text-amber-500' : 'text-emerald-600'}`}>{formatBytes(result.size)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Saved</span>
                  <span className={`font-bold ${isLarger ? 'text-amber-500' : 'text-[#4f46e5]'}`}>
                    {isLarger ? `+${Math.abs(savedPercent)}% (lebih besar)` : `${savedPercent}%`}
                  </span>
                </div>
                {isLarger && (
                  <p className="text-xs text-amber-500">
                    Hasil lebih besar dari original. Coba turunkan kualitas atau pilih format JPG/WebP.
                  </p>
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-700" />
                <a
                  href={result.url}
                  download={outputName}
                  className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Unduh Hasil
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Tips Kompresi</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• Gunakan <span className="font-semibold text-[#4f46e5]">JPG atau WebP</span> untuk kompresi terbesar</li>
            <li>• Kualitas 70–80% sudah cukup untuk web</li>
            <li>• Kurangi lebar gambar jika tidak perlu resolusi penuh</li>
            <li>• PNG lossless — ukuran tidak bisa dikurangi dengan quality</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
