import React from 'react'
import { t, hasTranslation, getTranslations } from '../utils/i18n'

const TranslationExample = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Translation System Examples</h1>
      
      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Basic Translation Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">App Name</h3>
            <p className="text-sm text-gray-600">Key: app.name</p>
            <p className="font-medium">{t('app.name')}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Sidebar Items</h3>
            <p className="text-sm text-gray-600">Key: sidebar.dashboard</p>
            <p className="font-medium">{t('sidebar.dashboard')}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Sales Title</h3>
            <p className="text-sm text-gray-600">Key: sales.title</p>
            <p className="font-medium">{t('sales.title')}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Missing Key</h3>
            <p className="text-sm text-gray-600">Key: missing.key</p>
            <p className="font-medium text-red-600">{t('missing.key')}</p>
          </div>
        </div>
      </section>

      {/* Helper Functions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Helper Functions</h2>
        <div className="space-y-2">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Check if translation exists</h3>
            <p className="text-sm text-blue-700">hasTranslation('app.name'): {hasTranslation('app.name').toString()}</p>
            <p className="text-sm text-blue-700">hasTranslation('missing.key'): {hasTranslation('missing.key').toString()}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">All Available Categories</h3>
            <p className="text-sm text-green-700">
              {Object.keys(getTranslations()).join(', ')}
            </p>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Usage Guidelines</h2>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
          <h3 className="font-medium text-yellow-900 mb-2">Best Practices</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use descriptive, hierarchical keys (e.g., 'sidebar.dashboard')</li>
            <li>• Group related translations by context (app, auth, sidebar, etc.)</li>
            <li>• Keep keys consistent and avoid abbreviations</li>
            <li>• Always use the t() function for user-facing text</li>
            <li>• If a key is missing, the t() function returns the key itself</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default TranslationExample 