import { User } from 'lucide-react'
import type { BloodGroup } from '../types'

interface Props {
  src?: string | null
  name: string
  bloodGroup?: BloodGroup
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBadge?: boolean
}

export default function UserAvatar({
  src,
  name,
  bloodGroup,
  size = 'md',
  className = '',
  showBadge = false,
}: Props) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  }

  const badgeSizeClasses = {
    xs: 'text-[8px] px-1 py-0.2',
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-xs px-2.5 py-0.5',
  }

  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  // Generate consistent gradient based on name string
  const gradients = [
    'from-red-600 to-rose-500',
    'from-rose-600 to-amber-600',
    'from-red-700 to-purple-600',
    'from-amber-600 to-red-600',
    'from-rose-500 to-red-800',
  ]
  const charCode = name ? name.charCodeAt(0) % gradients.length : 0
  const bgGradient = gradients[charCode]

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden flex items-center justify-center shadow-sm border border-black/5 bg-gradient-to-tr ${bgGradient} text-white font-bold transition-transform`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide broken image and fallback to initials
              (e.target as HTMLElement).style.display = 'none'
            }}
          />
        ) : name ? (
          <span>{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>

      {showBadge && bloodGroup && (
        <span
          className={`absolute -bottom-1 -right-1 bg-red-800 text-white font-black rounded-lg border border-white shadow-sm ${badgeSizeClasses[size]}`}
        >
          {bloodGroup}
        </span>
      )}
    </div>
  )
}
