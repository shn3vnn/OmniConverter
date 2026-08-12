import { useRef, useState } from 'react'
import { useMultiConverter } from '../hooks/useMultiConverter'
import { useEngineStatus } from '../hooks/useEngineStatus'
import DropZone from '../components/DropZone'
import FileList from '../components/FileList'
import EngineStatus from '../components/EngineStatus'
import MergePdf from '../components/MergePdf'

export default function HomePage({ fileInputRef: externalRef }) {
  const { items, isConverting, zipUrl, doneCount, errorCount, addFiles, removeItem, setFormat, convertAll, reset } = useMultiConverter()
  const [isDragging, setIsDragging] = useState(false)
  const internalRef = useRef(null)
  const fileInputRef = externalRef || internalRef
  const { engine, recheck } = useEngineStatus()
  const [activeTab, setActiveTab] = useState('convert')

  const hasFiles = items.length > 0
  const allDone = hasFiles && items.every((it) => it.status === 'done' || it.status === 'error')

  const TABS = [
    { id: 'convert', label: 'Convert File', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
    { id: 'merge', label: 'Merge PDF', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg> },
  ]

  return (
    <>
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
