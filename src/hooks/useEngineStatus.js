import { useEffect, useState } from 'react'
import { isBackendAvailable } from '../utils/localbackend'

export function useEngineStatus() {
  const [engine, setEngine] = useState('checking') // 'checking' | 'local' | 'cloud' | 'offline'

  const check = async () => {
    const backendUp = await isBackendAvailable()
    if (backendUp) { setEngine('local'); return }

    const key = import.meta.env.VITE_CLOUDCONVERT_API_KEY
    if (key && key !== 'your_api_key_here') { setEngine('cloud'); return }

    setEngine('offline')
  }

  useEffect(() => {
    check()
    const interval = setInterval(check, 10000) // re-check every 10s
    return () => clearInterval(interval)
  }, [])

  return { engine, recheck: check }
}
