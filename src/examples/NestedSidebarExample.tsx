import React from 'react'
import { Button } from '../components/ui'

const NestedSidebarExample = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Nested Sidebar Example</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Features */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🌟 Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Data-driven:</strong> All menus come from a predefined array</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Nested structure:</strong> Supports unlimited nesting levels</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Smart routing:</strong> Only leaf items are clickable</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Active highlighting:</strong> Shows current page</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Auto-expand:</strong> Opens parent menus for active page</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Accessible:</strong> Keyboard navigation & ARIA support</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Menu Structure</h2>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
              <div className="space-y-1">
                <div>📊 Dashboard</div>
                <div>🛒 Sales</div>
                <div>📦 Products</div>
                <div>📈 Reports</div>
                <div>⚙️ Set Up</div>
                <div className="ml-4">👥 User</div>
                <div className="ml-8">📋 User List</div>
                <div className="ml-4">📦 Product</div>
                <div className="ml-8">📦 Product</div>
                <div className="ml-8">🏷️ Category</div>
                <div className="ml-8">🏭 Manufacturer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testing */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🧪 Test Navigation</h2>
            <p className="text-gray-600 mb-4">Click these links to test the sidebar:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/sales'}
              >
                Sales
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/setup/user/list'}
              >
                User List
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/setup/product/product'}
              >
                Products
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/setup/product/category'}
              >
                Categories
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/setup/product/manufacturer'}
              >
                Manufacturers
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⌨️ Keyboard Controls</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <kbd className="bg-gray-100 px-2 py-1 rounded">Tab</kbd>
                <span className="text-gray-600">Navigate between items</span>
              </div>
              <div className="flex justify-between">
                <kbd className="bg-gray-100 px-2 py-1 rounded">Enter/Space</kbd>
                <span className="text-gray-600">Activate item</span>
              </div>
              <div className="flex justify-between">
                <kbd className="bg-gray-100 px-2 py-1 rounded">↑/↓</kbd>
                <span className="text-gray-600">Navigate menu</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Implementation Notes</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• TypeScript interfaces ensure type safety</li>
              <li>• Reusable components for scalability</li>
              <li>• CSS-in-JS with Tailwind utilities</li>
              <li>• Internationalization ready</li>
              <li>• Memory-efficient state management</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 Ready to Use!</h3>
        <p className="text-gray-700">
          The nested sidebar is now fully functional and integrated into your POS system. 
          All menu data is managed in <code className="bg-white px-2 py-1 rounded text-sm">src/data/menuData.ts</code> 
          and can be easily extended or modified.
        </p>
      </div>
    </div>
  )
}

export default NestedSidebarExample 