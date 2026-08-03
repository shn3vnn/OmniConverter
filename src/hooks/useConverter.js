import { useEffect, useRef, useState } from 'react'
import { convertFile } from '../utils/converters'
import { formatBytes } from '../utils/formatBytes'

const EXT_DEFAULT_FORMAT = { docx: 'pdf', doc: 'pdf', pdf: 'docx', pptx: 'pdf', ppt: 'pdf', xlsx: 'pdf', xls: 'pdf', png: 'webp', jpg: 'png', jpeg: 'png', webp: 'png' }

export function useConverter() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState('pdf')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [convertedName, setConvertedName] = useState('')
  const [convertedSize, setConvertedSize] = useState('')
  const [error, setError] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [downloadUrl])

  const selectFile = (file) => {
    if (!file) return
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setSelectedFile(file)
    setIsProcessing(false)
    setProgress(0)
    setIsComplete(false)
    setDownloadUrl(null)
    setError('')
    const ext = file.name.split('.').pop()?.toLowerCase()
    setTargetFormat(EXT_DEFAULT_FORMAT[ext] || 'pdf')
  }

  const convert = async () => {
    if (!selectedFile) return
    if (intervalRef.current) clearInterval(intervalRef.current)

    setIsProcessing(true)
    setIsComplete(false)
    setProgress(0)
    setError('')

    let p = 0
    intervalRef.current = setInterval(() => {
      p = Math.min(p + 5, 85)
      setProgress(p)
      if (p >= 85) clearInterval(intervalRef.current)
    }, 150)

    try {
      const blob = await convertFile(selectedFile, targetFormat, (p) => {
        clearInterval(intervalRef.current) // stop fake progress, use real
        setProgress(p)
      })
      clearInterval(intervalRef.current)
      setProgress(100)
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setConvertedName(`${selectedFile.name.replace(/\.[^.]+$/, '')}_converted.${targetFormat}`)
      setConvertedSize(formatBytes(blob.size))
      setIsComplete(true)
    } catch (err) {
      clearInterval(intervalRef.current)
      setError(err.message || 'Konversi gagal. Silakan coba file lain.')
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setSelectedFile(null)
    setTargetFormat('pdf')
    setIsProcessing(false)
    setProgress(0)
    setIsComplete(false)
    setDownloadUrl(null)
    setConvertedName('')
    setConvertedSize('')
    setError('')
  }

  return {
    selectedFile, targetFormat, setTargetFormat,
    isProcessing, progress, isComplete,
    downloadUrl, convertedName, convertedSize, error,
    selectFile, convert, reset,
  }
}
