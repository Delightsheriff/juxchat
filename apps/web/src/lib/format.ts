import { format, isToday, isYesterday, differenceInCalendarDays } from 'date-fns'

export function formatTime(isoString: string): string {
  return format(new Date(isoString), 'h:mm a')
}

export function formatDateLabel(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()

  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'

  const daysDiff = differenceInCalendarDays(now, date)
  if (daysDiff < 7) {
    return format(date, 'EEEE')
  }

  return format(date, 'MMM d, yyyy')
}
