import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { MenuItemProps } from '../../types/menu'


const MenuItemComponent: React.FC<MenuItemProps & {
  expandedItems?: Set<string>
  activeItem?: string | null
}> = ({
  item,
  level,
  isExpanded,
  isActive,
  onToggle,
  onSelect,
  expandedItems,
  activeItem
}) => {
  const hasChildren = item.children && item.children.length > 0
  const isClickable = !!item.path && !item.isLabel
  const isLabel = !!item.isLabel
  const Icon = item.icon

  const handleClick = (e: React.MouseEvent) => {
    if (isLabel) {
      e.preventDefault()
      return
    }
    if (hasChildren) {
      e.preventDefault()
      onToggle(item.id)
    } else if (item.path) {
      onSelect(item.id, item.path)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e as any)
    }
  }

  const getItemClasses = () => {
    if (isLabel) {
      return `
        menu-item menu-item-label
        flex items-center w-full text-left
        cursor-default
      `.trim()
    }
    
    const baseClasses = `
      menu-item
      flex items-center justify-between w-full text-left
      transition-colors duration-200 cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-1
    `
    
    const levelClasses = `menu-item-level-${level}`
    const activeClasses = isActive ? 'menu-item-active' : 'menu-item-inactive'
    const expandableClasses = hasChildren ? 'menu-item-expandable' : 'menu-item-leaf'
    
    return `${baseClasses} ${levelClasses} ${activeClasses} ${expandableClasses}`.trim()
  }

  const getIndentPadding = () => {
    // Reduced indentation for closer spacing
    switch (level) {
      case 0: return 'pl-2'   // 8px - top level
      case 1: return 'pl-4'  // 16px - first nested level 
      case 2: return 'pl-6'  // 24px - second nested level
      default: return `pl-${2 + (level * 2)}` // 8px increment for deeper levels
    }
  }

  const renderContent = () => {
    if (isLabel) {
      return (
        <div className={`${getItemClasses()} ${getIndentPadding()}`}>
          <div className="flex items-center space-x-2 flex-1 py-1">
            {Icon && (
              <Icon 
                className="w-4 h-4 flex-shrink-0 text-white/50" 
              />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 truncate">
              {item.name}
            </span>
          </div>
        </div>
      )
    }
    
    return (
      <div className={`${getItemClasses()} ${getIndentPadding()}`}>
        <div className="flex items-center space-x-2 flex-1 py-2">
          {Icon && (
            <Icon 
              className={`w-4 h-4 flex-shrink-0 ${
                level === 0 ? 'text-white/90' : 'text-white/70'
              }`} 
            />
          )}
          <span 
            className={`text-sm font-normal truncate ${
              level === 0 ? 'text-white' : 'text-white/90'
            }`}
          >
            {item.name}
          </span>
        </div>
        
        {hasChildren && (
          <div className="flex-shrink-0 mr-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-white/70" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white/70" />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="menu-item-container">
      {/* Menu Item */}
      {isLabel ? (
        <div className="block w-full">
          {renderContent()}
        </div>
      ) : isClickable ? (
        <Link
          to={item.path!}
          className="block w-full"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="menuitem"
          tabIndex={0}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren ? 'true' : undefined}
        >
          {renderContent()}
        </Link>
      ) : (
        <button
          type="button"
          className="block w-full"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role={hasChildren ? 'button' : 'menuitem'}
          tabIndex={0}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren ? 'true' : undefined}
        >
          {renderContent()}
        </button>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
                 <div className="menu-children">
           {item.children!.map((childItem) => (
             <MenuItemComponent
               key={childItem.id}
               item={childItem}
               level={level + 1}
               isExpanded={expandedItems?.has(childItem.id) || false}
               isActive={activeItem === childItem.id}
               onToggle={onToggle}
               onSelect={onSelect}
               expandedItems={expandedItems}
               activeItem={activeItem}
             />
           ))}
         </div>
      )}
    </div>
  )
}

export default MenuItemComponent 