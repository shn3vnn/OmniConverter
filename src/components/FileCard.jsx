import { formatBytes } from '../utils/formatBytes'

const FORMAT_OPTIONS = {
  docx: [{ value: 'pdf', label: 'PDF' }, { value: 'doc', label: 'DOC' }, { value: 'odt', label: 'ODT' }, { value: 'txt', label: 'TXT' }],
  doc:  [{ value: 'pdf', label: 'PDF' }, { value: 'docx', label: 'DOCX' }, { value: 'odt', label: 'ODT' }],
  pdf:  [{ value: 'docx', label: 'DOCX' }],
  pptx: [{ value: 'pdf', label: 'PDF' }, { value: 'ppt', label: 'PPT' }],
  ppt:  [{ value: 'pdf', label: 'PDF' }, { value: 'pptx', label: 'PPTX' }],
  xlsx: [{ value: 'pdf', label: 'PDF' }, { value: 'xls', label: 'XLS' }, { value: 'csv', label: 'CSV' }],
  xls:  [{ value: 'pdf', label: 'PDF' }, { value: 'xlsx', label: 'XLSX' }, { value: 'csv', label: 'CSV' }],
  png:  [{ value: 'webp', label: 'WebP' }, { value: 'jpg', label: 'JPG' }, { value: 'jpeg', label: 'JPEG' }],
  jpg:  [{ value: 'webp', label: 'WebP' }, { value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' }],
  jpeg: [{ value: 'webp', label: 'WebP' }, { value: 'png', label: 'PNG' }, { value: 'jpg', label: 'JPG' }],
  webp: [{ value: 'png', label: 'PNG' }, { value: 'jpg', label: 'JPG' }, { value: 'jpeg', label: 'JPEG' }],
}

const FILE_ICON = {
  pdf:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-red-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/></svg>,
  docx: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-[#4f46e5]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  img:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-sky-500"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  default: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
}

function getIcon(ext) {
  if (ext === 'pdf') return FILE_ICON.pdf
  if (['docx', 'doc', 'odt', 'txt'].includes(ext)) return FILE_ICON.docx
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return FILE_ICON.img
  return FILE_ICON.default
}

export default function FileCard({ file, targetFormat, setTargetFormat, isProcessing, onConvert, onReset }) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const formats = FORMAT_OPTIONS[ext] || [{ value: 'pdf', label: 'PDF' }]

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8fafc]">
            {getIcon(ext)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{file.name}</p>
            <p className="text-sm text-slate-500">{formatBytes(file.size)} • Siap dikonversi</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          ✕ Hapus
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr]">
        <label className="rounded-[18px] border border-slate-200 bg-[#f8fafc] p-3">
          <span className="text-sm font-medium text-slate-600">Konversi ke</span>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="mt-2 w-full border-none bg-transparent text-sm font-semibold text-slate-900 outline-none"
          >
            {formats.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onConvert}
          disabled={isProcessing}
          className="rounded-[18px] bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isProcessing ? 'Memproses...' : 'Konversi Sekarang'}
        </button>
      </div>
    </div>
  )
}
