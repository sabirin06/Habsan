"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { loadAuth } from "@/lib/auth-storage"
import { toast } from "sonner"

const KEY = "travelpro:favorites:experiences"

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

export function useExperienceFavorites(experienceId: string) {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    setIds(safeParse(window.localStorage.getItem(KEY)))
  }, [])

  const isFavorite = useMemo(() => ids.includes(experienceId), [ids, experienceId])

  const toggle = useCallback(async () => {
    const next = isFavorite ? ids.filter((x) => x !== experienceId) : Array.from(new Set([...ids, experienceId]))
    setIds(next)
    save(next)

    toast.success(isFavorite ? "Removed from favorites" : "Saved to favorites")

    const auth = loadAuth()
    if (auth.isLoggedIn) {
      try {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ experienceId, favorite: !isFavorite })
        })
      } catch {
        // ignore
      }
    }
  }, [experienceId, ids, isFavorite])

  return { isFavorite, toggleFavorite: toggle, favorites: ids }
}

