'use client'

import { LABEL_OPTIONS } from '@/types'
import { cn } from '@/lib/utils'

interface LabelPickerProps {
  selected: string[]
  onChange: (labels: string[]) => void
}

export function LabelPicker({ selected, onChange }: LabelPickerProps) {
  function toggle(label: string) {
    onChange(selected.includes(label) ? selected.filter((l) => l !== label) : [...selected, label])
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {LABEL_OPTIONS.map((opt) => {
        const active = selected.includes(opt.label)
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => toggle(opt.label)}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium border transition-all',
              active ? 'border-transparent' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            )}
            style={active ? { backgroundColor: opt.bg, color: opt.color, borderColor: opt.color } : undefined}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
