'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Comment } from '@/types'

export function useComments(postId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!postId) { setComments([]); return }
    setLoading(true)
    supabase
      .from('comments')
      .select('*, author:profiles(id, display_name, email)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setComments((data as Comment[]) ?? [])
        setLoading(false)
      })
  }, [postId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addComment(content: string, authorId: string) {
    if (!postId) return
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: authorId, content })
      .select('*, author:profiles(id, display_name, email)')
      .single()
    if (data) setComments((prev) => [...prev, data as Comment])
  }

  async function deleteComment(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    await supabase.from('comments').delete().eq('id', commentId)
  }

  return { comments, loading, addComment, deleteComment }
}
