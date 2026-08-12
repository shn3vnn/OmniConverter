import { Link, useNavigate } from 'react-router-dom'

export default function ToolLayout({ children, breadcrumb }) {
  const navigate = useNavigate()

  // breadcrumb = [{ label: 'Home', href: '/' }, { label: 'Image Tools' }, { label: 'Image Compressor' }]
  return (
    <div className="mt-4 space-y-1">
      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali
        </button>

        <nav className="flex items-center gap-1 text-xs text-slate-400">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {item.href ? (
                <Link to={item.href} className="hover:text-[#4f46e5] transition">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {children}
    </div>
  )
}
