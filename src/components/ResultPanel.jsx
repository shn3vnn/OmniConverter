export default function ResultPanel({ isProcessing, isComplete, progress, error, convertedName, convertedSize, downloadUrl, onReset }) {
  const statusLabel = isComplete ? 'Selesai' : isProcessing ? 'Memproses' : 'Siap'
  const statusClass = isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-[#eef2ff] text-[#4f46e5]'

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Status proses</p>
          <h2 className="text-xl font-semibold text-slate-900">Processing & Result</h2>
        </div>
        <div className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass}`}>
          {statusLabel}
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] p-5">
        {isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="spinner" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-[#4f46e5] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-slate-600">Sedang memproses... {progress}%</p>
          </div>
        ) : isComplete ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600 shadow-sm">✓</div>
            </div>
            <div className="rounded-[18px] border border-emerald-200 bg-white/80 p-4">
              <p className="text-sm text-slate-500">File berhasil dikonversi</p>
              <p className="mt-2 font-semibold text-slate-900">{convertedName}</p>
              <p className="mt-1 text-sm text-slate-500">{convertedSize}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={downloadUrl}
                download={convertedName}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
              >
                Unduh File
              </a>
              <button type="button" onClick={onReset} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                Konversi File Lain
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600 shadow-sm">⚠</div>
            </div>
            <div className="rounded-[18px] border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">Konversi gagal</p>
              <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
            <button type="button" onClick={onReset} className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
              Coba File Lain
            </button>
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
            Pilih file dan klik tombol konversi untuk melihat hasil di panel ini.
          </div>
        )}
      </div>
    </div>
  )
}
