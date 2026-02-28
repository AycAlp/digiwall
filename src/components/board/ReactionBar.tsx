'use client'

import { REACTION_EMOJIS, type Reaction } from '@/types'
import { cn } from '@/lib/utils'

interface ReactionBarProps {
  postId: string
  reactions: Reaction[]
  userId: string | undefined
  onToggle: (emoji: string) => void
  compact?: boolean
}

export function ReactionBar({ postId, reactions, userId, onToggle, compact }: ReactionBarProps) {
  const grouped = REACTION_EMOJIS.map((emoji) => {
    const list = reactions.filter((r) => r.post_id === postId && r.emoji === emoji)
    return { emoji, count: list.length, reacted: list.some((r) => r.user_id === userId) }
  }).filter((g) => (compact ? g.count > 0 : true))

  if (compact && grouped.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {grouped.map(({ emoji, count, reacted }) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className={cn(
            'flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs transition-all border',
            reacted
              ? 'border-violet-300 bg-violet-50 text-violet-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50'
          )}
        >
          <span>{emoji}</span>
          {count > 0 && <span className="font-medium">{count}</span>}
        </button>
      ))}
    </div>
  )
}
