import React from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, LucideIcon } from 'lucide-react'
import { t } from '../../../utils/i18n'

type AlertVariant = 'success' | 'error' | 'warning' | 'info'

interface AlertProps {
  variant: AlertVariant
  title?: string
  children?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  icon?: LucideIcon
  showIcon?: boolean
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  icon,
  showIcon = true
}) => {
  const variantConfig = {
    success: {
      containerClass: 'bg-green-50 border-green-200 text-green-800',
      iconClass: 'text-green-400',
      icon: CheckCircle,
      titleClass: 'text-green-800'
    },
    error: {
      containerClass: 'bg-red-50 border-red-200 text-red-800',
      iconClass: 'text-red-400',
      icon: AlertCircle,
      titleClass: 'text-red-800'
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClass: 'text-yellow-400',
      icon: AlertTriangle,
      titleClass: 'text-yellow-800'
    },
    info: {
      containerClass: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClass: 'text-blue-400',
      icon: Info,
      titleClass: 'text-blue-800'
    }
  }

  const config = variantConfig[variant]
  const IconComponent = icon || config.icon

  return (
    <div className={`
      flex p-3 border rounded-lg
      ${config.containerClass}
      ${className}
    `}>
      {showIcon && (
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${config.iconClass}`} />
        </div>
      )}
      
      <div className={`${showIcon ? 'ml-2' : ''} flex-1`}>
        {title && (
          <h3 className={`text-sm font-medium ${config.titleClass} mb-0.5`}>
            {title}
          </h3>
        )}
        {children && (
          <div className="text-sm">
            {children}
          </div>
        )}
      </div>

      {dismissible && (
        <div className="ml-auto pl-2">
          <button
            type="button"
            onClick={onDismiss}
            className={`
              inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${config.iconClass} hover:bg-white/20 focus:ring-offset-transparent focus:ring-current
            `}
            aria-label={t('ui.alert.dismiss')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Alert 