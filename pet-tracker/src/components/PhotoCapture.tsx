import { useRef, useState } from 'react'
import { stampImageWithTimestamp } from '../lib/stampPhoto'
import { uploadPhoto } from '../lib/storagePhotos'

interface PhotoCaptureProps {
  label: string
  photoUrl: string | null
  storagePath: string
  onUploaded: (url: string) => void
  onRemove?: () => void
  onView?: (url: string) => void
}

export function PhotoCapture({ label, photoUrl, storagePath, onUploaded, onRemove, onView }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const stamped = await stampImageWithTimestamp(file)
      const url = await uploadPhoto(storagePath, stamped)
      onUploaded(url)
    } catch {
      setError('Foto konnte nicht hochgeladen werden.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <button
          type="button"
          onClick={() => (photoUrl && onView ? onView(photoUrl) : inputRef.current?.click())}
          disabled={uploading}
          className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 text-brand-500 hover:bg-brand-100 disabled:opacity-60"
        >
          {photoUrl ? (
            <img src={photoUrl} alt={label} className="h-full w-full object-cover" />
          ) : uploading ? (
            <span className="text-xs">Lädt hoch…</span>
          ) : (
            <span className="flex flex-col items-center text-xs">
              <span className="text-2xl">📷</span>
              {label}
            </span>
          )}
        </button>
        {photoUrl && onView && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            title="Foto ersetzen"
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            📷
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {photoUrl && onRemove && (
        <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline">
          Foto entfernen
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
