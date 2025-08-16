import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Users,
  UserCheck,
  Package2,
  Tags,
  Building,
  Scale,
  List
} from 'lucide-react'
import { MenuItem } from '../types/menu'
import { t } from '../utils/i18n'

export const menuData: MenuItem[] = [
  {
    id: 'dashboard',
    name: t('sidebar.dashboard'),
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'reports',
    name: t('sidebar.reports'),
    path: '/reports',
    icon: BarChart3
  },
  {
    id: 'transaction',
    name: t('sidebar.transaction'),
    icon: ShoppingCart,
    isExpandable: true,
    children: [
      {
        id: 'list',
        name: t('sidebar.transactionList'),
        icon: List,
        path: '/transaction/list',
      },
      {
        id: 'purchase',
        name: t('sidebar.transactionPurchase'),
        icon: ShoppingCart,
        path: '/transaction/purchase',
      },
      {
        id: 'adjustment',
        name: t('sidebar.transactionAdjustment'),
        icon: ShoppingCart,
        path: '/transaction/adjustment',
      },
      {
        id: 'sale',
        name: t('sidebar.transactionSale'),
        icon: ShoppingCart,
        path: '/transaction/sale',
      },
    ]
  },
  {
    id: 'inventory',
    name: t('sidebar.inventory'),
    icon: Package,
    isExpandable: true,
    children: [
      {
        id: 'stock',
        name: t('sidebar.stock'),
        icon: Package2,
        path: '/inventory/stock',
      },
      {
        id: 'conversion',
        name: t('sidebar.conversion'),
        icon: Package2,
        path: '/inventory/conversion',
      },
    ]
  },
  {
    id: 'setup',
    name: t('sidebar.setup'),
    icon: Settings,
    isExpandable: true,
    children: [
      {
        id: 'setup-user-label',
        name: t('sidebar.setupUser'),
        icon: Users,
        isLabel: true
      },
      {
        id: 'setup-user-list',
        name: t('sidebar.setupUserList'),
        path: '/setup/user/list',
        icon: UserCheck
      },
      {
        id: 'setup-product-label',
        name: t('sidebar.setupProduct'),
        icon: Package2,
        isLabel: true
      },
      {
        id: 'setup-product',
        name: t('sidebar.setupProduct'),
        path: '/setup/product',
        icon: Package
      },
      {
        id: 'setup-product-category',
        name: t('sidebar.setupProductCategory'),
        path: '/setup/product/category',
        icon: Tags
      },
      {
        id: 'setup-product-manufacturer',
        name: t('sidebar.setupProductManufacturer'),
        path: '/setup/product/manufacturer',
        icon: Building
      },
      {
        id: 'setup-product-unit',
        name: t('sidebar.setupProductUnit'),
        path: '/setup/product/unit',
        icon: Scale
      }
    ]
  }
] 