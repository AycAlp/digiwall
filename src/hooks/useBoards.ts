'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Board, ViewMode } from '@/types'

export function useBoards(userId: string | undefined) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchBoards = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (error) setError(error.message)
    else setBoards((data as Board[]) ?? [])
    setLoading(false)
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchBoards() }, [fetchBoards])

  async function createBoard(title: string, backgroundColor = '#f8f7f4', viewMode: ViewMode = 'canvas') {
    if (!userId) return null

    const newBoard = { owner_id: userId, title, background_color: backgroundColor, view_mode: viewMode }
    const tempId = `temp-${Date.now()}`
    const optimistic: Board = {
      ...newBoard, id: tempId,
      is_locked: false, is_public: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    setBoards((prev) => [optimistic, ...prev])

    const { data, error } = await supabase.from('boards').insert(newBoard).select().single()
    if (error) {
      setBoards((prev) => prev.filter((b) => b.id !== tempId))
      setError(error.message)
      return null
    }
    setBoards((prev) => prev.map((b) => (b.id === tempId ? (data as Board) : b)))
    return data as Board
  }

  async function deleteBoard(boardId: string) {
    setBoards((prev) => prev.filter((b) => b.id !== boardId))
    const { error } = await supabase.from('boards').delete().eq('id', boardId)
    if (error) { setError(error.message); fetchBoards() }
  }

  async function updateBoard(boardId: string, updates: Partial<Pick<Board, 'title' | 'background_color' | 'view_mode' | 'is_locked' | 'is_public'>>) {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, ...updates } : b)))
    const { error } = await supabase.from('boards').update(updates).eq('id', boardId)
    if (error) { setError(error.message); fetchBoards() }
  }

  return { boards, loading, error, createBoard, deleteBoard, updateBoard, refetch: fetchBoards }
}
