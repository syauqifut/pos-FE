// Current language from environment
const envLang = import.meta.env.VITE_DEFAULT_LANGUAGE

// Dynamic import based on environment
const translations = await (async () => {
  try {
    return (await import(`../lang/${envLang}.json`)).default
  } catch (error) {
    throw new Error(`Language file not found: "lang/${envLang}.json". Check if file exists in src/lang/`)
  }
})()

/**
 * Translation function that safely accesses nested keys from the language JSON
 * @param key - Dot-separated key like 'sidebar.dashboard' or 'sales.newTransaction'
 * @param params - Optional object with interpolation parameters
 * @returns The translated string with interpolated values or the key itself if not found
 */
export const t = (key: string, params?: Record<string, any>): string => {
  try {
    const keys = key.split('.')
    let result: any = translations
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return key
      }
    }
    
    if (typeof result !== 'string') {
      return key
    }
    
    // If no params provided, return the string as-is
    if (!params) {
      return result
    }
    
    // Replace placeholders with actual values
    return result.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match
    })
  } catch {
    return key
  }
}
