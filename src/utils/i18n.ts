import translations from '../lang/en.json'

/**
 * Translation function that safely accesses nested keys from the language JSON
 * @param key - Dot-separated key like 'sidebar.dashboard' or 'sales.newTransaction'
 * @returns The translated string or the key itself if not found
 */
export const t = (key: string): string => {
  try {
    // Split the key by dots to access nested properties
    const keys = key.split('.')
    
    // Navigate through the translation object
    let result: any = translations
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        // Key not found, return the original key
        return key
      }
    }
    
    // If the final result is a string, return it; otherwise return the key
    return typeof result === 'string' ? result : key
    
  } catch (error) {
    // In case of any error, return the original key
    console.warn(`Translation error for key "${key}":`, error)
    return key
  }
}

/**
 * Get all available translations (useful for debugging)
 */
export const getTranslations = () => translations

/**
 * Check if a translation key exists
 * @param key - Dot-separated key to check
 * @returns true if the key exists, false otherwise
 */
export const hasTranslation = (key: string): boolean => {
  try {
    const keys = key.split('.')
    let result: any = translations
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return false
      }
    }
    
    return typeof result === 'string'
  } catch {
    return false
  }
} 