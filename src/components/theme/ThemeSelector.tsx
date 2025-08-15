"use client"

import { useTheme } from "next-themes"
import { useAppearanceSettings } from "@/services/AppearanceSettingsService"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Moon, 
  Palette,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface ThemeSelectorProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  collapsed?: boolean
}

const darkThemes = [
  {
    id: "dark",
    name: "Midnight",
    description: "Pure black with gray accents",
    colors: {
      bg: "#000000",
      surface: "#1a1a1a", 
      accent: "#6b7280",
      text: "#ffffff"
    }
  },
  {
    id: "dark-slate",
    name: "Slate Dark",
    description: "Dark slate with blue accents", 
    colors: {
      bg: "#0f172a",
      surface: "#1e293b",
      accent: "#3b82f6", 
      text: "#f1f5f9"
    }
  },
  {
    id: "dark-zinc",
    name: "Zinc Dark",
    description: "Dark zinc with neutral accents",
    colors: {
      bg: "#09090b",
      surface: "#18181b",
      accent: "#a1a1aa",
      text: "#fafafa"
    }
  },
  {
    id: "dark-gray",
    name: "Charcoal",
    description: "Charcoal black with warm grays",
    colors: {
      bg: "#111111",
      surface: "#1f1f1f",
      accent: "#a3a3a3",
      text: "#f5f5f5"
    }
  }
]

export function ThemeSelector({ 
  variant = "ghost", 
  size = "icon", 
  className,
  collapsed = false
}: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()
  const { updateTheme } = useAppearanceSettings()
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  
  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true)
    
    // Set dark theme as default if no theme is selected
    if (!theme || theme === 'system' || theme === 'light') {
      setTheme('dark')
    }
  }, [theme, setTheme])
  
  // Get current theme info
  const currentTheme = darkThemes.find(t => t.id === theme) || darkThemes[0]
  
  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Moon className="h-4 w-4" />
        {!collapsed && <span className="ml-2">Theme</span>}
      </Button>
    )
  }

  const handleThemeSelect = async (themeId: string) => {
    setTheme(themeId)
    await updateTheme(themeId as any) // Save to JSON file
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={cn("gap-2", className)}>
          <Moon className="h-4 w-4" />
          {!collapsed && (
            <>
              <span>{currentTheme.name}</span>
              <Palette className="h-3 w-3 opacity-60" />
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Theme
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-3 mt-4">
          {darkThemes.map((themeOption) => (
            <div
              key={themeOption.id}
              onClick={() => handleThemeSelect(themeOption.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border-2",
                "hover:shadow-md",
                theme === themeOption.id 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              {/* Theme Preview */}
              <div className="flex-shrink-0">
                <div 
                  className="w-16 h-10 rounded-md border overflow-hidden relative"
                  style={{ backgroundColor: themeOption.colors.bg }}
                >
                  <div 
                    className="absolute top-0 left-0 w-full h-3"
                    style={{ backgroundColor: themeOption.colors.surface }}
                  />
                  <div 
                    className="absolute bottom-0 left-0 w-2/3 h-2"
                    style={{ backgroundColor: themeOption.colors.accent }}
                  />
                  <div 
                    className="absolute top-3 right-1 w-1 h-4 rounded-full"
                    style={{ backgroundColor: themeOption.colors.text }}
                  />
                </div>
              </div>
              
              {/* Theme Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{themeOption.name}</h3>
                  {theme === themeOption.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                
                {/* Color Palette */}
                <div className="flex items-center gap-1 mt-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.colors.bg }}
                    title="Background"
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.colors.surface }}
                    title="Surface"
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.colors.accent }}
                    title="Accent"
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.colors.text }}
                    title="Text"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}