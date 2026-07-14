import { jsPDF } from 'jspdf'
import type { DailyLog, Pet } from '../types'
import { formatDateDe, formatTimestampDe } from './dateUtils'
import { SPECIES_LABELS } from './foodComponents'
import { dailyComponentTotals } from './logs'

// Firebase Storage download URLs send Access-Control-Allow-Origin: *, which
// lets us draw them onto a canvas and read pixel data back out as base64 -
// required because jsPDF can only embed images as data URLs, not remote URLs.
async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('image load failed'))
    })
    img.src = url
    await loaded
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch {
    return null
  }
}

const PAGE_WIDTH = 210
const MARGIN = 14
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

function addHeader(doc: jsPDF, pet: Pet, rangeLabel: string) {
  doc.setFillColor(226, 31, 31)
  doc.rect(0, 0, PAGE_WIDTH, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text('Pfotenprotokoll', MARGIN, 14)
  doc.setFontSize(10)
  doc.text(`${pet.name} (${SPECIES_LABELS[pet.species]}) · ${rangeLabel}`, MARGIN, 19)
  doc.setTextColor(20, 20, 20)
}

async function addDaySection(doc: jsPDF, log: DailyLog, y: number): Promise<number> {
  const pageHeight = doc.internal.pageSize.getHeight()

  if (y > pageHeight - 40) {
    doc.addPage()
    y = 26
  }

  doc.setFontSize(13)
  doc.setTextColor(226, 31, 31)
  doc.text(formatDateDe(log.date), MARGIN, y)
  doc.setTextColor(20, 20, 20)
  y += 6
  doc.setDrawColor(226, 31, 31)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 6

  const totals = dailyComponentTotals(log.meals)
  const totalEntries = Object.entries(totals)
  if (totalEntries.length > 0) {
    const grandTotal = totalEntries.reduce((sum, [, amount]) => sum + amount, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Tagesübersicht Futter', MARGIN, y)
    doc.setFont('helvetica', 'normal')
    y += 5
    const summaryLine = totalEntries.map(([name, amount]) => `${name}: ${amount} g`).join(' · ')
    const summaryLines = doc.splitTextToSize(`${summaryLine} · Gesamt: ${grandTotal} g`, CONTENT_WIDTH)
    doc.text(summaryLines, MARGIN, y)
    y += summaryLines.length * 5 + 3
  }

  for (const meal of log.meals) {
    if (y > pageHeight - 35) {
      doc.addPage()
      y = 26
    }
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Mahlzeit ${meal.index + 1}`, MARGIN, y)
    doc.setFont('helvetica', 'normal')
    y += 5
    doc.setFontSize(10)
    const components =
      meal.components.length > 0
        ? meal.components.map((c) => (c.amountG != null ? `${c.name} (${c.amountG} g)` : c.name)).join(', ')
        : '–'
    const compLines = doc.splitTextToSize(`Komponenten: ${components}`, CONTENT_WIDTH - 30)
    doc.text(compLines, MARGIN, y)
    y += compLines.length * 5

    if (meal.photoUrl) {
      const dataUrl = await loadImageAsDataUrl(meal.photoUrl)
      if (dataUrl) {
        if (y > pageHeight - 35) {
          doc.addPage()
          y = 26
        }
        doc.addImage(dataUrl, 'JPEG', MARGIN, y, 28, 28)
        y += 31
      }
    }
    y += 2
  }

  if (log.excrements.length > 0) {
    if (y > pageHeight - 35) {
      doc.addPage()
      y = 26
    }
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Ausscheidungen', MARGIN, y)
    doc.setFont('helvetica', 'normal')
    y += 6

    let x = MARGIN
    for (const ex of log.excrements) {
      const dataUrl = await loadImageAsDataUrl(ex.photoUrl)
      if (!dataUrl) continue
      if (x + 28 > PAGE_WIDTH - MARGIN) {
        x = MARGIN
        y += 34
      }
      if (y > pageHeight - 35) {
        doc.addPage()
        y = 26
        x = MARGIN
      }
      doc.addImage(dataUrl, 'JPEG', x, y, 26, 26)
      doc.setFontSize(7)
      doc.text(formatTimestampDe(ex.takenAt), x, y + 29)
      x += 30
    }
    y += 36
  }

  return y + 4
}

export async function exportLogsToPdf(pet: Pet, logs: DailyLog[], rangeLabel: string): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  addHeader(doc, pet, rangeLabel)
  let y = 30
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date))
  for (const log of sorted) {
    y = await addDaySection(doc, log, y)
  }
  return doc.output('blob')
}
