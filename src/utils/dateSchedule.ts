/**
 * Utilities for formatting and calculating scheduled day, date, and time for blood requests
 */

export interface ScheduleDetails {
  scheduleType: 'immediate' | 'today' | 'tomorrow' | 'scheduled'
  neededDate: string // YYYY-MM-DD
  neededTime: string // HH:MM
  dayOfWeek: string // e.g. "Friday"
  formattedDate: string // e.g. "18 Sep 2026"
  formattedTime: string // e.g. "02:30 PM"
  displayBadge: string // e.g. "Friday, 18 Sep 2026 at 02:30 PM"
  relativeLabel: string // e.g. "Immediate", "Today", "Tomorrow", "In 3 days"
}

export function getTodayDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTomorrowDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDefaultTimeString(offsetHours = 2): string {
  const d = new Date()
  d.setHours(d.getHours() + offsetHours)
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, '0')
  return `${hours}:${mins}`
}

export function format12Hour(time24: string): string {
  if (!time24) return '10:00 AM'
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  if (isNaN(h)) return time24
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  const mins = mStr ? mStr.padStart(2, '0') : '00'
  return `${h12}:${mins} ${ampm}`
}

export function computeScheduleDetails(
  scheduleType: 'immediate' | 'today' | 'tomorrow' | 'scheduled',
  dateStr: string,
  timeStr: string
): ScheduleDetails {
  const today = getTodayDateString()
  const tomorrow = getTomorrowDateString()

  let effectiveDate = dateStr
  if (scheduleType === 'immediate' || scheduleType === 'today') {
    effectiveDate = today
  } else if (scheduleType === 'tomorrow') {
    effectiveDate = tomorrow
  }

  const [y, m, d] = (effectiveDate || today).split('-').map(Number)
  const dateObj = new Date(y, (m || 1) - 1, d || 1)

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const dayOfWeek = daysOfWeek[dateObj.getDay()] || 'Today'
  const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`
  const formattedTime = format12Hour(timeStr || '10:00')

  if (scheduleType === 'immediate') {
    return {
      scheduleType,
      neededDate: effectiveDate,
      neededTime: timeStr || 'Immediate',
      dayOfWeek,
      formattedDate,
      formattedTime: 'Immediate / ASAP',
      displayBadge: `⚡ Immediate (${dayOfWeek}, ${formattedDate})`,
      relativeLabel: 'Immediate Emergency',
    }
  }

  let relativeLabel = 'Scheduled'
  if (effectiveDate === today) {
    relativeLabel = 'Today'
  } else if (effectiveDate === tomorrow) {
    relativeLabel = 'Tomorrow'
  } else {
    const diffMs = dateObj.getTime() - new Date(today).getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays > 0) {
      relativeLabel = `In ${diffDays} day${diffDays > 1 ? 's' : ''}`
    }
  }

  return {
    scheduleType,
    neededDate: effectiveDate,
    neededTime: timeStr,
    dayOfWeek,
    formattedDate,
    formattedTime,
    displayBadge: `${dayOfWeek}, ${formattedDate} at ${formattedTime}`,
    relativeLabel,
  }
}

export function formatRequestSchedule(
  requiredBy?: string,
  neededDate?: string,
  neededTime?: string,
  urgency?: string
): string {
  if (requiredBy) return requiredBy
  if (neededDate) {
    const details = computeScheduleDetails('scheduled', neededDate, neededTime || '10:00')
    return details.displayBadge
  }
  if (urgency === 'critical') return '⚡ Immediate / Critical Emergency'
  if (urgency === 'urgent') return 'Within 24 Hours'
  return 'Planned Transfusion'
}
