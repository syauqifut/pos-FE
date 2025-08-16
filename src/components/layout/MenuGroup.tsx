import React from 'react'
import { MenuGroupProps } from '../../types/menu'
import MenuItemComponent from './MenuItemComponent'

const MenuGroup: React.FC<MenuGroupProps> = ({
  items,
  level,
  expandedItems,
  activeItem,
  onToggle,
  onSelect
}) => {
  return (
    <div className={`menu-group ${level > 0 ? 'nested' : ''}`}>
      {items.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          level={level}
          isExpanded={expandedItems.has(item.id)}
          isActive={activeItem === item.id}
          onToggle={onToggle}
          onSelect={onSelect}
          expandedItems={expandedItems}
          activeItem={activeItem}
        />
      ))}
    </div>
  )
}

export default MenuGroup 