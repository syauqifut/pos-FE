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
 * @returns The translated string or the key itself if not found
 */
export const t = (key: string): string => {
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
    
    return typeof result === 'string' ? result : key
  } catch {
    return key
  }
}
