/**
 * Utilities for handling virtual keyboard behavior across different devices and browsers
 */

import React from 'react'

export interface KeyboardState {
  isVisible: boolean;
  height: number;
}

class KeyboardManager {
  private listeners: ((state: KeyboardState) => void)[] = []
  private currentState: KeyboardState = { isVisible: false, height: 0 }
  private initialViewportHeight: number

  constructor() {
    this.initialViewportHeight = window.innerHeight
    this.setupListeners()
  }

  private setupListeners() {
    // Listen for viewport changes
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDifference = this.initialViewportHeight - currentHeight
      
      // Consider keyboard visible if viewport shrunk by more than 150px
      const isKeyboardVisible = heightDifference > 150
      const keyboardHeight = isKeyboardVisible ? heightDifference : 0

      const newState: KeyboardState = {
        isVisible: isKeyboardVisible,
        height: keyboardHeight
      }

      // Only notify if state changed
      if (newState.isVisible !== this.currentState.isVisible || 
          newState.height !== this.currentState.height) {
        this.currentState = newState
        this.notifyListeners(newState)
      }
    }

    // Use visualViewport API if available (modern browsers)
    if ('visualViewport' in window && window.visualViewport) {
      (window.visualViewport as any).addEventListener('resize', handleResize)
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize)
      
      // Additional listeners for input focus/blur
      document.addEventListener('focusin', (e) => {
        if (this.isInputElement(e.target as Element)) {
          setTimeout(handleResize, 300) // Delay to allow keyboard animation
        }
      })

      document.addEventListener('focusout', (e) => {
        if (this.isInputElement(e.target as Element)) {
          setTimeout(handleResize, 300) // Delay to allow keyboard animation
        }
      })
    }
  }

  private isInputElement(element: Element): boolean {
    if (!element) return false
    
    const inputTypes = ['input', 'textarea', 'select']
    const tagName = element.tagName.toLowerCase()
    
    return inputTypes.includes(tagName) || 
           element.hasAttribute('contenteditable') ||
           element.closest('[contenteditable]') !== null
  }

  private notifyListeners(state: KeyboardState) {
    this.listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('Error in keyboard state listener:', error)
      }
    })
  }

  subscribe(listener: (state: KeyboardState) => void): () => void {
    this.listeners.push(listener)
    
    // Immediately call with current state
    listener(this.currentState)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  getCurrentState(): KeyboardState {
    return { ...this.currentState }
  }

  destroy() {
    if ('visualViewport' in window && window.visualViewport) {
      (window.visualViewport as any).removeEventListener('resize', this.setupListeners)
    } else {
      window.removeEventListener('resize', this.setupListeners)
    }
    this.listeners = []
  }
}

// Singleton instance
let keyboardManager: KeyboardManager | null = null

export function getKeyboardManager(): KeyboardManager {
  if (!keyboardManager) {
    keyboardManager = new KeyboardManager()
  }
  return keyboardManager
}

// React hook for easier integration
export function useKeyboardState(): KeyboardState {
  const [state, setState] = React.useState<KeyboardState>({ isVisible: false, height: 0 })
  
  React.useEffect(() => {
    const manager = getKeyboardManager()
    const unsubscribe = manager.subscribe(setState)
    
    return unsubscribe
  }, [])
  
  return state
}

// Helper function to apply keyboard-safe styling
export function applyKeyboardSafeStyles() {
  // Add CSS custom properties for JavaScript-based detection
  const updateCSSVariables = (state: KeyboardState) => {
    document.documentElement.style.setProperty(
      '--keyboard-height', 
      `${state.height}px`
    )
    document.documentElement.style.setProperty(
      '--keyboard-visible', 
      state.isVisible ? '1' : '0'
    )
  }

  const manager = getKeyboardManager()
  return manager.subscribe(updateCSSVariables)
}

// Initialize keyboard utilities
if (typeof window !== 'undefined') {
  // Auto-initialize on client side
  applyKeyboardSafeStyles()
}
