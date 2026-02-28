'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post, Reaction } from '@/types'

type SetPosts = React.Dispatch<React.SetStateAction<Post[]>>
type SetReactions = React.Dispatch<React.SetStateAction<Reaction[]>>

export function useRealtimeBoard(
  boardId: string,
  setPosts: SetPosts,
  pendingUpdates: React.MutableRefObject<Set<string>>,
  setReactions?: SetReactions
) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`board-rt:${boardId}`)
      // ── posts ──
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts', filter: `board_id=eq.${boardId}` }, (payload) => {
        const p = payload.new as Post
        setPosts((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts', filter: `board_id=eq.${boardId}` }, (payload) => {
        const p = payload.new as Post
        if (pendingUpdates.current.has(p.id)) return
        setPosts((prev) => prev.map((x) => (x.id === p.id ? p : x)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts', filter: `board_id=eq.${boardId}` }, (payload) => {
        const id = (payload.old as { id: string }).id
        setPosts((prev) => prev.filter((x) => x.id !== id))
      })
      // ── reactions ──
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions' }, (payload) => {
        setReactions?.((prev) => (prev.some((r) => r.id === (payload.new as Reaction).id) ? prev : [...prev, payload.new as Reaction]))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reactions' }, (payload) => {
        const id = (payload.old as { id: string }).id
        setReactions?.((prev) => prev.filter((r) => r.id !== id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [boardId]) // eslint-disable-line react-hooks/exhaustive-deps
}
