import { useRef, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMultiConverter } from '../hooks/useMultiConverter'
import { useEngineStatus } from '../hooks/useEngineStatus'
import DropZone from '../components/DropZone'
import FileList from '../components/FileList'
import EngineStatus from '../components/EngineStatus'
import MergePdf from '../components/MergePdf'

const CATEGORIES = [
  {
    id: 'pdf',
    label: 'PDF & Dokumen',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-100 dark:border-red-900',
    tools: [
      { label: 'Convert File', desc: 'DOCX, PDF, XLSX, PPTX dan lainnya', href: '/', internal: true },
      { label: 'Merge PDF', desc: 'Gabungkan beberapa PDF jadi satu', href: '/', tab: 'merge', internal: true },
    ],
  },
  {
    id: 'image',
    label: 'Image Tools',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950',
    border: 'border-sky-100 dark:border-sky-900',
    tools: [
      { label: 'Image Compressor', desc: 'Kompres JPG, PNG, WebP di browser', href: '/tools/image/compress' },
    ],
  },
  {
    id: 'developer',
    label: 'Developer Tools',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950',
    border: 'border-violet-100 dark:border-violet-900',
    tools: [
      { label: 'JSON Formatter', desc: 'Format, minify, dan validasi JSON', href: '/tools/developer/json' },
    ],
  },
  {
    id: 'generators',
    label: 'Generators',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-100 dark:border-emerald-900',
    tools: [
      { label: 'QR Generator', desc: 'Buat QR Code dari URL atau teks', href: '/tools/generator/qr' },
    ],
  },
]

export default function HomePage({ fileInputRef: externalRef }) {
  const { items, isConverting, zipUrl, doneCount, errorCount, addFiles, removeItem, setFormat, convertAll, reset } = useMultiConverter()
  const [isDragging, setIsDragging] = useState(false)
  const internalRef = useRef(null)
  const fileInputRef = externalRef || internalRef
  const { engine, recheck } = useEngineStatus()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('convert')
  const [search, setSearch] = useState('')

  // Support navigasi ke tab merge dari Header
  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab)
  }, [location.state])

  const allTools = CATEGORIES.flatMap((c) => c.tools.map((t) => ({ ...t, category: c.label, color: c.color, bg: c.bg, border: c.border })))
  const filtered = search.trim()
    ? allTools.filter((t) => t.label.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
    : []

  const hasFiles = items.length > 0
  const allDone = hasFiles && items.every((it) => it.status === 'done' || it.status === 'error')

  const TABS = [
    { id: 'convert', label: 'Convert File', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
    { id: 'merge', label: 'Merge PDF', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg> },
  ]

  return (
    <>
      {/* Hero + Search */}
      <div className="mt-5 rounded-[30px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4f46e5]">All-in-One Online Tools</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          Everything you need, in one place.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
          Convert, compress, generate, and simplify your everyday tasks.
        </p>
        {/* Search */}
        <div className="relative mt-6 max-w-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-[#4f46e5] transition"
          />
        </div>
        {/* Search results */}
        {filtered.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filtered.map((t) => (
              <Link
                key={t.label}
                to={t.href}
                onClick={() => { setSearch(''); if (t.tab) setActiveTab(t.tab) }}
                className={`flex items-center gap-2 rounded-full border ${t.border} ${t.bg} px-3 py-1.5 text-sm font-medium ${t.color} transition hover:opacity-80`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        )}
        {search.trim() && filtered.length === 0 && (
          <p className="mt-3 text-sm text-slate-400">Tidak ada tools yang cocok dengan "{search}".</p>
        )}
      </div>

      {/* Category Grid */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className={`rounded-[24px] border ${cat.border} ${cat.bg} p-4`}>
            <p className={`text-xs font-bold uppercase tracking-widest ${cat.color}`}>{cat.label}</p>
            <div className="mt-3 space-y-2">
              {cat.tools.map((tool) => (
                <Link
                  key={tool.label}
                  to={tool.href}
                  onClick={() => { if (tool.tab) setActiveTab(tool.tab) }}
                  className="flex items-start gap-2 rounded-[14px] bg-white/70 dark:bg-slate-800/70 p-3 transition hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${cat.color}`}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{tool.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="mt-5 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <main className="mt-4 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          {activeTab === 'merge' ? <MergePdf /> : (<>
          {/* Hero */}
          <div className="rounded-[30px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4f46e5]">File converter</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
              Konversi file Anda dengan cepat, aman, dan tanpa kerumitan.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Unggah satu atau beberapa file sekaligus, pilih format target, dan dapatkan hasil siap unduh dalam hitungan detik.
            </p>
          </div>

          <DropZone
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            onFilesAdd={addFiles}
            fileInputRef={fileInputRef}
            compact={hasFiles}
          />

          {hasFiles && (
            <FileList
              items={items}
              isConverting={isConverting}
              onRemove={removeItem}
              onFormatChange={setFormat}
            />
          )}
        </>)}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Status proses</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {allDone ? 'Selesai' : isConverting ? 'Memproses...' : 'Siap'}
                </h2>
              </div>
              <div className={`rounded-full px-3 py-1 text-sm font-semibold ${
                allDone ? 'bg-emerald-50 text-emerald-700' :
                isConverting ? 'bg-amber-50 text-amber-600' :
                'bg-[#eef2ff] text-[#4f46e5]'
              }`}>
                {hasFiles ? `${items.length} file` : 'Belum ada file'}
              </div>
            </div>

            <div className="mt-4 rounded-[20px] border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
              {!hasFiles ? (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500">Pilih file untuk memulai konversi.</p>
              ) : allDone ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-emerald-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">{doneCount} file berhasil dikonversi</span>
                  </div>
                  {errorCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-red-400">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      <span className="text-slate-500">{errorCount} file gagal</span>
                    </div>
                  )}
                  {zipUrl && doneCount > 1 && (
                    <a
                      href={zipUrl}
                      download="converted_files.zip"
                      className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#4f46e5] py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Unduh Semua (ZIP)
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={reset}
                    className="w-full rounded-[14px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    Konversi File Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {items.filter((it) => it.status === 'idle').length} file menunggu dikonversi
                  </div>
                  <button
                    type="button"
                    onClick={convertAll}
                    disabled={isConverting || !hasFiles}
                    className="w-full rounded-[14px] bg-[#4f46e5] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isConverting ? 'Memproses...' : `Konversi ${items.length} File`}
                  </button>
                  {hasFiles && !isConverting && (
                    <button
                      type="button"
                      onClick={reset}
                      className="w-full rounded-[14px] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition hover:bg-slate-50"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <EngineStatus engine={engine} onRecheck={recheck} />

          <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Kenapa tim memilih OmniConvert?</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Konversi beberapa file sekaligus</li>
              <li>• Engine LibreOffice hasil akurat & professional</li>
              <li>• File tidak pernah keluar dari perangkat kamu</li>
            </ul>
          </div>
        </aside>
      </main>
    </>
  )
}
