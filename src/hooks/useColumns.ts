'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Column } from '@/types'

export function useColumns(boardId: string) {
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchColumns = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('columns').select('*').eq('board_id', boardId)
      .order('position', { ascending: true })
    setColumns((data as Column[]) ?? [])
    setLoading(false)
  }, [boardId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchColumns() }, [fetchColumns])

  async function addColumn(title: string, color: string) {
    const position = columns.length
    const { data, error } = await supabase
      .from('columns').insert({ board_id: boardId, title, color, position }).select().single()
    if (!error && data) setColumns((prev) => [...prev, data as Column])
    return error ? null : (data as Column)
  }

  async function updateColumn(columnId: string, updates: Partial<Pick<Column, 'title' | 'color' | 'position'>>) {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, ...updates } : c)))
    await supabase.from('columns').update(updates).eq('id', columnId)
  }

  async function deleteColumn(columnId: string) {
    setColumns((prev) => prev.filter((c) => c.id !== columnId))
    await supabase.from('columns').delete().eq('id', columnId)
  }

  return { columns, setColumns, loading, addColumn, updateColumn, deleteColumn, refetch: fetchColumns }
}
