import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { t } from '../../../utils/i18n';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation();
  
  // Generate breadcrumb items from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with home
    breadcrumbs.push({
      label: t('common.home'),
      path: '/dashboard'
    });
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Map path segments to breadcrumb labels
      let label = '';
      switch (segment) {
        case 'dashboard':
          label = t('breadcrumb.dashboard');
          break;
        case 'setup':
          label = t('breadcrumb.setup');
          break;
        case 'user':
          label = t('breadcrumb.user');
          break;
        case 'product':
          label = t('breadcrumb.product');
          break;
        case 'category':
          label = t('breadcrumb.category');
          break;
        case 'manufacturer':
          label = t('breadcrumb.manufacturer');
          break;
        case 'inventory':
          label = t('breadcrumb.inventory');
          break;
        case 'stock':
          label = t('breadcrumb.stock');
          break;
        case 'conversion':
          label = t('breadcrumb.conversion');
          break;
        case 'conversionList':
          label = t('breadcrumb.conversionList');
          break;
        case 'create':
          label = pathSegments.includes('product') && !pathSegments.includes('category') && !pathSegments.includes('manufacturer') ? t('breadcrumb.productCreate') :
                  pathSegments.includes('category') ? t('breadcrumb.categoryCreate') :
                  pathSegments.includes('manufacturer') ? t('breadcrumb.manufacturerCreate') :
                  'Create';
          break;
        case 'edit':
          label = pathSegments.includes('product') && !pathSegments.includes('category') && !pathSegments.includes('manufacturer') ? t('breadcrumb.productEdit') :
                  pathSegments.includes('category') ? t('breadcrumb.categoryEdit') :
                  pathSegments.includes('manufacturer') ? t('breadcrumb.manufacturerEdit') :
                  'Edit';
          break;
        default:
          // Check if it's an ID (numeric)
          if (/^\d+$/.test(segment)) {
            label = pathSegments.includes('product') ? t('breadcrumb.productDetail') :
                    pathSegments.includes('category') ? t('breadcrumb.categoryDetail') :
                    pathSegments.includes('manufacturer') ? t('breadcrumb.manufacturerDetail') :
                    'Detail';
          } else {
            // Try to find a matching breadcrumb translation
            label = t(`breadcrumb.${segment}`) || segment;
          }
          break;
      }
      
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
        isCurrent: isLast
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = items || generateBreadcrumbs();
  
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          
          {item.path && !item.isCurrent ? (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-150 flex items-center"
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {item.label}
            </Link>
          ) : (
            <span 
              className={`flex items-center ${
                item.isCurrent 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-500'
              }`}
              aria-current={item.isCurrent ? 'page' : undefined}
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
} 