import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import { formatBytes } from '../utils/formatBytes'

function DragHandle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-300">
      <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export default function MergePdf() {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [mergedSize, setMergedSize] = useState('')
  const [error, setError] = useState('')
  const [dragOverId, setDragOverId] = useState(null)
  const fileInputRef = useRef(null)
  const dragItemId = useRef(null)

  const addFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter((f) => f.name.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) return
    setFiles((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ id: `${Date.now()}-${Math.random()}`, file: f })),
    ])
    setDownloadUrl(null)
    setError('')
  }

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setDownloadUrl(null)
  }

  // Drag to reorder
  const onDragStart = (id) => { dragItemId.current = id }
  const onDragEnter = (id) => setDragOverId(id)
  const onDragEnd = () => {
    if (!dragItemId.current || !dragOverId || dragItemId.current === dragOverId) {
      setDragOverId(null)
      return
    }
    setFiles((prev) => {
      const arr = [...prev]
      const fromIdx = arr.findIndex((f) => f.id === dragItemId.current)
      const toIdx = arr.findIndex((f) => f.id === dragOverId)
      const [moved] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, moved)
      return arr
    })
    dragItemId.current = null
    setDragOverId(null)
  }

  const merge = async () => {
    if (files.length < 2) return
    setIsMerging(true)
    setError('')
    setDownloadUrl(null)

    try {
      const merged = await PDFDocument.create()

      for (const { file } of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await merged.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((p) => merged.addPage(p))
      }

      const bytes = await merged.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setMergedSize(formatBytes(blob.size))
    } catch (err) {
      setError('Gagal menggabungkan PDF. Pastikan semua file adalah PDF yang valid.')
    } finally {
      setIsMerging(false)
    }
  }

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setFiles([])
    setDownloadUrl(null)
    setMergedSize('')
    setError('')
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-[30px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4f46e5]">Merge PDF</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          Gabungkan beberapa PDF menjadi satu file.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
          Upload beberapa file PDF, atur urutan sesuai keinginan, lalu gabungkan dalam satu klik. Semua diproses lokal di browser kamu.
        </p>
      </div>

      {/* Drop zone */}
      <label
        className={`dropzone ${isDragging ? 'is-active' : ''} ${files.length > 0 ? 'cursor-pointer' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
        />
        {files.length > 0 ? (
          <div className="flex items-center justify-center gap-2 px-5 py-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[#4f46e5]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="text-sm font-semibold text-[#4f46e5]">Tambah PDF lagi</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 text-[#4f46e5]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">Seret file PDF di sini atau</h2>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click() }}
              className="mt-4 rounded-full bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
            >
              Pilih File PDF
            </button>
            <p className="mt-3 text-sm text-slate-500">Hanya file PDF • Bisa pilih beberapa sekaligus</p>
          </div>
        )}
      </label>

      {/* File list — draggable untuk reorder */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Urutan halaman — seret untuk mengatur ulang
          </p>
          {files.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(item.id)}
              onDragEnter={() => onDragEnter(item.id)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`flex items-center gap-3 rounded-[18px] border bg-white dark:bg-slate-800 p-4 shadow-sm transition cursor-grab active:cursor-grabbing ${
                dragOverId === item.id ? 'border-[#4f46e5] bg-[#eef2ff] dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <DragHandle />
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-500">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(item.file.size)}</p>
              </div>
              {!isMerging && (
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tombol Merge */}
      {files.length >= 2 && !downloadUrl && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={merge}
            disabled={isMerging}
            className="flex flex-1 items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMerging ? (
              <><div className="spinner !h-4 !w-4 !border-2" />Menggabungkan...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="10" x2="12" y2="16"/>
                </svg>
                Gabungkan {files.length} PDF
              </>
            )}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-[18px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50"
          >
            Hapus Semua
          </button>
        </div>
      )}

      {files.length === 1 && (
        <p className="text-center text-sm text-slate-400">Tambahkan minimal 1 file PDF lagi untuk mulai menggabungkan.</p>
      )}
      {error && (
        <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-800">PDF berhasil digabungkan!</p>
              <p className="text-sm text-emerald-600">{files.length} file • {mergedSize}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href={downloadUrl}
              download="merged.pdf"
              className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Unduh merged.pdf
            </a>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100"
            >
              Mulai Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
