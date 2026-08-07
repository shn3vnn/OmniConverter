import { formatBytes } from '../utils/formatBytes'

// Semua format yang ada
const ALL_FORMATS = ['PDF', 'DOCX', 'DOC', 'ODT', 'TXT', 'PPT', 'PPTX', 'XLS', 'XLSX', 'CSV', 'PNG', 'JPG', 'JPEG', 'WEBP']

// Format yang didukung per ekstensi
const SUPPORTED_FORMATS = {
  docx: ['pdf', 'doc', 'odt', 'txt'],
  doc:  ['pdf', 'docx', 'odt'],
  pdf:  ['docx'],
  pptx: ['pdf', 'ppt'],
  ppt:  ['pdf', 'pptx'],
  xlsx: ['pdf', 'xls', 'csv'],
  xls:  ['pdf', 'xlsx', 'csv'],
  png:  ['webp', 'jpg', 'jpeg'],
  jpg:  ['webp', 'png', 'jpeg'],
  jpeg: ['webp', 'png', 'jpg'],
  webp: ['png', 'jpg', 'jpeg'],
}

function getFormatOptions(ext) {
  const supported = SUPPORTED_FORMATS[ext] || []
  return ALL_FORMATS.map((f) => ({
    value: f.toLowerCase(),
    label: f,
    disabled: !supported.includes(f.toLowerCase()),
  }))
}

const STATUS_CONFIG = {
  idle:       { bar: 'bg-slate-200', text: 'text-slate-400', label: 'Menunggu' },
  converting: { bar: 'bg-[#4f46e5]', text: 'text-[#4f46e5]', label: 'Memproses...' },
  done:       { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Selesai' },
  error:      { bar: 'bg-red-400', text: 'text-red-500', label: 'Gagal' },
}

function FileIcon({ ext }) {
  if (ext === 'pdf') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-red-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/>
    </svg>
  )
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-sky-500">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-[#4f46e5]">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
    </svg>
  )
}

export default function FileList({ items, isConverting, onRemove, onFormatChange }) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const ext = item.file.name.split('.').pop()?.toLowerCase()
        const formats = getFormatOptions(ext)
        const cfg = STATUS_CONFIG[item.status]

        return (
          <div key={item.id} className="rounded-[18px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700">
                <FileIcon ext={ext} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white max-w-[160px] sm:max-w-none">{item.file.name}</p>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {/* Format selector */}
                    {item.status === 'idle' && (
                      <select
                        value={item.targetFormat}
                        onChange={(e) => onFormatChange(item.id, e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                      >
                        {formats.map((f) => (
                          <option key={f.value} value={f.value} disabled={f.disabled}>
                            {f.disabled ? `${f.label} (tidak didukung)` : f.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Done: format badge + download */}
                    {item.status === 'done' && (
                      <>
                        <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          → {item.targetFormat.toUpperCase()}
                        </span>
                        <a
                          href={item.downloadUrl}
                          download={item.convertedName}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Unduh
                        </a>
                      </>
                    )}

                    {/* Remove button */}
                    {!isConverting && (
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Size + status */}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-slate-400">{formatBytes(item.file.size)}</span>
                  <span className={`text-xs font-medium ${cfg.text}`}>
                    {item.status === 'done' ? item.convertedSize : cfg.label}
                  </span>
                  {item.status === 'error' && (
                    <span className="truncate text-xs text-red-400">{item.error}</span>
                  )}
                </div>

                {/* Progress bar */}
                {(item.status === 'converting' || item.status === 'done') && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${cfg.bar}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
