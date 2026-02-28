'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types'

export function usePosts(boardId: string, userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts').select('*').eq('board_id', boardId)
      .order('column_position', { ascending: true })

    if (error) setError(error.message)
    else setPosts((data as Post[]) ?? [])
    setLoading(false)
  }, [boardId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function addPost(opts: {
    color?: string
    columnId?: string | null
    columnPosition?: number
    posX?: number
    posY?: number
  } = {}) {
    if (!userId) return null

    const { color = '#fef08a', columnId = null, columnPosition = 0, posX, posY } = opts
    const newPost = {
      board_id: boardId,
      author_id: userId,
      content: '',
      color,
      pos_x: posX ?? 80 + Math.floor(Math.random() * 500),
      pos_y: posY ?? 80 + Math.floor(Math.random() * 350),
      z_index: posts.length + 1,
      column_id: columnId,
      column_position: columnPosition,
      labels: [],
    }

    const tempId = `temp-${Date.now()}`
    const optimistic: Post = { ...newPost, id: tempId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    setPosts((prev) => [...prev, optimistic])

    const { data, error } = await supabase.from('posts').insert(newPost).select().single()
    if (error) {
      setPosts((prev) => prev.filter((p) => p.id !== tempId))
      setError(error.message)
      return null
    }
    setPosts((prev) => prev.map((p) => (p.id === tempId ? (data as Post) : p)))
    return data as Post
  }

  async function updatePost(
    postId: string,
    updates: Partial<Pick<Post, 'content' | 'color' | 'pos_x' | 'pos_y' | 'z_index' | 'column_id' | 'column_position' | 'labels'>>,
    pendingRef?: React.MutableRefObject<Set<string>>
  ) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)))
    pendingRef?.current.add(postId)
    const { error } = await supabase.from('posts').update(updates).eq('id', postId)
    pendingRef?.current.delete(postId)
    if (error) { setError(error.message); fetchPosts() }
  }

  async function deletePost(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) { setError(error.message); fetchPosts() }
  }

  return { posts, setPosts, loading, error, addPost, updatePost, deletePost, refetch: fetchPosts }
}
