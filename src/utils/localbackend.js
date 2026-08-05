const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').trim()
console.log('BACKEND_URL:', JSON.stringify(BACKEND_URL))

export async function isBackendAvailable() {
  try {
    new URL(BACKEND_URL)
  } catch {
    return false
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${BACKEND_URL}/health`, { signal: controller.signal })
    clearTimeout(timer)
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
    let err = {}
    try {
      err = await res.json()
    } catch {
      const text = await res.text().catch(() => '')
      err = { error: text }
    }

    const errorText = String(err.error || err.message || '')
    const useCloud = res.status === 422 && (
      err.useCloud === true ||
      errorText === 'USE_CLOUD' ||
      errorText.includes('USE_CLOUD')
    )

    if (useCloud) {
      throw Object.assign(
        new Error('Backend lokal tidak mendukung konversi ini. Gunakan CloudConvert atau jalankan backend lokal Anda sendiri.'),
        { useCloud: true }
      )
    }

    throw new Error(err.error || err.message || `Backend error: ${res.status}`)
  }

  const blob = await res.blob()
  onProgress?.(100)
  return blob
}

export async function getSupportedFormats() {
  const res = await fetch(`${BACKEND_URL}/formats`)
  return res.json()
}
