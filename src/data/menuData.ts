import {
  ShoppingCart,
  Package,
  Settings,
  UserCheck,
  Package2,
  Tags,
  Building,
  Scale,
  List,
  Printer
} from 'lucide-react'
import { MenuItem } from '../types/menu'
import { t } from '../utils/i18n'
import { config } from '../utils/config'

// Function to generate menu data based on configuration
const generateMenuData = (): MenuItem[] => {
  const setupChildren: MenuItem[] = [
    {
      id: 'setup-user-list',
      name: t('sidebar.setupUserList'),
      path: '/setup/user/list',
      icon: UserCheck
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
  ];

  // Only add printer menu if Android printer is enabled
  if (config.USE_ANDROID_PRINTER) {
    setupChildren.push(
      {
        id: 'setup-device-printer',
        name: t('sidebar.setupDevicePrinter'),
        path: '/setup/device/printer',
        icon: Printer
      }
    );
  }

  return [
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
    {
      id: 'setup-product',
      name: t('sidebar.setupProduct'),
      path: '/setup/product',
      icon: Package
    },
    {
      id: 'setup',
      name: t('sidebar.setup'),
      icon: Settings,
      isExpandable: true,
      children: setupChildren
    }
  ];
};

export const menuData: MenuItem[] = generateMenuData(); 