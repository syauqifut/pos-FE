import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, LogOut } from 'lucide-react'
import { Dropdown, DropdownItem, Alert } from '../ui'
import { useAuth } from '../../hooks/useAuth'
import { t } from '../../utils/i18n'

const Topbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, logout, error, clearError, isLoading } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
      // Error is handled by useAuth hook
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  return (
    <>
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert
              variant="error"
              title={t('common.error')}
              dismissible
              onDismiss={clearError}
              className="border-0 bg-transparent"
            >
              {error}
            </Alert>
          </div>
        </div>
      )}

      <div className="w-full bg-white text-primary flex justify-between items-center py-2 px-3 shadow-sm z-10 relative">
      {/* Left - Logo */}
      <Link 
        to="/dashboard" 
          className="flex items-center hover:opacity-80 transition-opacity duration-200"
      >
          <span className="text-xl font-bold">{t('app.name')}</span>
      </Link>

      {/* Right - Date, Time, and User Info */}
      <div className="flex items-center space-x-2 text-sm font-medium">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
          <span>{formatDate(currentTime)}</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
          <span>{formatTime(currentTime)}</span>
        </div>
          <span>|</span>
          
          {/* User Dropdown */}
          {user ? (
            <Dropdown
              toggler={
                <span className="hover:text-primary/80 transition-colors duration-200">
                  {t('common.hi')}, {user.fullName}
                </span>
              }
              position="right"
              className="relative"
            >
              <DropdownItem
                onClick={handleLogout}
                disabled={isLoading}
                variant="danger"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoading ? t('auth.signingOut') : t('auth.logout')}</span>
              </DropdownItem>
            </Dropdown>
          ) : (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{t('auth.guest')}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Topbar 