const API_KEY = import.meta.env.VITE_CLOUDCONVERT_API_KEY
const BASE_URL = 'https://api.cloudconvert.com/v2'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `CloudConvert error: ${res.status}`)
  }
  return res.json()
}

export async function convertWithCloudConvert(file, outputFormat, onProgress) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('CloudConvert API key belum diisi. Tambahkan VITE_CLOUDCONVERT_API_KEY di file .env')
  }
  console.log('CloudConvert API key exists:', !!API_KEY, 'length:', API_KEY?.length)

  const inputFormat = file.name.split('.').pop().toLowerCase()

  // Step 1: Create job with 3 tasks: import → convert → export
  onProgress?.(10)
  const { data: job } = await apiFetch('/jobs', {
    method: 'POST',
    body: JSON.stringify({
      tasks: {
        'upload-file': {
          operation: 'import/upload',
        },
        'convert-file': {
          operation: 'convert',
          input: 'upload-file',
          input_format: inputFormat,
          output_format: outputFormat,
          // engine is auto-selected by CloudConvert based on format pair
        },
        'export-file': {
          operation: 'export/url',
          input: 'convert-file',
        },
      },
    }),
  })

  // Step 2: Upload the file to the upload task URL
  onProgress?.(25)

  // Poll until upload task has result with form URL
  let uploadTask = job.tasks.find((t) => t.name === 'upload-file')
  let uploadUrl = uploadTask?.result?.form?.url

  if (!uploadUrl) {
    // Re-fetch job to get upload URL
    const { data: freshJob } = await apiFetch(`/jobs/${job.id}`)
    uploadTask = freshJob.tasks.find((t) => t.name === 'upload-file')
    uploadUrl = uploadTask?.result?.form?.url
  }

  if (!uploadUrl) throw new Error('Gagal mendapatkan upload URL dari CloudConvert. Coba lagi.')

  const uploadParams = uploadTask?.result?.form?.parameters || {}

  const formData = new FormData()
  Object.entries(uploadParams).forEach(([key, val]) => formData.append(key, val))
  formData.append('file', file)

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData })
  if (!uploadRes.ok) throw new Error('Gagal mengupload file ke CloudConvert')

  // Step 3: Poll job status until finished
  onProgress?.(40)
  const jobId = job.id
  let resultJob = null
  let attempts = 0

  while (attempts < 60) {
    await new Promise((r) => setTimeout(r, 2000))
    attempts++

    const { data: polled } = await apiFetch(`/jobs/${jobId}`)
    const statuses = polled.tasks.map((t) => t.status)

    if (statuses.includes('error')) {
      const failed = polled.tasks.find((t) => t.status === 'error')
      throw new Error(failed?.message || 'Konversi gagal di CloudConvert')
    }

    const progressVal = Math.min(40 + attempts * 2, 85)
    onProgress?.(progressVal)

    if (statuses.every((s) => s === 'finished')) {
      resultJob = polled
      break
    }
  }

  if (!resultJob) throw new Error('Konversi timeout. Coba lagi.')

  // Step 4: Download the converted file
  onProgress?.(90)
  const exportTask = resultJob.tasks.find((t) => t.name === 'export-file')
  const fileUrl = exportTask?.result?.files?.[0]?.url
  const fileName = exportTask?.result?.files?.[0]?.filename

  if (!fileUrl) throw new Error('Tidak dapat mengambil file hasil konversi')

  const downloadRes = await fetch(fileUrl)
  if (!downloadRes.ok) throw new Error('Gagal mengunduh file hasil konversi')

  const blob = await downloadRes.blob()
  onProgress?.(100)
  return { blob, fileName }
}
