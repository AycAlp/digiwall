import { cn } from '@/lib/utils'
import { getLabelOption } from '@/lib/utils'

interface BadgeProps {
  label: string
  className?: string
  onRemove?: () => void
}

export function Badge({ label, className, onRemove }: BadgeProps) {
  const option = getLabelOption(label)
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}
      style={option ? { backgroundColor: option.bg, color: option.color } : { backgroundColor: '#f1f5f9', color: '#475569' }}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70 leading-none">×</button>
      )}
    </span>
  )
}
