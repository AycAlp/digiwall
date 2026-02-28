'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface DeleteBoardDialogProps {
  open: boolean
  boardTitle: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteBoardDialog({
  open,
  boardTitle,
  onClose,
  onConfirm,
  loading,
}: DeleteBoardDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Delete board">
      <p className="text-sm text-gray-600">
        Are you sure you want to delete{' '}
        <span className="font-semibold text-gray-900">&quot;{boardTitle}&quot;</span>?
        This will permanently delete all sticky notes on this board.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  )
}
