import React from 'react'
import { User, Lock } from 'lucide-react'
import { Form, Input, Button, Alert, Loader } from '../../../components/ui'
import { useLoginForm } from '../features/useLoginForm'
import { t } from '../../../utils/i18n'

const Login: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    isLoading,
    setUsername,
    setPassword,
    clearError,
    handleSubmit
  } = useLoginForm({
    onSuccess: () => {
      console.log('Login successful!')
      // Navigation is handled by useLoginForm hook
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })

  const isFormDisabled = isLoading || isSubmitting

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-3 shadow sm:rounded-lg sm:px-8">
          
          {/* Page Content */}
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('auth.loginTitle')}
              </h1>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="mb-6">
                <Loader 
                  size="md" 
                  text={t('auth.signingIn')}
                  className="py-8"
                />
              </div>
            )}

            {/* Login Form */}
            {!isLoading && (
              <Form onSubmit={handleSubmit} className="space-y-4">
                {/* General Error Alert */}
                {errors.general && (
                  <Alert
                    variant="error"
                    title={t('auth.loginFailed')}
                    dismissible
                    onDismiss={() => clearError('general')}
                  >
                    {errors.general}
                  </Alert>
                )}

                {/* Username Field */}
                <Input
                  type="text"
                  label={t('auth.usernameLabel')}
                  placeholder={t('auth.usernamePlaceholder')}
                  value={formData.username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={errors.username}
                  leftIcon={<User className="w-4 h-4" />}
                  disabled={isFormDisabled}
                  required
                  fullWidth
                  autoComplete="username"
                  autoFocus
                />

                {/* Password Field */}
                <Input
                  type="password"
                  label={t('auth.passwordLabel')}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  leftIcon={<Lock className="w-4 h-4" />}
                  showPasswordToggle
                  disabled={isFormDisabled}
                  required
                  fullWidth
                  autoComplete="current-password"
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  loadingText={t('auth.signingIn')}
                  disabled={isFormDisabled}
                  fullWidth
                >
                  {t('auth.loginButton')}
                </Button>
              </Form>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2024 POS System. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login 