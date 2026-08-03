import { useRef, useState } from 'react'
import JSZip from 'jszip'
import { convertFile } from '../utils/converters'
import { formatBytes } from '../utils/formatBytes'

const EXT_DEFAULT_FORMAT = {
  docx: 'pdf', doc: 'pdf', pdf: 'docx',
  pptx: 'pdf', ppt: 'pdf',
  xlsx: 'pdf', xls: 'pdf',
  png: 'webp', jpg: 'png', jpeg: 'png', webp: 'png',
}

function makeItem(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return {
    id: `${Date.now()}-${Math.random()}`,
    file,
    targetFormat: EXT_DEFAULT_FORMAT[ext] || 'pdf',
    status: 'idle', // idle | converting | done | error
    progress: 0,
    downloadUrl: null,
    convertedName: null,
    convertedSize: null,
    error: null,
  }
}

export function useMultiConverter() {
  const [items, setItems] = useState([])
  const [isConverting, setIsConverting] = useState(false)
  const [zipUrl, setZipUrl] = useState(null)
  const urlsRef = useRef([])

  const update = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const addFiles = (files) => {
    const newItems = Array.from(files).map(makeItem)
    setItems((prev) => [...prev, ...newItems])
    setZipUrl(null)
  }

  const removeItem = (id) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id)
      if (item?.downloadUrl) URL.revokeObjectURL(item.downloadUrl)
      return prev.filter((it) => it.id !== id)
    })
  }

  const setFormat = (id, fmt) => update(id, { targetFormat: fmt, status: 'idle', downloadUrl: null, error: null })

  const convertAll = async () => {
    const pending = items.filter((it) => it.status !== 'done')
    if (!pending.length) return

    setIsConverting(true)
    setZipUrl(null)

    const results = []

    for (const item of pending) {
      update(item.id, { status: 'converting', progress: 0, error: null })
      try {
        const blob = await convertFile(item.file, item.targetFormat, (p) =>
          update(item.id, { progress: p })
        )
        const url = URL.createObjectURL(blob)
        urlsRef.current.push(url)
        const name = `${item.file.name.replace(/\.[^.]+$/, '')}_converted.${item.targetFormat}`
        update(item.id, { status: 'done', progress: 100, downloadUrl: url, convertedName: name, convertedSize: formatBytes(blob.size) })
        results.push({ blob, name })
      } catch (err) {
        update(item.id, { status: 'error', error: err.message || 'Konversi gagal' })
      }
    }

    // Auto-create ZIP if more than 1 file succeeded
    if (results.length > 1) {
      const zip = new JSZip()
      results.forEach(({ blob, name }) => zip.file(name, blob))
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      urlsRef.current.push(url)
      setZipUrl(url)
    }

    setIsConverting(false)
  }

  const reset = () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = []
    setItems([])
    setIsConverting(false)
    setZipUrl(null)
  }

  const doneCount = items.filter((it) => it.status === 'done').length
  const errorCount = items.filter((it) => it.status === 'error').length

  return { items, isConverting, zipUrl, doneCount, errorCount, addFiles, removeItem, setFormat, convertAll, reset }
}
