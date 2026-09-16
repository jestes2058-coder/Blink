import type { BloodGroup } from '../types'

interface Props {
  group: BloodGroup
  size?: 'sm' | 'md' | 'lg'
  showTag?: boolean
  selected?: boolean
  onClick?: () => void
}

export default function BloodBadge({ group, size = 'md', showTag = false, selected = false, onClick }: Props) {
  const isUniversalDonor = group === 'O-'
  const isUniversalRecipient = group === 'AB+'

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  }

  const baseClasses = `inline-flex items-center gap-1.5 rounded-full transition-all duration-200 border ${sizeStyles[size]} ${
    selected
      ? 'bg-red-700 text-white border-red-700 shadow-md shadow-red-200 ring-2 ring-red-400 ring-offset-1'
      : onClick
      ? 'bg-red-50/80 text-red-800 border-red-200 hover:bg-red-100 hover:border-red-300 cursor-pointer'
      : 'bg-red-50 text-red-800 border-red-200'
  }`

  return (
    <span className={baseClasses} onClick={onClick}>
      <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" />
      <span>{group}</span>
      {showTag && (
        <span className="text-[9px] font-medium tracking-tight opacity-75">
          {isUniversalDonor ? 'Universal Donor' : isUniversalRecipient ? 'Universal Recipient' : ''}
        </span>
      )}
    </span>
  )
}
