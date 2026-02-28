'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reaction } from '@/types'

export function useReactions(boardId: string) {
  const [reactions, setReactions] = useState<Reaction[]>([])

  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('reactions')
      .select('*, posts!inner(board_id)')
      .eq('posts.board_id', boardId)
      .then(({ data }) => setReactions((data as Reaction[]) ?? []))
  }, [boardId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleReaction(postId: string, emoji: string, userId: string) {
    const existing = reactions.find(
      (r) => r.post_id === postId && r.emoji === emoji && r.user_id === userId
    )

    if (existing) {
      setReactions((prev) => prev.filter((r) => r.id !== existing.id))
      await supabase.from('reactions').delete().eq('id', existing.id)
    } else {
      const optimistic: Reaction = {
        id: `temp-${Date.now()}`, post_id: postId, user_id: userId, emoji,
        created_at: new Date().toISOString(),
      }
      setReactions((prev) => [...prev, optimistic])
      const { data } = await supabase
        .from('reactions').insert({ post_id: postId, user_id: userId, emoji }).select().single()
      if (data) {
        setReactions((prev) => prev.map((r) => (r.id === optimistic.id ? (data as Reaction) : r)))
      }
    }
  }

  function getPostReactions(postId: string) {
    return reactions.filter((r) => r.post_id === postId)
  }

  return { reactions, setReactions, toggleReaction, getPostReactions }
}
