const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export async function isBackendAvailable() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

export async function convertWithLocalBackend(file, outputFormat, onProgress) {
  onProgress?.(10)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('format', outputFormat)

  onProgress?.(30)

  const res = await fetch(`${BACKEND_URL}/convert`, {
    method: 'POST',
    body: formData,
  })

  onProgress?.(90)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    // Backend signals to use CloudConvert instead
    if (res.status === 422 && err.useCloud) {
      throw Object.assign(new Error('USE_CLOUD'), { useCloud: true })
    }
    throw new Error(err.error || `Backend error: ${res.status}`)
  }

  const blob = await res.blob()
  onProgress?.(100)
  return blob
}

export async function getSupportedFormats() {
  const res = await fetch(`${BACKEND_URL}/formats`)
  return res.json()
}
