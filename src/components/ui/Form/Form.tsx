import React from 'react'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
  className?: string
}

const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  className = '',
  ...props
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-3 ${className}`}
      {...props}
    >
      {children}
    </form>
  )
}

export default Form 