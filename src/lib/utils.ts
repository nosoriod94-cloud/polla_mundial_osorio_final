import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFechaHora(isoString: string): string {
  try {
    return format(parseISO(isoString), "d 'de' MMMM, HH:mm", { locale: es })
  } catch {
    return isoString
  }
}

export function isMatchLocked(fechaHora: string): boolean {
  const lockTime = new Date(fechaHora)
  lockTime.setHours(lockTime.getHours() - 1)
  return new Date() >= lockTime
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
