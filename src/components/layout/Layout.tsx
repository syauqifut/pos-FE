import { ReactNode } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import BottomNavigation from './BottomNavigation'
import Breadcrumb from '../ui/Breadcrumb/Breadcrumb'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Topbar */}
      <div className="hidden xl:block">
        <Topbar />
      </div>
      
      {/* Main content area with Sidebar and Page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on tablet and below, visible on desktop */}
        <div className="hidden xl:block">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Breadcrumb - positioned outside scrollable area */}
          <div className="hidden xl:block bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0 z-10">
            <Breadcrumb />
          </div>
          
          {/* Page content - scrollable area */}
          <div className="flex-1 overflow-auto pb-14">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <div className="block xl:hidden">
      {/* <div className="block"> */}
        <BottomNavigation />
      </div>
    </div>
  )
}

export default Layout 