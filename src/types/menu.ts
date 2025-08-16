import { LucideIcon } from 'lucide-react'

export interface MenuItem {
  id: string
  name: string
  path?: string // Optional - only leaf items have paths
  icon?: LucideIcon
  children?: MenuItem[]
  isExpandable?: boolean // Whether this item can be expanded
  isLabel?: boolean // Whether this item is just a label/separator
}

export interface MenuState {
  expandedItems: Set<string>
  activeItem: string | null
}

export interface MenuItemProps {
  item: MenuItem
  level: number
  isExpanded: boolean
  isActive: boolean
  onToggle: (itemId: string) => void
  onSelect: (itemId: string, path?: string) => void
}

export interface MenuGroupProps {
  items: MenuItem[]
  level: number
  expandedItems: Set<string>
  activeItem: string | null
  onToggle: (itemId: string) => void
  onSelect: (itemId: string, path?: string) => void
} 