import React from 'react'
import { FileX, Search, Plus, Database, LucideIcon } from 'lucide-react'
import Button from '../Button'
import { t } from '../../../utils/i18n'

type EmptyVariant = 'default' | 'search' | 'create' | 'error'

interface EmptyProps {
  variant?: EmptyVariant
  icon?: LucideIcon
  title?: string
  description?: string
  action?: {
    text: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const Empty: React.FC<EmptyProps> = ({
  variant = 'default',
  icon,
  title = t('ui.empty.title'),
  description = t('ui.empty.description'),
  action,
  className = '',
  size = 'md'
}) => {
  const variantConfig = {
    default: {
      icon: Database,
      iconClass: 'text-gray-400'
    },
    search: {
      icon: Search,
      iconClass: 'text-gray-400'
    },
    create: {
      icon: Plus,
      iconClass: 'text-gray-400'
    },
    error: {
      icon: FileX,
      iconClass: 'text-red-400'
    }
  }

  const sizeConfig = {
    sm: {
      container: 'py-8',
      icon: 'w-8 h-8',
      title: 'text-base',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-lg'
    }
  }

  const config = variantConfig[variant]
  const sizeClasses = sizeConfig[size]
  const IconComponent = icon || config.icon

  return (
    <div className={`
      flex flex-col items-center justify-center text-center
      ${sizeClasses.container}
      ${className}
    `}>
      <div className={`${config.iconClass} mb-4`}>
        <IconComponent className={sizeClasses.icon} />
      </div>
      
      <h3 className={`font-medium text-gray-900 mb-2 ${sizeClasses.title}`}>
        {title}
      </h3>
      
      <p className={`text-gray-600 mb-6 max-w-sm ${sizeClasses.description}`}>
        {description}
      </p>

      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.text}
        </Button>
      )}
    </div>
  )
}

export default Empty 