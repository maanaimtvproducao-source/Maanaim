import { AlertTriangle } from 'lucide-react'
import { Modal, ModalFooter } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
  loading?: boolean
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  description = 'Tem certeza que deseja continuar?',
  confirmLabel = 'Confirmar',
  loading,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className={`rounded-full p-3 ${variant === 'danger' ? 'bg-red-900/50' : 'bg-amber-900/50'}`}>
          <AlertTriangle className={`h-6 w-6 ${variant === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-surface-50">{title}</h3>
          <p className="text-sm text-surface-400 mt-1">{description}</p>
        </div>
      </div>
      <ModalFooter className="justify-center">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
