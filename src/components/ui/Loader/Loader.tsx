import React from 'react'
import { Loader2 } from 'lucide-react'
import { t } from '../../../utils/i18n'

type LoaderSize = 'sm' | 'md' | 'lg' | 'xl'
type LoaderVariant = 'spinner' | 'dots' | 'bars'

interface LoaderProps {
  size?: LoaderSize
  variant?: LoaderVariant
  text?: string
  className?: string
  color?: string
  fullScreen?: boolean
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  text = t('ui.loader.loading'),
  className = '',
  color = 'text-primary',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const renderSpinner = () => (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${color}`} />
  )

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full bg-current animate-pulse ${
            size === 'sm' ? 'w-1 h-1' :
            size === 'md' ? 'w-1.5 h-1.5' :
            size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
          } ${color}`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )

  const renderBars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`bg-current animate-pulse ${
            size === 'sm' ? 'w-1' :
            size === 'md' ? 'w-1.5' :
            size === 'lg' ? 'w-2' : 'w-3'
          } ${color}`}
          style={{
            height: `${20 + (i % 2) * 10}px`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'bars':
        return renderBars()
      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen">
          {content}
        </div>
      </div>
    )
  }

  return content
}

export default Loader 