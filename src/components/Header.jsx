import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const ALL_TOOLS = [
  {
    category: 'PDF & Dokumen',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950',
    items: [
      { label: 'Convert File', desc: 'DOCX, PDF, XLSX, PPTX', href: '/' },
      { label: 'Merge PDF', desc: 'Gabungkan beberapa PDF', href: '/?tab=merge' },
    ],
  },
  {
    category: 'Image Tools',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950',
    items: [
      { label: 'Image Compressor', desc: 'Kompres JPG, PNG, WebP', href: '/tools/image/compress' },
    ],
  },
  {
    category: 'Developer Tools',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950',
    items: [
      { label: 'JSON Formatter', desc: 'Format, minify, validasi JSON', href: '/tools/developer/json' },
    ],
  },
  {
    category: 'Generators',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    items: [
      { label: 'QR Generator', desc: 'Buat QR Code dari URL/teks', href: '/tools/generator/qr' },
    ],
  },
]

const PRICING = [
  { plan: 'Gratis', price: 'Rp 0', features: ['25 konversi/hari', 'Maks 50MB per file', 'Format standar'], highlight: false },
  { plan: 'Pro', price: 'Rp 49.000/bln', features: ['Unlimited konversi', 'Maks 200MB per file', 'Semua format', 'Prioritas server'], highlight: true },
  { plan: 'Enterprise', price: 'Hubungi kami', features: ['Unlimited segalanya', 'API akses penuh', 'SLA & support 24/7', 'On-premise tersedia'], highlight: false },
]

const FAQS = [
  { q: 'Apakah file saya aman?', a: 'Ya. File diproses di server lokal (LibreOffice) dan tidak pernah dikirim ke pihak ketiga kecuali untuk konversi tertentu yang membutuhkan CloudConvert.' },
  { q: 'Format apa saja yang didukung?', a: 'DOCX, DOC, PDF, PPTX, PPT, XLSX, XLS, ODT, PNG, JPG, WebP, dan masih terus bertambah.' },
  { q: 'Berapa batas ukuran file?', a: 'Maksimal 50MB per file untuk akun gratis.' },
  { q: 'Apakah hasil konversi akurat?', a: 'Ya, kami menggunakan LibreOffice engine yang sama dengan converter profesional.' },
  { q: 'Apakah perlu install sesuatu?', a: 'Tidak perlu install apapun di browser.' },
]

function Dropdown({ label, children, open, onToggle, align = 'left', center = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onToggle])

  const posClass = center
    ? 'left-1/2 -translate-x-1/2'
    : align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => onToggle(!open)}
        className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#4f46e5] ${open ? 'bg-slate-100 dark:bg-slate-700 text-[#4f46e5]' : 'text-slate-600 dark:text-slate-300'}`}
      >
        {label}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className={`absolute top-full z-50 mt-2 w-max rounded-[20px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-xl ${posClass}`}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function Header({ onStartClick, dark, onToggleDark }) {
  const [openMenu, setOpenMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const toggle = (name) => (val) => setOpenMenu(val ? name : null)

  const handleToolClick = (href) => {
    setOpenMenu(null)
    setMobileOpen(false)
    if (href === '/?tab=merge') {
      navigate('/', { state: { tab: 'merge' } })
    } else {
      navigate(href)
    }
  }

  return (
    <header className="rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-2xl overflow-hidden shadow-md">
            <img src="/logo.png" alt="OmniConverter" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-semibold leading-tight dark:text-white">OmniConverter</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">All-in-One Online Tools</p>
          </div>
        </Link>

        {/* Mobile buttons */}
        <div className="flex items-center gap-2 sm:hidden">
          <button type="button" onClick={onToggleDark} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300">
            {dark
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">

          {/* Tools dropdown */}
          <Dropdown label="Tools" open={openMenu === 'tools'} onToggle={toggle('tools')} center>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Semua Tools</p>
            <div className="grid grid-cols-2 gap-3 min-w-[480px]">
              {ALL_TOOLS.map((cat) => (
                <div key={cat.category}>
                  <p className={`mb-1.5 text-xs font-bold uppercase tracking-wider ${cat.color}`}>{cat.category}</p>
                  <div className="space-y-0.5">
                    {cat.items.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleToolClick(item.href)}
                        className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition hover:bg-[#eef2ff] dark:hover:bg-slate-700"
                      >
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${cat.bg}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${cat.color}`}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Dropdown>

          {/* Pricing dropdown */}
          <Dropdown label="Pricing" open={openMenu === 'pricing'} onToggle={toggle('pricing')} align="right">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Pilihan Paket</p>
            <div className="flex gap-3">
              {PRICING.map((p) => (
                <div key={p.plan} className={`w-44 rounded-[16px] border p-4 ${p.highlight ? 'border-[#4f46e5] bg-[#eef2ff] dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'}`}>
                  {p.highlight && <span className="mb-2 inline-block rounded-full bg-[#4f46e5] px-2 py-0.5 text-xs font-semibold text-white">Populer</span>}
                  <p className="font-semibold text-slate-900 dark:text-white">{p.plan}</p>
                  <p className={`mt-1 text-sm font-bold ${p.highlight ? 'text-[#4f46e5]' : 'text-slate-700 dark:text-slate-300'}`}>{p.price}</p>
                  <ul className="mt-3 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 flex-shrink-0 text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Dropdown>

          {/* FAQ dropdown */}
          <Dropdown label="FAQ" open={openMenu === 'faq'} onToggle={toggle('faq')} align="right">
            <div className="w-80 space-y-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Pertanyaan Umum</p>
              {FAQS.map((f) => (
                <div key={f.q} className="rounded-[12px] bg-slate-50 dark:bg-slate-700 p-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{f.q}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{f.a}</p>
                </div>
              ))}
            </div>
          </Dropdown>

          {/* Dark mode */}
          <button
            type="button"
            onClick={onToggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-600"
          >
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => onStartClick?.()}
            className="ml-1 rounded-full bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
          >
            Mulai Gratis
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-700 pt-4 sm:hidden">
          <p className="px-3 text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Tools</p>
          {ALL_TOOLS.flatMap((cat) => cat.items).map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleToolClick(item.href)}
              className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setMobileOpen(false); onStartClick?.() }}
            className="mt-2 rounded-full bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Mulai Gratis
          </button>
        </div>
      )}
    </header>
  )
}
