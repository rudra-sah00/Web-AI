"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Log the themes being provided
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Available themes:', props.themes)
      
      // Force a re-render after mounting to ensure theme is applied
      const htmlElement = document.documentElement
      const currentTheme = htmlElement.getAttribute('data-theme')
      console.log('Current theme attribute:', currentTheme)
    }
  }, [props.themes])

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}