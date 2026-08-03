export default function EngineStatus({ engine, onRecheck }) {
  const config = {
    checking: { dot: 'bg-slate-300 animate-pulse', text: 'Memeriksa engine...', badge: 'bg-slate-100 text-slate-500' },
    local:    { dot: 'bg-emerald-500', text: 'LibreOffice (Lokal)', badge: 'bg-emerald-50 text-emerald-700' },
    cloud:    { dot: 'bg-blue-500', text: 'CloudConvert (API)', badge: 'bg-blue-50 text-blue-700' },
    offline:  { dot: 'bg-red-500 animate-pulse', text: 'Tidak ada engine aktif', badge: 'bg-red-50 text-red-600' },
  }

  const { dot, text, badge } = config[engine] || config.checking

  return (
    <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Engine Status</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}>{text}</span>
        </div>
        <button
          type="button"
          onClick={onRecheck}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {engine === 'offline' && (
        <p className="mt-3 text-xs text-red-500">
          Jalankan backend: <code className="font-mono bg-red-50 dark:bg-red-950 px-1 rounded">node server.js</code> atau tambahkan API key CloudConvert di .env
        </p>
      )}
      {engine === 'cloud' && (
        <p className="mt-3 text-xs text-slate-400">
          Untuk konversi lebih akurat & private, jalankan backend lokal.
        </p>
      )}
    </div>
  )
}
