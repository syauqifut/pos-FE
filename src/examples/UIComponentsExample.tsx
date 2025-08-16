import React, { useState } from 'react'
import { Plus, Edit, Trash, Download } from 'lucide-react'
import {
  Search,
  Form,
  Button,
  Modal,
  Alert,
  ConfirmDialog,
  Pagination,
  Loader,
  Empty
} from '../components/ui'

const UIComponentsExample = () => {
  const [searchValue, setSearchValue] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('Form submitted', e)
    setButtonLoading(true)
    setTimeout(() => setButtonLoading(false), 2000)
  }

  const handleConfirm = () => {
    console.log('Confirmed!')
    setShowConfirmDialog(false)
  }

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">UI Components Library</h1>
      </div>

      {/* Search Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Search Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Basic Search</label>
            <Search
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search users..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disabled Search</label>
            <Search
              disabled
              placeholder="Disabled search"
            />
          </div>
        </div>
      </section>

      {/* Button Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Button Component</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="success">Success</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Button icon={<Plus className="w-4 h-4" />}>With Icon</Button>
            <Button icon={<Download className="w-4 h-4" />} iconPosition="right">Icon Right</Button>
            <Button loading={buttonLoading} onClick={() => setButtonLoading(true)}>
              {buttonLoading ? 'Loading...' : 'Click to Load'}
            </Button>
          </div>
        </div>
      </section>

      {/* Alert Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Alert Component</h2>
        <div className="space-y-4">
          {showAlert && (
            <Alert
              variant="info"
              title="Welcome!"
              dismissible
              onDismiss={() => setShowAlert(false)}
            >
              This is an example of how to use the Alert component with dismissible functionality.
            </Alert>
          )}
          <Alert variant="success" title="Success">
            Your operation completed successfully.
          </Alert>
          <Alert variant="warning" title="Warning">
            Please review your settings before continuing.
          </Alert>
          <Alert variant="error" title="Error">
            An error occurred while processing your request.
          </Alert>
        </div>
      </section>

      {/* Form Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Form Component</h2>
        <div className="max-w-md">
          <Form onSubmit={handleFormSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" loading={buttonLoading} fullWidth>
              Submit Form
            </Button>
          </Form>
        </div>
      </section>

      {/* Modal Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Modal Component</h2>
        <div>
          <Button onClick={() => setShowModal(true)}>Open Modal</Button>
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Example Modal"
            actions={
              <>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowModal(false)}>
                  Save Changes
                </Button>
              </>
            }
          >
            <p className="text-gray-600">
              This is an example modal with a title, content, and action buttons.
              You can customize the size, behavior, and styling.
            </p>
          </Modal>
        </div>
      </section>

      {/* Confirm Dialog Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Confirm Dialog Component</h2>
        <div className="flex gap-3">
          <Button 
            variant="danger" 
            onClick={() => setShowConfirmDialog(true)}
            icon={<Trash className="w-4 h-4" />}
          >
            Delete Item
          </Button>
          <ConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleConfirm}
            title="Delete Confirmation"
            message="Are you sure you want to delete this item? This action cannot be undone."
            confirmText="Delete"
            variant="danger"
          />
        </div>
      </section>

      {/* Pagination Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Pagination Component</h2>
        <div className="space-y-4">
          <Pagination
            currentPage={currentPage}
            totalPages={10}
            onPageChange={setCurrentPage}
            showInfo
            totalItems={95}
            itemsPerPage={10}
          />
          <Pagination
            currentPage={3}
            totalPages={5}
            onPageChange={() => {}}
            showPageNumbers={false}
            className="justify-center"
          />
        </div>
      </section>

      {/* Loader Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Loader Component</h2>
        <div className="space-y-6">
          <div>
            <Button onClick={handleLoadingDemo} disabled={loading}>
              {loading ? 'Loading...' : 'Show Full Screen Loader'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Spinner</h4>
              <Loader variant="spinner" size="md" text="Loading..." />
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Dots</h4>
              <Loader variant="dots" size="md" text="Processing..." />
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Bars</h4>
              <Loader variant="bars" size="md" text="Analyzing..." />
            </div>
          </div>
        </div>

        {loading && (
          <Loader 
            fullScreen 
            size="lg" 
            text="Loading full screen demo..."
          />
        )}
      </section>

      {/* Empty Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Empty Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg">
            <Empty
              variant="default"
              title="No items found"
              description="There are no items to display at the moment."
              action={{
                text: "Add New Item",
                onClick: () => alert('Add new item clicked'),
                variant: 'primary'
              }}
            />
          </div>
          <div className="border rounded-lg">
            <Empty
              variant="search"
              title="No search results"
              description="Try adjusting your search terms or filters."
              size="sm"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default UIComponentsExample 