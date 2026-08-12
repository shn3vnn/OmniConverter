const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\s+/g, '')

export async function convertWithCloudConvert(file, outputFormat, onProgress) {
  onProgress?.(10)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('format', outputFormat)

  onProgress?.(30)

  const res = await fetch(`${BACKEND_URL}/convert-cloud`, {
    method: 'POST',
    body: formData,
  })

  onProgress?.(90)

  if (!res.ok) {
    let err = {}
    try { err = await res.json() } catch { err = { error: await res.text().catch(() => '') } }
    throw new Error(err.error || err.message || `Konversi gagal: ${res.status}`)
  }

  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="?([^"]+)"?/)
  const fileName = match?.[1] || `converted.${outputFormat}`

  onProgress?.(100)
  return { blob, fileName }
}
