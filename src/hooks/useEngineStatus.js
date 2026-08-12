import { useEffect, useState } from 'react'
import { isBackendAvailable } from '../utils/localbackend'

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\s+/g, '')

async function isCloudAvailable() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    // Cek apakah backend punya CloudConvert dengan mengirim request kosong
    // Backend akan return 400 (bukan 503) jika CloudConvert tersedia
    const res = await fetch(`${BACKEND_URL}/convert-cloud`, {
      method: 'POST',
      body: new FormData(),
      signal: controller.signal,
    })
    clearTimeout(timer)
    // 503 = CloudConvert tidak dikonfigurasi, selain itu = tersedia
    return res.status !== 503
  } catch {
    return false
  }
}

export function useEngineStatus() {
  const [engine, setEngine] = useState('checking')

  const check = async () => {
    const backendUp = await isBackendAvailable()
    if (backendUp) {
      setEngine('local')
      return
    }

    const cloudUp = await isCloudAvailable()
    if (cloudUp) {
      setEngine('cloud')
      return
    }

    setEngine('offline')
  }

  useEffect(() => {
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [])

  return { engine, recheck: check }
}
