import { useState, useRef, useEffect } from 'react'

const TOOLS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-[#4f46e5]">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
    label: 'DOCX ke PDF', desc: 'Konversi Word ke PDF',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-red-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    ),
    label: 'PDF ke DOCX', desc: 'Konversi PDF ke Word',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-emerald-500">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
    label: 'XLSX ke PDF', desc: 'Konversi Excel ke PDF',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-orange-500">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
    label: 'PPTX ke PDF', desc: 'Konversi PowerPoint ke PDF',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-sky-500">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    label: 'JPG ke WebP', desc: 'Konversi gambar ke WebP',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-purple-500">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    label: 'PNG ke WebP', desc: 'Konversi PNG ke WebP',
  },
]

const PRICING = [
  { plan: 'Gratis', price: 'Rp 0', features: ['25 konversi/hari', 'Maks 50MB per file', 'Format standar'], highlight: false },
  { plan: 'Pro', price: 'Rp 49.000/bln', features: ['Unlimited konversi', 'Maks 200MB per file', 'Semua format', 'Prioritas server'], highlight: true },
  { plan: 'Enterprise', price: 'Hubungi kami', features: ['Unlimited segalanya', 'API akses penuh', 'SLA & support 24/7', 'On-premise tersedia'], highlight: false },
]

const FAQS = [
  { q: 'Apakah file saya aman?', a: 'Ya. File diproses di server lokal kamu sendiri (LibreOffice) dan tidak pernah dikirim ke pihak ketiga kecuali untuk konversi tertentu yang membutuhkan CloudConvert.' },
  { q: 'Format apa saja yang didukung?', a: 'DOCX, DOC, PDF, PPTX, PPT, XLSX, XLS, ODT, PNG, JPG, WebP, dan masih terus bertambah.' },
  { q: 'Berapa batas ukuran file?', a: 'Maksimal 50MB per file untuk akun gratis.' },
  { q: 'Apakah hasil konversi akurat?', a: 'Ya, kami menggunakan LibreOffice engine yang sama dengan converter profesional seperti iLovePDF dan Smallpdf.' },
  { q: 'Apakah perlu install sesuatu?', a: 'Tidak perlu install apapun di browser. Untuk konversi lokal yang lebih akurat, backend LibreOffice perlu dijalankan.' },
]

function Dropdown({ label, children, open, onToggle, align = 'left' }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onToggle])

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
        <div className={`absolute top-full z-50 mt-2 w-max rounded-[20px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function Header({ onStartClick, dark, onToggleDark }) {
  const [openMenu, setOpenMenu] = useState(null)
  const toggle = (name) => (val) => setOpenMenu(val ? name : null)

  return (
    <header className="rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden shadow-md">
            <img src="/logo.png" alt="OmniConvert" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight dark:text-white">OmniConverter</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Professional File Converter</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 text-sm">

          {/* Tools — dropdown ke kiri */}
          <Dropdown label="Tools" open={openMenu === 'tools'} onToggle={toggle('tools')} align="left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Format yang Didukung</p>
            <div className="grid grid-cols-2 gap-1">
              {TOOLS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => { setOpenMenu(null); onStartClick?.() }}
                  className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition hover:bg-[#eef2ff] dark:hover:bg-slate-700"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700">
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.label}</p>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Dropdown>

          {/* Pricing — dropdown ke kanan */}
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 flex-shrink-0 text-emerald-500">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Dropdown>

          {/* API — dropdown ke kanan */}
          <Dropdown label="API" open={openMenu === 'api'} onToggle={toggle('api')} align="right">
            <div className="w-72">
              <p className="mb-1 font-semibold text-slate-900 dark:text-white">OmniConvert API</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Integrasikan konversi file langsung ke aplikasi kamu.</p>
              <div className="mt-3 rounded-[12px] bg-slate-900 p-3 font-mono text-xs text-emerald-400">
                <p>POST http://localhost:3001/convert</p>
                <p className="mt-1 text-slate-500">Content-Type: multipart/form-data</p>
                <p className="text-slate-500">Body: file, format</p>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {['/convert', '/health', '/formats'].map((ep) => (
                  <div key={ep} className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-emerald-500">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <code className="rounded bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 text-xs">{ep}</code>
                  </div>
                ))}
              </div>
            </div>
          </Dropdown>

          {/* FAQ — dropdown ke kanan */}
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

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={onToggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-600"
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
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
    </header>
  )
}
