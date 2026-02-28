'use client'

import { NOTE_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {NOTE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          style={{
            backgroundColor: color,
            borderColor: value === color ? '#6366f1' : '#d1d5db',
          }}
          title={color}
        />
      ))}
    </div>
  )
}
