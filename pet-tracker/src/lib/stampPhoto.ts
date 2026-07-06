// Draws a photo onto a canvas and burns a date/time stamp into the
// bottom-right corner, then exports it as a JPEG Blob. Used for every photo
// captured in the app (profile, meal, excrement) so the timestamp is part of
// the image itself and can't be edited afterwards.
export async function stampImageWithTimestamp(file: File | Blob, when: Date = new Date()): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas wird nicht unterstützt')

  ctx.drawImage(bitmap, 0, 0)

  const stamp = when.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const fontSize = Math.max(16, Math.round(canvas.width * 0.035))
  ctx.font = `600 ${fontSize}px sans-serif`
  const paddingX = fontSize * 0.6
  const paddingY = fontSize * 0.45
  const textWidth = ctx.measureText(stamp).width
  const boxWidth = textWidth + paddingX * 2
  const boxHeight = fontSize + paddingY * 2
  const x = canvas.width - boxWidth - fontSize * 0.5
  const y = canvas.height - boxHeight - fontSize * 0.5

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(x, y, boxWidth, boxHeight)
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.fillText(stamp, x + paddingX, y + boxHeight / 2)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Bild konnte nicht erzeugt werden'))),
      'image/jpeg',
      0.9
    )
  })
}
