import type { Urgency } from '../types'
import { Flame, Clock, Calendar } from 'lucide-react'

interface Props {
  urgency: Urgency
  size?: 'sm' | 'md'
}

export default function UrgencyBadge({ urgency, size = 'md' }: Props) {
  const isSm = size === 'sm'

  if (urgency === 'critical') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-red-600 text-white shadow-sm shadow-red-200 animate-pulse ${
        isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}>
        <Flame className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Critical</span>
      </span>
    )
  }

  if (urgency === 'urgent') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-500 text-white shadow-sm shadow-amber-200 ${
        isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}>
        <Clock className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Urgent (24h)</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-600 text-white shadow-sm ${
      isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    }`}>
      <Calendar className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>Planned</span>
    </span>
  )
}
