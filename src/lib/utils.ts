import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFechaHora(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parseISO(isoString))
  } catch {
    return isoString
  }
}

// Colombia (America/Bogota) no observa horario de verano: UTC-5 todo el año
export function colombiaLocalToUTCISOString(localDateTime: string): string {
  return new Date(`${localDateTime}:00-05:00`).toISOString()
}

export function isMatchLocked(fechaHora: string): boolean {
  const lockTime = new Date(fechaHora).getTime() - 60 * 1000
  return Date.now() >= lockTime
}

export function exportToCsv(
  rows: Record<string, string | number>[],
  filename: string
) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => JSON.stringify(String(row[h] ?? ''))).join(',')
    ),
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
