"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { loadAuth } from "@/lib/auth-storage"
import { toast } from "sonner"

const KEY = "travelpro:favorites"

function safeParse(input: string | null): string[] {
  if (!input) return []
  try {
    const v = JSON.parse(input) as unknown
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

function save(ids: string[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(ids))
}

export function useFavorites(stayId: string) {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    setIds(safeParse(window.localStorage.getItem(KEY)))
  }, [])

  const isFavorite = useMemo(() => ids.includes(stayId), [ids, stayId])

  const toggle = useCallback(async () => {
    const next = isFavorite ? ids.filter((x) => x !== stayId) : Array.from(new Set([...ids, stayId]))
    setIds(next)
    save(next)

    toast.success(isFavorite ? "Removed from favorites" : "Saved to favorites")

    // If logged in, best-effort API sync (won't break if endpoint doesn't exist yet).
    const auth = loadAuth()
    if (auth.isLoggedIn) {
      try {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stayId, favorite: !isFavorite })
        })
      } catch {
        // ignore
      }
    }
  }, [ids, isFavorite, stayId])

  return { isFavorite, toggleFavorite: toggle, favorites: ids }
}

