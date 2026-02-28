'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ViewMode } from '@/types'

const BOARD_COLORS = [
  { label: 'Cream', value: '#f8f7f4' },
  { label: 'Sky', value: '#dbeafe' },
  { label: 'Mint', value: '#d1fae5' },
  { label: 'Lavender', value: '#ede9fe' },
  { label: 'Peach', value: '#fee2e2' },
  { label: 'Lemon', value: '#fef9c3' },
  { label: 'Rose', value: '#fce7f3' },
  { label: 'Slate', value: '#f1f5f9' },
]

const VIEW_OPTIONS: { id: ViewMode; label: string; description: string; icon: string }[] = [
  { id: 'canvas', label: 'Canvas', description: 'Free-form sticky notes anywhere', icon: '🖼️' },
  { id: 'kanban', label: 'Kanban', description: 'Organize into columns like Trello', icon: '📋' },
  { id: 'grid', label: 'Grid', description: 'Clean gallery of all notes', icon: '🔲' },
]

interface CreateBoardModalProps {
  open: boolean
  onClose: () => void
  onCreate: (title: string, color: string, viewMode: ViewMode) => Promise<void>
}

export function CreateBoardModal({ open, onClose, onCreate }: CreateBoardModalProps) {
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(BOARD_COLORS[0].value)
  const [viewMode, setViewMode] = useState<ViewMode>('canvas')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true); setError(null)
    try {
      await onCreate(title.trim(), color, viewMode)
      setTitle(''); setColor(BOARD_COLORS[0].value); setViewMode('canvas')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a new board">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Board title"
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Week 3 Brainstorm"
          required maxLength={120} autoFocus
        />

        {/* View mode */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Layout</p>
          <div className="grid grid-cols-3 gap-2">
            {VIEW_OPTIONS.map((v) => (
              <button
                key={v.id} type="button" onClick={() => setViewMode(v.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all ${
                  viewMode === v.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{v.icon}</span>
                <span className="text-xs font-semibold text-slate-700">{v.label}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{v.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background color */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Background</p>
          <div className="flex flex-wrap gap-2">
            {BOARD_COLORS.map((c) => (
              <button
                key={c.value} type="button" onClick={() => setColor(c.value)}
                title={c.label}
                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{ backgroundColor: c.value, borderColor: color === c.value ? '#7c3aed' : '#e2e8f0' }}
              />
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={!title.trim()}>Create board</Button>
        </div>
      </form>
    </Modal>
  )
}
