export default function DropZone({ isDragging, setIsDragging, onFilesAdd, fileInputRef, compact = false }) {
  const openPicker = () => fileInputRef.current?.click()

  return (
    <label
      className={`dropzone ${isDragging ? 'is-active' : ''} ${compact ? 'cursor-pointer' : ''}`}
      onClick={openPicker}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.length) onFilesAdd(e.dataTransfer.files)
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFilesAdd(e.target.files)
          e.target.value = ''
        }}
      />
      {compact ? (
        <div className="flex items-center justify-center gap-2 px-5 py-5 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[#4f46e5]">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className="text-sm font-semibold text-[#4f46e5]">Tambah file lagi</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:px-8 sm:py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] dark:bg-indigo-950 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 text-[#4f46e5]">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">Seret dan letakkan file di sini atau</h2>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPicker() }}
            className="mt-4 rounded-full bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Pilih File
          </button>
          <p className="mt-3 text-sm text-slate-500">Bisa pilih beberapa file sekaligus • Maks 50MB per file</p>
        </div>
      )}
    </label>
  )
}
