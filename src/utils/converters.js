import mammoth from 'mammoth'
import jsPDF from 'jspdf'
import { convertWithCloudConvert } from './cloudconvert'
import { isBackendAvailable, convertWithLocalBackend } from './localbackend'

// ─── CloudConvert (primary) ───────────────────────────────────────────────────

export async function convertFileCloud(file, targetFormat, onProgress) {
  const { blob, fileName } = await convertWithCloudConvert(file, targetFormat, onProgress)
  return { blob, fileName }
}

// ─── Local fallback (DOCX → PDF via mammoth + html2canvas) ───────────────────

async function docxToHtml(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({
    arrayBuffer,
    styleMap: [
      "p[style-name='List Number'] => ol.list-level-1 > li:fresh",
      "p[style-name='List Number 2'] => ol.list-level-2 > li:fresh",
      "p[style-name='List Number 3'] => ol.list-level-3 > li:fresh",
      "p[style-name='List Paragraph'] => ol.list-sub > li:fresh",
      "p[style-name='List Bullet'] => ul.list-bullet > li:fresh",
      "p[style-name='List Bullet 2'] => ul.list-bullet-2 > li:fresh",
    ],
    convertImage: mammoth.images.imgElement((image) =>
      image.read('base64').then((data) => ({
        src: `data:${image.contentType};base64,${data}`,
      }))
    ),
  })
  if (!result.value?.trim()) throw new Error('Tidak dapat membaca isi file DOCX.')
  return result.value
}

async function convertDocxToPdfLocal(file) {
  const html = await docxToHtml(file)

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;visibility:hidden'
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Calibri','Arial',sans-serif; font-size: 11pt; line-height: 1.6; color: #000; background: #fff; padding: 56px 72px; width: 794px; }
      p { margin-bottom: 0.7em; }
      h1 { font-size: 20pt; font-weight: bold; margin-bottom: 0.6em; }
      h2 { font-size: 16pt; font-weight: bold; margin-bottom: 0.5em; }
      h3 { font-size: 13pt; font-weight: bold; margin-bottom: 0.4em; }
      strong, b { font-weight: bold; } em, i { font-style: italic; }
      ol { list-style: none; padding: 0; margin: 0 0 0.8em 0; }
      ol.list-level-1 { counter-reset: question; }
      ol.list-level-1 > li { counter-increment: question; display: flex; gap: 0.5em; margin-bottom: 1em; align-items: flex-start; }
      ol.list-level-1 > li::before { content: counter(question) "."; min-width: 1.8em; flex-shrink: 0; }
      ol.list-level-2, ol.list-sub { counter-reset: choice; padding-left: 1.5em; margin-top: 0.4em; }
      ol.list-level-2 > li, ol.list-sub > li { counter-increment: choice; display: flex; gap: 0.5em; margin-bottom: 0.35em; align-items: flex-start; }
      ol.list-level-2 > li::before, ol.list-sub > li::before { content: counter(choice, lower-alpha) "."; min-width: 1.5em; flex-shrink: 0; }
      ul.list-bullet { list-style: disc; padding-left: 1.8em; margin-bottom: 0.6em; }
      ul.list-bullet-2 { list-style: circle; padding-left: 3em; margin-bottom: 0.4em; }
      ol:not([class]) { list-style: decimal; padding-left: 1.8em; margin-bottom: 0.6em; }
      ul:not([class]) { list-style: disc; padding-left: 1.8em; margin-bottom: 0.6em; }
      li { margin-bottom: 0.3em; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 0.8em; }
      td, th { border: 1px solid #ccc; padding: 4px 8px; }
      img { max-width: 100%; height: auto; }
    </style></head><body>${html}</body></html>`)
    doc.close()

    iframe.onload = async () => {
      try {
        const body = doc.body
        const totalHeight = body.scrollHeight
        const pageH = 1123
        const pageW = 794
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
        const pdfW = pdf.internal.pageSize.getWidth()
        const pdfH = pdf.internal.pageSize.getHeight()
        const pages = Math.ceil(totalHeight / pageH)
        const { default: html2canvas } = await import('html2canvas')

        for (let i = 0; i < pages; i++) {
          if (i > 0) pdf.addPage()
          const canvas = await html2canvas(body, {
            backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false,
            scrollY: -(i * pageH), height: pageH, windowWidth: pageW, windowHeight: pageH,
          })
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH)
        }

        document.body.removeChild(iframe)
        resolve(pdf.output('blob'))
      } catch (err) {
        document.body.removeChild(iframe)
        reject(err)
      }
    }
  })
}

export async function convertImageFormat(file, outputFormat) {
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }
  const mime = mimeMap[outputFormat] || 'image/png'
  const quality = mime === 'image/jpeg' ? 0.92 : 0.85

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext('2d').drawImage(img, 0, 0)
        canvas.toBlob((blob) => resolve(blob || new Blob()), mime, quality)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Main entry point ─────────────────────────────────────────────────────────

const hasApiKey = () => {
  const key = import.meta.env.VITE_CLOUDCONVERT_API_KEY
  return key && key !== 'your_api_key_here'
}

export async function convertFile(file, targetFormat, onProgress) {
  const ext = file.name.split('.').pop()?.toLowerCase()

  const IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'webp']

  // Image → Image always local
  if (IMAGE_FORMATS.includes(ext) && IMAGE_FORMATS.includes(targetFormat)) {
    if (ext === targetFormat) return file
    return convertImageFormat(file, targetFormat)
  }

  // PDF → DOCX: langsung CloudConvert (backend tidak support)
  if (ext === 'pdf' && targetFormat === 'docx') {
    if (hasApiKey()) {
      const { blob } = await convertFileCloud(file, targetFormat, onProgress)
      return blob
    }
    throw new Error('Konversi PDF → Word membutuhkan CloudConvert API key.')
  }

  // Priority 1: Local backend (LibreOffice)
  const backendUp = await isBackendAvailable()
  if (backendUp) {
    try {
      return await convertWithLocalBackend(file, targetFormat, onProgress)
    } catch (err) {
      if (err.useCloud) {
        if (hasApiKey()) {
          const { blob } = await convertFileCloud(file, targetFormat, onProgress)
          return blob
        }
        throw new Error('Konversi ini membutuhkan CloudConvert, tetapi API key tidak tersedia.')
      }
      throw err
    }
  }

  // Priority 2: CloudConvert API
  if (hasApiKey()) {
    const { blob } = await convertFileCloud(file, targetFormat, onProgress)
    return blob
  }

  // Priority 3: Local fallback (mammoth + html2canvas)
  if (ext === 'docx' && targetFormat === 'pdf') {
    return convertDocxToPdfLocal(file)
  }

  throw new Error(`Konversi ${ext?.toUpperCase()} → ${targetFormat.toUpperCase()} belum didukung.`)
}
