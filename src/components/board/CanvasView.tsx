'use client'

import { useRef, useState } from 'react'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Post, Reaction } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { ReactionBar } from './ReactionBar'
import { Avatar } from '@/components/ui/Avatar'
import { ColorPicker } from './ColorPicker'
import { LabelPicker } from './LabelPicker'
import { NOTE_COLORS } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'

const CANVAS_W = 3000
const CANVAS_H = 2000

// ── Individual Canvas Note ────────────────────────────────────
interface CanvasNoteProps {
  post: Post
  userId: string | undefined
  reactions: Reaction[]
  isLocked: boolean
  onUpdate: (updates: Partial<Post>) => void
  onDelete: () => void
  onPointerDown: () => void
  onCommentClick: () => void
  onReaction: (emoji: string) => void
  authorName?: string
}

function CanvasNote({ post, userId, reactions, isLocked, onUpdate, onDelete, onPointerDown, onCommentClick, onReaction, authorName }: CanvasNoteProps) {
  const [editing, setEditing] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [content, setContent] = useState(post.content)
  const isOwn = post.author_id === userId

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id })

  const style = {
    position: 'absolute' as const,
    left: post.pos_x, top: post.pos_y,
    zIndex: isDragging ? 9999 : post.z_index,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.95 : 1,
    width: 200,
  }

  function saveContent() {
    if (content !== post.content) onUpdate({ content })
    setEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-2xl shadow-md flex flex-col overflow-hidden select-none transition-shadow hover:shadow-lg"
      onPointerDown={onPointerDown}
    >
      {/* Drag handle + actions */}
      <div
        {...(!editing && !isLocked ? listeners : {})}
        {...(!editing && !isLocked ? attributes : {})}
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: post.color }}
      >
        <svg className="h-3 w-3 text-black/30" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4a1 1 0 110-2 1 1 0 010 2zM7 10a1 1 0 110-2 1 1 0 010 2zM7 16a1 1 0 110-2 1 1 0 010 2zM13 4a1 1 0 110-2 1 1 0 010 2zM13 10a1 1 0 110-2 1 1 0 010 2zM13 16a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isOwn && !isLocked && (
            <button onClick={() => setShowOptions((v) => !v)} className="rounded p-0.5 hover:bg-black/10 text-black/50 hover:text-black/80">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}
          {(isOwn || userId) && (
            <button onClick={onDelete} className="rounded p-0.5 hover:bg-red-100 text-black/50 hover:text-red-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Options panel */}
      {showOptions && (
        <div className="bg-white border-b border-slate-100 px-3 py-2 space-y-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Color</p>
            <ColorPicker value={post.color} onChange={(color) => { onUpdate({ color }); setShowOptions(false) }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Labels</p>
            <LabelPicker
              selected={post.labels}
              onChange={(labels) => onUpdate({ labels })}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white px-3 py-2.5 flex-1">
        {editing ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={saveContent}
            maxLength={2000}
            className="w-full resize-none text-sm text-slate-800 leading-relaxed focus:outline-none bg-transparent"
            rows={4}
          />
        ) : (
          <p
            className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[3rem] cursor-text"
            onClick={() => !isLocked && isOwn && setEditing(true)}
          >
            {post.content || <span className="text-slate-400 italic text-xs">Click to write…</span>}
          </p>
        )}

        {/* Labels */}
        {post.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.labels.map((l) => <Badge key={l} label={l} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-50 px-3 py-2 space-y-1.5">
        <ReactionBar postId={post.id} reactions={reactions} userId={userId} onToggle={onReaction} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar name={authorName} className="h-5 w-5 text-[9px]" />
            <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{authorName ?? 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-300">{formatRelativeTime(post.created_at)}</span>
            <button onClick={onCommentClick} className="text-slate-400 hover:text-violet-600 transition-colors">
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

// ── Canvas View ───────────────────────────────────────────────
interface CanvasViewProps {
  backgroundColor: string
  posts: Post[]
  userId: string | undefined
  reactions: Reaction[]
  isLocked: boolean
  pendingUpdates: React.MutableRefObject<Set<string>>
  authorNames: Record<string, string>
  onUpdatePost: (id: string, u: Partial<Post>, ref: React.MutableRefObject<Set<string>>) => void
  onDeletePost: (id: string) => void
  onCommentClick: (post: Post) => void
  onReaction: (postId: string, emoji: string) => void
}

export function CanvasView({
  backgroundColor, posts, userId, reactions, isLocked, pendingUpdates,
  authorNames, onUpdatePost, onDeletePost, onCommentClick, onReaction,
}: CanvasViewProps) {
  const maxZ = useRef(Math.max(0, ...posts.map((p) => p.z_index)))

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    const post = posts.find((p) => p.id === active.id)
    if (!post) return
    const newX = Math.max(0, post.pos_x + Math.round(delta.x))
    const newY = Math.max(0, post.pos_y + Math.round(delta.y))
    onUpdatePost(post.id, { pos_x: newX, pos_y: newY }, pendingUpdates)
  }

  function bringToFront(postId: string) {
    maxZ.current += 1
    onUpdatePost(postId, { z_index: maxZ.current }, pendingUpdates)
  }

  return (
    <div className="overflow-auto flex-1" style={{ background: backgroundColor }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
          {posts.map((post) => (
            <CanvasNote
              key={post.id}
              post={post}
              userId={userId}
              reactions={reactions}
              isLocked={isLocked}
              authorName={authorNames[post.author_id]}
              onPointerDown={() => bringToFront(post.id)}
              onUpdate={(u) => onUpdatePost(post.id, u, pendingUpdates)}
              onDelete={() => onDeletePost(post.id)}
              onCommentClick={() => onCommentClick(post)}
              onReaction={(emoji) => onReaction(post.id, emoji)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
