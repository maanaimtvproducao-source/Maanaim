import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return uuidv4()
}

export function formatDate(dateStr: string, pattern = 'dd/MM/yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatDatetime(dateStr: string): string {
  return formatDate(dateStr, "dd/MM/yyyy 'às' HH:mm")
}

export function formatMonthYear(mes: number, ano: number): string {
  const date = new Date(ano, mes - 1, 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

export function getCurrentDateISO(): string {
  return new Date().toISOString()
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function getMesAtual(): number {
  return new Date().getMonth() + 1
}

export function getAnoAtual(): number {
  return new Date().getFullYear()
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
