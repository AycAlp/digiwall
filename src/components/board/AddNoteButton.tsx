'use client'

import { Button } from '@/components/ui/Button'

interface AddNoteButtonProps {
  onClick: () => void
  loading?: boolean
}

export function AddNoteButton({ onClick, loading }: AddNoteButtonProps) {
  return (
    <Button
      onClick={onClick}
      loading={loading}
      className="fixed bottom-8 right-8 z-20 h-14 w-14 rounded-full shadow-lg p-0"
      title="Add sticky note"
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </Button>
  )
}
