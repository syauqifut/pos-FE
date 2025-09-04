// Configuration utility for environment variables
// 
// To enable Android printer functionality:
// 1. Create a .env file in the project root
// 2. Add: VITE_USE_ANDROID_PRINTER=true
// 3. Restart the development server
//
// When enabled:
// - SaleSuccess bridge will be called after successful sales
// - Printer menu will be visible in Setup section
//
// When disabled:
// - No bridge calls will be made
// - Printer menu will be hidden
export const config = {
  // Android Printer Configuration
  USE_ANDROID_PRINTER: import.meta.env.VITE_USE_ANDROID_PRINTER ? true : false,
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Other configurations can be added here
} as const;

// Type for configuration
export type Config = typeof config;
