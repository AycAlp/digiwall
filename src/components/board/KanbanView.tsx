'use client'

import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent, type DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Column, Post, Reaction } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { ReactionBar } from './ReactionBar'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { COLUMN_COLORS, formatRelativeTime } from '@/lib/utils'

// ── Sortable Card ─────────────────────────────────────────────
interface KanbanCardProps {
  post: Post
  userId: string | undefined
  reactions: Reaction[]
  isLocked: boolean
  authorName?: string
  onUpdate: (u: Partial<Post>) => void
  onDelete: () => void
  onCommentClick: () => void
  onReaction: (emoji: string) => void
  overlay?: boolean
}

function KanbanCard({ post, userId, reactions, isLocked, authorName, onUpdate, onDelete, onCommentClick, onReaction, overlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(post.content)
  const isOwn = post.author_id === userId

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${overlay ? 'rotate-1 shadow-xl' : ''}`}
    >
      {/* Color stripe */}
      <div className="h-1 w-full" style={{ backgroundColor: post.color }} />

      {/* Card body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Drag handle */}
          {!isLocked && (
            <button
              {...listeners}
              {...attributes}
              className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a1 1 0 110-2 1 1 0 010 2zM7 10a1 1 0 110-2 1 1 0 010 2zM7 16a1 1 0 110-2 1 1 0 010 2zM13 4a1 1 0 110-2 1 1 0 010 2zM13 10a1 1 0 110-2 1 1 0 010 2zM13 16a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          )}

          <div className="flex-1">
            {editing ? (
              <textarea
                autoFocus value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={() => { if (content !== post.content) onUpdate({ content }); setEditing(false) }}
                maxLength={2000}
                rows={3}
                className="w-full resize-none text-sm text-slate-800 leading-relaxed focus:outline-none bg-transparent"
              />
            ) : (
              <p
                className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap cursor-text"
                onClick={() => isOwn && !isLocked && setEditing(true)}
              >
                {post.content || <span className="text-slate-400 italic text-xs">Click to write…</span>}
              </p>
            )}
          </div>

          {isOwn && !isLocked && (
            <button onClick={onDelete} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Labels */}
        {post.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.labels.map((l) => <Badge key={l} label={l} />)}
          </div>
        )}

        {/* Reactions */}
        <ReactionBar postId={post.id} reactions={reactions} userId={userId} onToggle={onReaction} compact />

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Avatar name={authorName} className="h-5 w-5 text-[9px]" />
            <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{authorName ?? 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-300">{formatRelativeTime(post.created_at)}</span>
            <button onClick={onCommentClick} className="text-slate-300 hover:text-violet-500 transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v12a2 2 0 002 2h14l4 4V5a2 2 0 00-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Kanban Column ─────────────────────────────────────────────
interface KanbanColumnProps {
  column: Column
  posts: Post[]
  userId: string | undefined
  reactions: Reaction[]
  isLocked: boolean
  isOwner: boolean
  authorNames: Record<string, string>
  onUpdatePost: (id: string, u: Partial<Post>) => void
  onDeletePost: (id: string) => void
  onCommentClick: (post: Post) => void
  onReaction: (postId: string, emoji: string) => void
  onAddCard: (columnId: string) => void
  onDeleteColumn: (id: string) => void
  onRenameColumn: (id: string, title: string) => void
}

function KanbanColumn({ column, posts, userId, reactions, isLocked, isOwner, authorNames, onUpdatePost, onDeletePost, onCommentClick, onReaction, onAddCard, onDeleteColumn, onRenameColumn }: KanbanColumnProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(column.title)

  return (
    <div className="flex flex-col rounded-2xl bg-slate-50 border border-slate-200" style={{ minWidth: 280, width: 280 }}>
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
          {editingTitle ? (
            <input
              autoFocus value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => { onRenameColumn(column.id, title); setEditingTitle(false) }}
              onKeyDown={(e) => e.key === 'Enter' && (onRenameColumn(column.id, title), setEditingTitle(false))}
              className="flex-1 text-sm font-semibold text-slate-800 bg-transparent border-b border-violet-400 focus:outline-none"
            />
          ) : (
            <span
              className="text-sm font-semibold text-slate-700 cursor-pointer hover:text-violet-600"
              onClick={() => isOwner && setEditingTitle(true)}
            >
              {column.title}
            </span>
          )}
          <span className="ml-auto text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5">{posts.length}</span>
        </div>
        {isOwner && (
          <button onClick={() => onDeleteColumn(column.id)} className="ml-2 text-slate-300 hover:text-red-500 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
        <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {posts.map((post) => (
            <KanbanCard
              key={post.id} post={post} userId={userId} reactions={reactions} isLocked={isLocked}
              authorName={authorNames[post.author_id]}
              onUpdate={(u) => onUpdatePost(post.id, u)}
              onDelete={() => onDeletePost(post.id)}
              onCommentClick={() => onCommentClick(post)}
              onReaction={(e) => onReaction(post.id, e)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {!isLocked && (
        <button
          onClick={() => onAddCard(column.id)}
          className="flex items-center gap-2 mx-2 mb-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add card
        </button>
      )}
    </div>
  )
}

// ── Kanban View ───────────────────────────────────────────────
interface KanbanViewProps {
  columns: Column[]
  posts: Post[]
  userId: string | undefined
  reactions: Reaction[]
  isLocked: boolean
  isOwner: boolean
  authorNames: Record<string, string>
  backgroundColor: string
  pendingUpdates: React.MutableRefObject<Set<string>>
  onUpdatePost: (id: string, u: Partial<Post>, ref: React.MutableRefObject<Set<string>>) => void
  onDeletePost: (id: string) => void
  onCommentClick: (post: Post) => void
  onReaction: (postId: string, emoji: string) => void
  onAddCard: (columnId: string) => void
  onAddColumn: (title: string, color: string) => void
  onDeleteColumn: (id: string) => void
  onRenameColumn: (id: string, title: string) => void
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
}

export function KanbanView({
  columns, posts, userId, reactions, isLocked, isOwner, authorNames, backgroundColor,
  pendingUpdates, onUpdatePost, onDeletePost, onCommentClick, onReaction,
  onAddCard, onAddColumn, onDeleteColumn, onRenameColumn, setPosts,
}: KanbanViewProps) {
  const [addColOpen, setAddColOpen] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [newColColor, setNewColColor] = useState<string>(COLUMN_COLORS[0])
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const activePost = activeId ? posts.find((p) => p.id === activeId) : null

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string) }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const activePost = posts.find((p) => p.id === active.id)
    if (!activePost) return

    // Check if hovering over a column header (column ID) or another card
    const overColumn = columns.find((c) => c.id === over.id)
    const overPost = posts.find((p) => p.id === over.id)
    const targetColumnId = overColumn?.id ?? overPost?.column_id ?? null

    if (targetColumnId && targetColumnId !== activePost.column_id) {
      setPosts((prev) => prev.map((p) => p.id === activePost.id ? { ...p, column_id: targetColumnId } : p))
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const activePost = posts.find((p) => p.id === active.id)
    const overPost = posts.find((p) => p.id === over.id)
    if (!activePost) return

    const targetColumnId = overPost?.column_id ?? activePost.column_id
    const columnPosts = posts.filter((p) => p.column_id === targetColumnId).sort((a, b) => a.column_position - b.column_position)

    if (activePost.column_id !== targetColumnId) {
      // Cross-column drop
      onUpdatePost(activePost.id, { column_id: targetColumnId, column_position: columnPosts.length }, pendingUpdates)
    } else if (overPost && activePost.id !== overPost.id) {
      // Reorder within column
      const oldIdx = columnPosts.findIndex((p) => p.id === activePost.id)
      const newIdx = columnPosts.findIndex((p) => p.id === overPost.id)
      const reordered = arrayMove(columnPosts, oldIdx, newIdx)
      reordered.forEach((p, i) => {
        if (p.column_position !== i) onUpdatePost(p.id, { column_position: i }, pendingUpdates)
      })
    }
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{ background: backgroundColor }}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-6 h-full items-start">
          {columns.map((col) => {
            const colPosts = posts
              .filter((p) => p.column_id === col.id)
              .sort((a, b) => a.column_position - b.column_position)
            return (
              <KanbanColumn
                key={col.id} column={col} posts={colPosts} userId={userId} reactions={reactions}
                isLocked={isLocked} isOwner={isOwner} authorNames={authorNames}
                onUpdatePost={(id, u) => onUpdatePost(id, u, pendingUpdates)}
                onDeletePost={onDeletePost}
                onCommentClick={onCommentClick}
                onReaction={onReaction}
                onAddCard={onAddCard}
                onDeleteColumn={onDeleteColumn}
                onRenameColumn={onRenameColumn}
              />
            )
          })}

          {/* Uncategorized */}
          {posts.filter((p) => !p.column_id).length > 0 && (
            <div className="flex flex-col rounded-2xl bg-slate-50 border border-dashed border-slate-300" style={{ minWidth: 280, width: 280 }}>
              <div className="px-3 py-3 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-500">Uncategorized</span>
              </div>
              <div className="p-2 space-y-2">
                {posts.filter((p) => !p.column_id).map((post) => (
                  <KanbanCard
                    key={post.id} post={post} userId={userId} reactions={reactions} isLocked={isLocked}
                    authorName={authorNames[post.author_id]}
                    onUpdate={(u) => onUpdatePost(post.id, u, pendingUpdates)}
                    onDelete={() => onDeletePost(post.id)}
                    onCommentClick={() => onCommentClick(post)}
                    onReaction={(e) => onReaction(post.id, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add column button */}
          {isOwner && (
            <button
              onClick={() => setAddColOpen(true)}
              className="shrink-0 flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-5 py-4 text-sm text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-colors bg-white/50"
              style={{ minWidth: 200 }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add column
            </button>
          )}
        </div>

        <DragOverlay>
          {activePost && (
            <KanbanCard
              post={activePost} userId={userId} reactions={reactions} isLocked={false} overlay
              authorName={authorNames[activePost.author_id]}
              onUpdate={() => {}} onDelete={() => {}} onCommentClick={() => {}} onReaction={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Add column modal */}
      <Modal open={addColOpen} onClose={() => setAddColOpen(false)} title="Add column">
        <div className="flex flex-col gap-4">
          <Input label="Column title" value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} placeholder="e.g. In Progress" autoFocus />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLUMN_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setNewColColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: newColColor === c ? '#111' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setAddColOpen(false)}>Cancel</Button>
            <Button disabled={!newColTitle.trim()} onClick={() => { onAddColumn(newColTitle.trim(), newColColor); setNewColTitle(''); setAddColOpen(false) }}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
