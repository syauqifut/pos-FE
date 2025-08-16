import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../Modal'
import Button from '../Button'
import { t } from '../../../utils/i18n'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
  confirmDisabled?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = t('ui.confirmDialog.title'),
  message = t('ui.confirmDialog.message'),
  confirmText = t('ui.confirmDialog.confirm'),
  cancelText = t('ui.confirmDialog.cancel'),
  variant = 'warning',
  loading = false,
  confirmDisabled = false
}) => {
  const variantConfig = {
    danger: {
      icon: 'text-red-600',
      button: 'danger' as const
    },
    warning: {
      icon: 'text-yellow-600',
      button: 'warning' as const
    },
    info: {
      icon: 'text-blue-600',
      button: 'primary' as const
    }
  }

  const config = variantConfig[variant]

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <AlertTriangle className={`w-6 h-6 ${config.icon}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={config.button}
          onClick={handleConfirm}
          loading={loading}
          disabled={confirmDisabled}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog 