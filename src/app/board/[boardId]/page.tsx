'use client'

import { notFound } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { useColumns } from '@/hooks/useColumns'
import { useReactions } from '@/hooks/useReactions'
import { useRealtimeBoard } from '@/hooks/useRealtimeBoard'
import { BoardToolbar } from '@/components/board/BoardToolbar'
import { CanvasView } from '@/components/board/CanvasView'
import { KanbanView } from '@/components/board/KanbanView'
import { GridView } from '@/components/board/GridView'
import { CommentPanel } from '@/components/board/CommentPanel'
import { Spinner } from '@/components/ui/Spinner'
import { Toaster, useToast } from '@/components/ui/Toast'
import type { Board, Post, ViewMode } from '@/types'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { boardId } = params
  const { user, profile } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [boardLoading, setBoardLoading] = useState(true)
  const [boardNotFound, setBoardNotFound] = useState(false)
  const [commentPost, setCommentPost] = useState<Post | null>(null)
  const [addingNote, setAddingNote] = useState(false)
  const { toasts, addToast, dismiss } = useToast()

  const { posts, setPosts, loading: postsLoading, addPost, updatePost, deletePost } = usePosts(boardId, user?.id)
  const { columns, setColumns, addColumn, updateColumn, deleteColumn } = useColumns(boardId)
  const { reactions, setReactions, toggleReaction, getPostReactions } = useReactions(boardId)

  const pendingUpdates = useRef<Set<string>>(new Set())
  const supabase = createClient()

  // Load board
  useEffect(() => {
    supabase.from('boards').select('*').eq('id', boardId).single()
      .then(({ data, error }) => {
        if (error || !data) setBoardNotFound(true)
        else setBoard(data as Board)
        setBoardLoading(false)
      })
  }, [boardId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime
  useRealtimeBoard(boardId, setPosts, pendingUpdates, setReactions)

  // Build author name map from profiles
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({})
  useEffect(() => {
    const ids = Array.from(new Set(posts.map((p) => p.author_id)))
    if (ids.length === 0) return
    supabase.from('profiles').select('id, display_name, email').in('id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        data.forEach((p: { id: string; display_name: string | null; email: string }) => {
          map[p.id] = p.display_name ?? p.email.split('@')[0]
        })
        setAuthorNames(map)
      })
  }, [posts.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (boardNotFound) notFound()
  const isLoading = boardLoading || postsLoading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!board) return null
  const safeBoard = board

  const isOwner = user?.id === safeBoard.owner_id

  async function handleViewChange(v: ViewMode) {
    if (!board) return
    setBoard((b) => b ? { ...b, view_mode: v } : b)
    await supabase.from('boards').update({ view_mode: v }).eq('id', boardId)
  }

  async function handleToggleLock() {
    if (!board) return
    const next = !safeBoard.is_locked
    setBoard((b) => b ? { ...b, is_locked: next } : b)
    await supabase.from('boards').update({ is_locked: next }).eq('id', boardId)
    addToast(next ? 'Board locked — students can view only' : 'Board unlocked', next ? 'info' : 'success')
  }

  async function handleTogglePublic() {
    if (!board) return
    const next = !board.is_public
    setBoard((b) => b ? { ...b, is_public: next } : b)
    await supabase.from('boards').update({ is_public: next }).eq('id', boardId)
    addToast(next ? 'Board is now public — anyone with the link can access it' : 'Board is now private', 'info')
  }

  async function handleAddNote(columnId?: string | null) {
    setAddingNote(true)
    const colPosts = columnId ? posts.filter((p) => p.column_id === columnId) : []
    const result = await addPost({
      columnId: columnId ?? null,
      columnPosition: colPosts.length,
    })
    if (!result) addToast('Failed to add note', 'error')
    setAddingNote(false)
  }

  function handleReaction(postId: string, emoji: string) {
    if (!user?.id) return
    if (safeBoard.is_locked && !isOwner) { addToast('Board is locked', 'info'); return }
    toggleReaction(postId, emoji, user.id)
  }

  const commonProps = {
    posts,
    userId: user?.id,
    reactions: reactions,
    isLocked: safeBoard.is_locked,
    backgroundColor: board.background_color,
    authorNames,
    pendingUpdates,
    onUpdatePost: updatePost,
    onDeletePost: deletePost,
    onCommentClick: (post: Post) => setCommentPost(post),
    onReaction: handleReaction,
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <BoardToolbar
        board={board}
        isOwner={isOwner}
        postCount={posts.length}
        onViewChange={handleViewChange}
        onToggleLock={handleToggleLock}
        onTogglePublic={handleTogglePublic}
        onAddNote={() => handleAddNote()}
        addingNote={addingNote}
      />

      {safeBoard.view_mode === 'canvas' && (
        <CanvasView {...commonProps} />
      )}

      {safeBoard.view_mode === 'kanban' && (
        <KanbanView
          {...commonProps}
          columns={columns}
          isOwner={isOwner}
          setPosts={setPosts}
          onAddCard={(colId) => handleAddNote(colId)}
          onAddColumn={addColumn}
          onDeleteColumn={deleteColumn}
          onRenameColumn={(id, title) => updateColumn(id, { title })}
        />
      )}

      {safeBoard.view_mode === 'grid' && (
        <GridView {...commonProps} />
      )}

      {/* Comment panel */}
      <CommentPanel
        post={commentPost}
        userId={user?.id}
        userDisplayName={profile?.display_name ?? user?.email}
        onClose={() => setCommentPost(null)}
      />

      {/* Dim overlay when panel open */}
      {commentPost && (
        <div
          className="fixed inset-0 z-30 bg-black/10"
          onClick={() => setCommentPost(null)}
        />
      )}

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
