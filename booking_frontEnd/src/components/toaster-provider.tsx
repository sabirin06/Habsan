"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"

export function ToasterProvider() {
  const { theme } = useTheme()
  const resolved = theme === "system" ? undefined : theme
  return (
    <Toaster
      theme={resolved as any}
      richColors
      toastOptions={{
        classNames: {
          toast: "clean-card border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl",
          title: "text-sm font-semibold",
          description: "text-xs text-muted-foreground",
          actionButton: "h-9 rounded-lg",
          cancelButton: "h-9 rounded-lg"
        }
      }}
    />
  )
}

