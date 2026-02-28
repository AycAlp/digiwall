import { cn } from '@/lib/utils'

interface AvatarProps {
  name?: string | null
  className?: string
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const colors = [
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-green-400',
  'bg-teal-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
]

function colorFromName(name?: string | null) {
  if (!name) return colors[0]
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white select-none',
        colorFromName(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
