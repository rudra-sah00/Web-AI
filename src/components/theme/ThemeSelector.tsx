"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Sun, 
  Moon, 
  Laptop, 
  Palette,
  CircleDot,
  Sparkles,
  Zap,
  Flame,
  Cloud,
  Snowflake,
  Waves,
  Leaf,
  Gem
} from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface ThemeSelectorProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  collapsed?: boolean
}

const themes = [
  // Basic themes
  {
    id: "light",
    name: "Light",
    icon: Sun,
    category: "basic"
  },
  {
    id: "dark",
    name: "Dark",
    icon: Moon,
    category: "basic"
  },
  {
    id: "system",
    name: "System",
    icon: Laptop,
    category: "basic"
  },
  
  // Color themes
  {
    id: "blue",
    name: "Ocean Blue",
    icon: Waves,
    color: "text-blue-500",
    category: "color"
  },
  {
    id: "green",
    name: "Forest Green",
    icon: Leaf,
    color: "text-green-500",
    category: "color"
  },
  {
    id: "purple",
    name: "Royal Purple",
    icon: Gem,
    color: "text-purple-500",
    category: "color"
  },
  {
    id: "rose",
    name: "Rose Pink",
    icon: Flame,
    color: "text-rose-500",
    category: "color"
  },
  {
    id: "orange",
    name: "Sunset Orange",
    icon: Flame,
    color: "text-orange-500",
    category: "color"
  },
  
  // Special themes
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: Zap,
    color: "text-fuchsia-500",
    category: "special"
  },
  {
    id: "nord",
    name: "Nord",
    icon: Snowflake,
    color: "text-sky-400",
    category: "special"
  },
  {
    id: "dracula",
    name: "Dracula",
    icon: Sparkles,
    color: "text-purple-400",
    category: "special"
  }
]

export function ThemeSelector({ 
  variant = "ghost", 
  size = "icon", 
  className,
  collapsed = false
}: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true)
    
    // Apply theme-specific body classes for special themes
    if (document && document.body) {
      // First remove any existing theme classes
      document.body.classList.remove('theme-cyberpunk', 'theme-nord', 'theme-dracula')
      
      // Add the current theme class if it's a special theme
      if (theme === 'cyberpunk') {
        document.body.classList.add('theme-cyberpunk')
      } else if (theme === 'nord') {
        document.body.classList.add('theme-nord')
      } else if (theme === 'dracula') {
        document.body.classList.add('theme-dracula')
      }
    }
  }, [theme])
  
  // Use a default icon for server-side rendering
  // and before client-side hydration is complete
  if (!mounted) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={cn(
          "gap-2",
          className
        )}
      >
        <Palette className="h-4 w-4" />
        {!collapsed && <span>Theme</span>}
      </Button>
    )
  }
  
  // Find the current theme object
  const currentTheme = themes.find(t => t.id === theme) || themes.find(t => t.id === resolvedTheme) || themes[0]
  const ThemeIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={cn(
            "gap-2 relative overflow-hidden",
            className,
            currentTheme.id === "cyberpunk" && "border border-fuchsia-500 bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20",
            currentTheme.id === "dracula" && "border border-purple-500 bg-gradient-to-r from-purple-600/20 to-pink-600/20",
            currentTheme.id === "nord" && "border border-sky-500 bg-gradient-to-r from-sky-600/20 to-indigo-600/20"
          )}
        >
          <ThemeIcon className={cn(
            "h-4 w-4 relative z-10", 
            currentTheme.color,
            currentTheme.id === "cyberpunk" && "animate-pulse"
          )} />
          {!collapsed && <span className="ml-2 relative z-10">Theme</span>}
          
          {/* Background effects for special themes */}
          {currentTheme.id === "cyberpunk" && (
            <div className="absolute inset-0 bg-grid-small-white/10 bg-grid-small-white/5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Basic themes */}
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Basic Themes
        </div>
        {themes
          .filter(item => item.category === "basic")
          .map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  theme === item.id && "bg-accent"
                )}
              >
                <Icon className={cn("h-4 w-4", item.color)} />
                <span>{item.name}</span>
                {theme === item.id && (
                  <CircleDot className="h-3 w-3 ml-auto" />
                )}
              </DropdownMenuItem>
            )
          })}
          
        <DropdownMenuSeparator />
        
        {/* Color themes */}
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Color Themes
        </div>
        {themes
          .filter(item => item.category === "color")
          .map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  theme === item.id && "bg-accent"
                )}
              >
                <Icon className={cn("h-4 w-4", item.color)} />
                <span>{item.name}</span>
                {theme === item.id && (
                  <CircleDot className="h-3 w-3 ml-auto" />
                )}
              </DropdownMenuItem>
            )
          })}
          
        <DropdownMenuSeparator />
        
        {/* Special themes */}
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Special Themes
        </div>
        {themes
          .filter(item => item.category === "special")
          .map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => {
                  console.log('Setting special theme to:', item.id)
                  // Apply theme directly to HTML element
                  if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', item.id)
                    // Also set in localStorage for persistence
                    localStorage.setItem('theme', item.id)
                  }
                  setTheme(item.id)
                }}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  theme === item.id && "bg-accent",
                  item.id === "cyberpunk" && theme !== item.id && "bg-gradient-to-r from-fuchsia-600/10 to-cyan-600/10",
                  item.id === "dracula" && theme !== item.id && "bg-gradient-to-r from-purple-600/10 to-pink-600/10",
                  item.id === "nord" && theme !== item.id && "bg-gradient-to-r from-sky-600/10 to-indigo-600/10"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4", 
                  item.color,
                  item.id === "cyberpunk" && "animate-pulse"
                )} />
                <span>{item.name}</span>
                {theme === item.id && (
                  <CircleDot className="h-3 w-3 ml-auto" />
                )}
              </DropdownMenuItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}