import React, { useState } from 'react'
import { Button } from '../components/ui'
import { useLoginForm } from '../pages/auth/features/useLoginForm'
import { User, Lock } from 'lucide-react'
import { Form, Input, Alert } from '../components/ui'
import { t } from '../utils/i18n'

const LoginExample = () => {
  const [showDemo, setShowDemo] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  // Demo login form using the custom hook
  const {
    formData,
    errors,
    isSubmitting,
    setUsername,
    setPassword,
    clearError,
    handleSubmit
  } = useLoginForm({
    onSuccess: () => {
      alert('Login successful! 🎉\n\nIn a real app, you would be redirected to the dashboard.')
    },
    onError: (error) => {
      console.error('Demo login failed:', error)
    }
  })

  const handleShowLoadingDemo = async () => {
    setDemoLoading(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setDemoLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Login System Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Interactive demonstration of the login components and features
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => setShowDemo(!showDemo)}
              variant={showDemo ? 'outline' : 'primary'}
            >
              {showDemo ? 'Hide' : 'Show'} Interactive Demo
            </Button>
            <Button 
              onClick={handleShowLoadingDemo}
              variant="secondary"
              loading={demoLoading}
            >
              Demo Loading State
            </Button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Features List */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Form Validation</h3>
                  <p className="text-sm text-gray-600">Real-time validation with user-friendly error messages</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Loading States</h3>
                  <p className="text-sm text-gray-600">Smooth loading indicators during authentication</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Error Handling</h3>
                  <p className="text-sm text-gray-600">Clear error messages for failed login attempts</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Accessibility</h3>
                  <p className="text-sm text-gray-600">Full keyboard navigation and screen reader support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Responsive Design</h3>
                  <p className="text-sm text-gray-600">Works perfectly on desktop, tablet, and mobile</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Internationalization</h3>
                  <p className="text-sm text-gray-600">All text uses the translation system</p>
                </div>
              </div>
            </div>
          </div>

          {/* Component Architecture */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Component Architecture</h2>
            <div className="bg-white p-6 rounded-lg border">
              <div className="space-y-3 text-sm">
                <div className="font-mono text-gray-600">src/pages/auth/pages/</div>
                <div className="ml-4">
                  <div className="font-mono text-blue-600">├── Login.tsx</div>
                  <div className="ml-4 text-gray-500">Main login page</div>
                </div>
                
                <div className="font-mono text-gray-600">src/pages/auth/features/</div>
                <div className="ml-4">
                  <div className="font-mono text-blue-600">├── LoginForm.tsx</div>
                  <div className="ml-4 text-gray-500">Form logic & validation</div>
                </div>
                
                <div className="font-mono text-gray-600">src/components/ui/</div>
                <div className="ml-4">
                  <div className="font-mono text-green-600">├── Input/</div>
                  <div className="font-mono text-green-600">├── Button/</div>
                  <div className="font-mono text-green-600">├── Form/</div>
                  <div className="font-mono text-green-600">├── Alert/</div>
                  <div className="font-mono text-green-600">└── Loader/</div>
                  <div className="ml-4 text-gray-500">Reusable UI components</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        {showDemo && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Interactive Login Demo
            </h2>
                         <div className="max-w-md mx-auto">
               {/* Demo Form using the same hook structure */}
               <Form onSubmit={handleSubmit} className="space-y-6">
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

                 <Input
                   type="text"
                   label={t('auth.usernameLabel')}
                   placeholder={t('auth.usernamePlaceholder')}
                   value={formData.username}
                   onChange={(e) => setUsername(e.target.value)}
                   error={errors.username}
                   leftIcon={<User className="w-4 h-4" />}
                   disabled={isSubmitting || demoLoading}
                   required
                   fullWidth
                   autoFocus
                 />

                 <Input
                   type="password"
                   label={t('auth.passwordLabel')}
                   placeholder={t('auth.passwordPlaceholder')}
                   value={formData.password}
                   onChange={(e) => setPassword(e.target.value)}
                   error={errors.password}
                   leftIcon={<Lock className="w-4 h-4" />}
                   showPasswordToggle
                   disabled={isSubmitting || demoLoading}
                   required
                   fullWidth
                 />

                 <Button
                   type="submit"
                   variant="primary"
                   size="lg"
                   loading={isSubmitting || demoLoading}
                   loadingText={t('auth.signingIn')}
                   disabled={isSubmitting || demoLoading}
                   fullWidth
                 >
                   {t('auth.loginButton')}
                 </Button>
               </Form>
             </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Use</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>1. Try the demo above</strong> - Use the credentials shown in the yellow box to test the login flow.
            </p>
            <p>
              <strong>2. Test validation</strong> - Try submitting with empty fields or wrong credentials to see error handling.
            </p>
            <p>
              <strong>3. Check responsiveness</strong> - Resize your browser window to see how it adapts to different screen sizes.
            </p>
            <p>
              <strong>4. Test accessibility</strong> - Use Tab key to navigate through the form and try using a screen reader.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginExample 