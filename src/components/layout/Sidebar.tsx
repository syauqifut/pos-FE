import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { menuData } from '../../data/menuData'
import MenuGroup from './MenuGroup'
import { MenuState, MenuItem } from '../../types/menu'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [menuState, setMenuState] = useState<MenuState>({
    // expandedItems: new Set<string>(['setup', 'setup-user', 'setup-product']),
    expandedItems: new Set<string>(),
    activeItem: null
  })

  // Find active menu item based on current path
  const findActiveMenuItem = (items: MenuItem[], path: string): string | null => {
    for (const item of items) {
      if (item.path === path) {
        return item.id
      }
      if (item.children) {
        const found = findActiveMenuItem(item.children, path)
        if (found) return found
      }
    }
    return null
  }

  // Get all parent IDs for a given item ID
  const getParentIds = (items: MenuItem[], targetId: string, parentId?: string): string[] => {
    for (const item of items) {
      if (item.id === targetId) {
        return parentId ? [parentId] : []
      }
      if (item.children) {
        const found = getParentIds(item.children, targetId, item.id)
        if (found.length > 0) {
          return parentId ? [parentId, ...found] : found
        }
      }
    }
    return []
  }

  // Update active item and expand parents when route changes
  useEffect(() => {
    const activeItemId = findActiveMenuItem(menuData, location.pathname)
    if (activeItemId) {
      const parentIds = getParentIds(menuData, activeItemId)
      setMenuState(prev => ({
        ...prev,
        activeItem: activeItemId,
        expandedItems: new Set([...prev.expandedItems, ...parentIds])
      }))
    }
  }, [location.pathname])

  const handleToggle = (itemId: string) => {
    setMenuState(prev => {
      const newExpanded = new Set(prev.expandedItems)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      return {
        ...prev,
        expandedItems: newExpanded
      }
    })
  }

  const handleSelect = (itemId: string, path?: string) => {
    setMenuState(prev => ({
      ...prev,
      activeItem: itemId
    }))
    
    if (path) {
      navigate(path)
    }
  }

  return (
    <div className="w-52 bg-primary shadow-lg flex flex-col h-full z-0">
      {/* Navigation */}
      <nav 
        className="flex-1"
        role="navigation"
        aria-label="Main navigation"
      >
        <MenuGroup
          items={menuData}
          level={0}
          expandedItems={menuState.expandedItems}
          activeItem={menuState.activeItem}
          onToggle={handleToggle}
          onSelect={handleSelect}
        />
      </nav>
    </div>
  )
}

export default Sidebar 