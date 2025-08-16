import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  required?: boolean
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  required = false,
  className = '',
  disabled = false,
  rows = 3,
  resize = 'vertical',
  ...props
}, ref) => {
  const hasError = !!error
  const hasLeftIcon = !!leftIcon
  const hasRightIcon = !!rightIcon || hasError

  const baseTextareaClasses = `
    block w-full px-2 py-1.5 border rounded-md text-sm
    placeholder-gray-400 text-gray-900
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    transition-colors duration-200
  `

  const stateClasses = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-primary focus:ring-primary'

  const paddingClasses = `
    ${hasLeftIcon ? 'pl-8' : 'pl-2'}
    ${hasRightIcon ? 'pr-8' : 'pr-2'}
  `

  const resizeClasses = {
    'none': 'resize-none',
    'vertical': 'resize-y',
    'horizontal': 'resize-x',
    'both': 'resize'
  }

  const containerWidth = fullWidth ? 'w-full' : ''

  return (
    <div className={`${containerWidth} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-0.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute top-2 left-0 pl-2 flex items-start pointer-events-none">
            <div className="text-gray-400 w-4 h-4">
              {leftIcon}
            </div>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          required={required}
          className={`
            ${baseTextareaClasses}
            ${stateClasses}
            ${paddingClasses}
            ${resizeClasses[resize]}
          `}
          {...props}
        />

        {/* Right Icons */}
        {hasRightIcon && (
          <div className="absolute top-2 right-0 pr-2 flex items-start">
            <div className="flex items-center space-x-1">
              {/* Error Icon */}
              {hasError && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              
              {/* Custom Right Icon */}
              {rightIcon && !hasError && (
                <div className="text-gray-400 w-4 h-4">
                  {rightIcon}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea 