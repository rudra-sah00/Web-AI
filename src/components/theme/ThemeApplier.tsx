// Theme test component to verify colors
"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeApplier() {
  const { theme } = useTheme()

  useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      const root = document.documentElement
      
      // Force apply the theme attribute
      root.setAttribute('data-theme', theme)
      
      // Also add theme class for extra compatibility
      root.className = root.className.replace(/theme-\S+/g, '')
      root.classList.add(`theme-${theme}`)
      
      console.log('Applied theme:', theme)
      console.log('Current data-theme:', root.getAttribute('data-theme'))
    }
  }, [theme])

  return null
}
